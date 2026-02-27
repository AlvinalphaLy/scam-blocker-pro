import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ChatMessage from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";
import FlagTacticModal from "@/components/FlagTacticModal";
import GameSidebar from "@/components/GameSidebar";

interface Message {
  id: number;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  tactics?: string[];
  flagged?: boolean;
  feedbackText?: string;
}

const SCENARIO = {
  name: "Bank Account Alert",
  difficulty: "Medium",
  messages: [
    {
      text: "⚠️ URGENT: This is the Security Department of National Trust Bank. We've detected unauthorized access to your account ending in **4829**.",
      tactics: ["Authority", "Fear"],
      delay: 1000,
    },
    {
      text: "Your account will be PERMANENTLY LOCKED within the next 15 minutes unless you verify your identity immediately. This is time-sensitive.",
      tactics: ["False Urgency", "Fear"],
      delay: 3000,
    },
    {
      text: "Please click this secure link to verify: https://national-trust-secure-verify.com/auth and enter your account credentials to prevent suspension.",
      tactics: ["Suspicious Link", "Impersonation"],
      delay: 3000,
    },
    {
      text: "I understand your concern. Only 3 customers received this priority alert today. As a valued customer, we're offering a $50 security credit once verified.",
      tactics: ["Scarcity", "Reward Bait"],
      delay: 3000,
    },
    {
      text: "If you don't respond within the next 5 minutes, we'll have to report this as a compromised account to the federal authorities. Please act now.",
      tactics: ["Fear", "False Urgency", "Authority"],
      delay: 3000,
    },
  ],
};

const getTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const QUICK_RESPONSES = [
  "Ask for verification",
  "Refuse",
  "Request official website",
];

const GameScreen = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [botIndex, setBotIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagTargetId, setFlagTargetId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctFlags, setCorrectFlags] = useState(0);
  const [totalFlags, setTotalFlags] = useState(0);
  const [streak, setStreak] = useState(0);
  const [riskLevel, setRiskLevel] = useState(0);
  const [flaggedTactics, setFlaggedTactics] = useState<string[]>([]);
  const [missedTactics, setMissedTactics] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  // Send next bot message
  const sendBotMessage = (index: number) => {
    if (index >= SCENARIO.messages.length) {
      // Game over
      setTimeout(() => {
        navigate("/summary", {
          state: {
            score,
            accuracy: totalFlags > 0 ? Math.round((correctFlags / totalFlags) * 100) : 0,
            flaggedTactics,
            missedTactics: getMissedTactics(),
            streak,
          },
        });
      }, 1500);
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const msg: Message = {
        id: Date.now(),
        sender: "bot",
        text: SCENARIO.messages[index].text,
        tactics: SCENARIO.messages[index].tactics,
        timestamp: getTime(),
      };
      setMessages((prev) => [...prev, msg]);
      setBotIndex(index + 1);

      // Increase risk if previous bot message wasn't flagged
      if (index > 0) {
        const prevBotMsg = messages.filter((m) => m.sender === "bot").at(-1);
        if (prevBotMsg && !prevBotMsg.flagged) {
          setRiskLevel((prev) => Math.min(100, prev + 15));
          // Track missed tactics
          if (prevBotMsg.tactics) {
            setMissedTactics((prev) => [...prev, ...prevBotMsg.tactics!.filter((t) => !prev.includes(t))]);
          }
        }
      }
    }, SCENARIO.messages[index].delay);
  };

  const getMissedTactics = () => {
    const allTactics = SCENARIO.messages.flatMap((m) => m.tactics);
    return [...new Set(allTactics.filter((t) => !flaggedTactics.includes(t)))];
  };

  // Start the game
  useEffect(() => {
    sendBotMessage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: msgText,
      timestamp: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Trigger next bot message
    setTimeout(() => sendBotMessage(botIndex), 800);
  };

  const handleFlag = (msgId: number) => {
    setFlagTargetId(msgId);
    setFlagModalOpen(true);
  };

  const handleFlagSubmit = (selectedTactics: string[]) => {
    const targetMsg = messages.find((m) => m.id === flagTargetId);
    if (!targetMsg || !targetMsg.tactics) return;

    const correct = selectedTactics.filter((t) => targetMsg.tactics!.includes(t));
    const isCorrect = correct.length > 0;

    setTotalFlags((prev) => prev + selectedTactics.length);
    setCorrectFlags((prev) => prev + correct.length);

    if (isCorrect) {
      setScore((prev) => prev + correct.length * 100);
      setStreak((prev) => prev + 1);
      setRiskLevel((prev) => Math.max(0, prev - 10));
      setFlaggedTactics((prev) => [...new Set([...prev, ...correct])]);
    } else {
      setStreak(0);
    }

    const feedback = isCorrect
      ? `✓ Correct! You identified: ${correct.join(", ")}`
      : `✗ Not quite. The tactics here were: ${targetMsg.tactics.join(", ")}`;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === flagTargetId ? { ...m, flagged: true, feedbackText: feedback } : m
      )
    );
  };

  const handleRestart = () => {
    setMessages([]);
    setBotIndex(0);
    setScore(0);
    setCorrectFlags(0);
    setTotalFlags(0);
    setStreak(0);
    setRiskLevel(0);
    setFlaggedTactics([]);
    setMissedTactics([]);
    setTimeout(() => sendBotMessage(0), 300);
  };

  const accuracy = totalFlags > 0 ? Math.round((correctFlags / totalFlags) * 100) : 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-mono font-bold">{SCENARIO.name}</span>
          <Badge variant="outline" className="border-warning text-warning font-mono text-[10px]">
            {SCENARIO.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-xs text-muted-foreground">Connected</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRestart} className="text-muted-foreground hover:text-foreground">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-2xl mx-auto">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  sender={msg.sender}
                  text={msg.text}
                  timestamp={msg.timestamp}
                  flagged={msg.flagged}
                  feedbackText={msg.feedbackText}
                  onFlag={msg.sender === "bot" ? () => handleFlag(msg.id) : undefined}
                />
              ))}
              {isTyping && <TypingIndicator />}
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
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-glow transition-colors font-mono"
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
                placeholder="Type your response..."
                className="bg-secondary border-border focus:border-primary font-sans"
              />
              <Button
                onClick={() => handleSend()}
                size="icon"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - desktop only */}
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
