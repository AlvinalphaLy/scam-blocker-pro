import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, RotateCcw, Send, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ChatMessage from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";
import FlagTacticModal from "@/components/FlagTacticModal";
import GameSidebar from "@/components/GameSidebar";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";

// --- Helpers ---

interface MessageOverride {
  flagged?: boolean;
  feedbackText?: string;
}

type Part = { type: string; text?: string };

// The model prepends every response with:
//   TACTICS: Tactic1, Tactic2
//   ---
//   Actual message text...
// These helpers parse that format.

function getRawText(parts: Part[]): string {
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

function getMessageText(parts: Part[]): string {
  const raw = getRawText(parts);
  const sep = raw.indexOf("\n---\n");
  if (sep !== -1) return raw.slice(sep + 5).trim();
  // Still streaming the TACTICS header — hide until the separator arrives
  if (raw.trimStart().startsWith("TACTICS:")) return "";
  return raw.trim();
}

function getMessageTactics(parts: Part[]): string[] {
  const raw = getRawText(parts);
  const match = raw.match(/^TACTICS:\s*(.+?)(?:\n|$)/);
  if (!match) return [];
  return match[1].split(",").map((t) => t.trim()).filter(Boolean);
}

const QUICK_RESPONSES = [
  "Ask for verification",
  "Refuse",
  "Request official website",
];

// Hard cap — prevents runaway agent loops. Game ends manually via Finish button.
const AGENT_MESSAGE_HARD_LIMIT = 20;

const DIFFICULTY_LABELS: Record<string, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
const DIFFICULTY_CLASSES: Record<string, string> = {
  easy: "border-success text-success",
  medium: "border-warning text-warning",
  hard: "border-destructive text-destructive",
};

const GameScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const difficulty = (location.state as { difficulty?: string } | null)?.difficulty ?? "medium";

  // Stable session ID — persists across React 19 Suspense unmount/remount cycles.
  // Stored as state so updating it (on restart) causes useAgent to reconnect to a new Durable Object.
  const [sessionId, setSessionId] = useState(() => {
    const key = "scam-game-session-id";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  });

  // UI-only overrides layered on top of agent messages (flags, feedback)
  const [overrides, setOverrides] = useState<Map<string, MessageOverride>>(new Map());
  const [input, setInput] = useState("");
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagTargetId, setFlagTargetId] = useState<string | null>(null);

  // Scoring
  const [score, setScore] = useState(0);
  const [correctFlags, setCorrectFlags] = useState(0);
  const [totalFlags, setTotalFlags] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flaggedTactics, setFlaggedTactics] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const gameStartedRef = useRef(false);
  // Ref so onOpen can call sendMessage without a circular dep on useAgentChat
  const sendMessageRef = useRef<((msg: { text: string }) => void) | null>(null);

  // Connect to the Cloudflare ScamAgent Durable Object.
  // Only send __GAME_START__ once the WebSocket is actually open — this prevents
  // firing into a closed socket and causing the flood of /get-messages requests.
  const agent = useAgent({
    agent: "ScamAgent",
    name: sessionId,
    onOpen: () => {
      if (!gameStartedRef.current) {
        gameStartedRef.current = true;
        sendMessageRef.current?.({ text: `__GAME_START__:${difficulty}` });
      }
    },
  });

  // null is the library's sentinel: skips the /get-messages fetch AND the internal use() call
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { messages, sendMessage, clearHistory, status } = useAgentChat({
    agent,
    getInitialMessages: null as any,
  });

  // Keep the ref in sync so onOpen always has the latest sendMessage
  sendMessageRef.current = sendMessage;

  // --- Derived ---

  // Hide the hidden game-start trigger from the UI
  const displayMessages = useMemo(
    () =>
      messages.filter(
        (m) =>
          !(m.role === "user" && getMessageText(m.parts as Part[]).startsWith("__GAME_START__"))
      ),
    [messages]
  );

  const botMessages = useMemo(
    () =>
      displayMessages.filter(
        (m) => m.role === "assistant" && getMessageText(m.parts as Part[]).trim().length > 0
      ),
    [displayMessages]
  );

  const accuracy = totalFlags > 0 ? Math.round((correctFlags / totalFlags) * 100) : 100;

  // Risk = % of bot messages not yet flagged (flags all → risk 0, flags none → risk 100)
  const riskLevel = useMemo(() => {
    if (botMessages.length === 0) return 0;
    const unflagged = botMessages.filter((m) => !overrides.get(m.id)?.flagged).length;
    return Math.round((unflagged / botMessages.length) * 100);
  }, [botMessages, overrides]);

  // --- Effects ---

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, status]);

  // --- Handlers ---

  const gameOver = botMessages.length >= AGENT_MESSAGE_HARD_LIMIT;

  const handleFinish = () => {
    const allBotTactics = botMessages.flatMap((m) => getMessageTactics(m.parts as Part[]));
    const missed = [...new Set(allBotTactics.filter((t) => !flaggedTactics.includes(t)))];
    navigate("/summary", {
      state: { score, accuracy, flaggedTactics, missedTactics: missed, streak, difficulty },
    });
  };

  const handleSend = (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || status === "streaming" || gameOver) return;
    sendMessage({ text: msgText });
    setInput("");
  };

  const handleFlag = (msgId: string) => {
    setFlagTargetId(msgId);
    setFlagModalOpen(true);
  };

  const handleFlagSubmit = (selectedTactics: string[]) => {
    if (!flagTargetId) return;

    const targetMsg = messages.find((m) => m.id === flagTargetId);
    if (!targetMsg) return;

    const correctTactics = getMessageTactics(targetMsg.parts as Part[]);
    const correct = selectedTactics.filter((t) => correctTactics.includes(t));
    const isCorrect = correct.length > 0;

    setTotalFlags((prev) => prev + selectedTactics.length);
    setCorrectFlags((prev) => prev + correct.length);

    if (isCorrect) {
      setScore((prev) => prev + correct.length * 100);
      setStreak((prev) => prev + 1);
      setFlaggedTactics((prev) => [...new Set([...prev, ...correct])]);
    } else {
      setStreak(0);
    }

    const feedback = isCorrect
      ? `✓ Correct! You identified: ${correct.join(", ")}`
      : `✗ Not quite. The tactics were: ${correctTactics.join(", ")}`;

    setOverrides((prev) => {
      const next = new Map(prev);
      // Only mark as flagged (reducing risk) on a correct identification.
      // Wrong flags show feedback but leave the message re-flaggable.
      next.set(flagTargetId, { flagged: isCorrect, feedbackText: feedback });
      return next;
    });
  };

  const handleRestart = () => {
    // New session ID so the next game gets a fresh Durable Object.
    // Setting sessionId state causes useAgent to reconnect, which fires onOpen → __GAME_START__.
    const newId = crypto.randomUUID();
    sessionStorage.setItem("scam-game-session-id", newId);
    setOverrides(new Map());
    setInput("");
    setScore(0);
    setCorrectFlags(0);
    setTotalFlags(0);
    setStreak(0);
    setFlaggedTactics([]);
    gameStartedRef.current = false;
    clearHistory();
    setSessionId(newId);
  };

  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // --- Render ---

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-mono font-bold">Bank Account Alert</span>
          <Badge variant="outline" className={`font-mono text-[10px] ${DIFFICULTY_CLASSES[difficulty]}`}>
            {DIFFICULTY_LABELS[difficulty]}
          </Badge>
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                status === "streaming"
                  ? "bg-warning animate-pulse"
                  : "bg-success animate-pulse-glow"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {status === "streaming" ? "Responding…" : "Connected"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFinish}
            disabled={botMessages.length === 0}
            className="gap-1.5 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-mono text-xs"
          >
            <Flag className="w-3.5 h-3.5" />
            Finish
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-2xl mx-auto">
              {(() => {
                let botCount = 0;
                return displayMessages.map((msg) => {
                  const text = getMessageText(msg.parts as Part[]);
                  if (!text.trim()) return null;
                  // Cap bot messages at the game limit — ignore any extras from agent loops
                  if (msg.role === "assistant") {
                    botCount++;
                    if (botCount > AGENT_MESSAGE_HARD_LIMIT) return null;
                  }
                  const override = overrides.get(msg.id);
                  return (
                    <ChatMessage
                      key={msg.id}
                      sender={msg.role === "assistant" ? "bot" : "user"}
                      text={text}
                      timestamp={getTime()}
                      flagged={override?.flagged}
                      feedbackText={override?.feedbackText}
                      onFlag={msg.role === "assistant" ? () => handleFlag(msg.id) : undefined}
                    />
                  );
                });
              })()}
              {status === "streaming" && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Quick Responses */}
          <div className="px-4 md:px-6 pb-2">
            <div className="max-w-2xl mx-auto flex gap-2 flex-wrap">
              {QUICK_RESPONSES.map((qr) => (
                <button
                  key={qr}
                  onClick={() => handleSend(qr)}
                  disabled={status === "streaming" || gameOver}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-glow transition-colors font-mono disabled:opacity-40"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 md:px-6 border-t border-border">
            <div className="max-w-2xl mx-auto flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your response…"
                disabled={status === "streaming" || gameOver}
                className="bg-secondary border-border focus:border-primary font-sans"
              />
              <Button
                onClick={() => handleSend()}
                size="icon"
                disabled={status === "streaming" || gameOver}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block w-72 border-l border-border p-4 overflow-y-auto bg-card/30">
          <GameSidebar
            score={score}
            accuracy={accuracy}
            streak={streak}
            riskLevel={riskLevel}
            flaggedTactics={flaggedTactics}
          />
        </aside>
      </div>

      <FlagTacticModal
        open={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        onSubmit={handleFlagSubmit}
      />
    </div>
  );
};

export default GameScreen;
