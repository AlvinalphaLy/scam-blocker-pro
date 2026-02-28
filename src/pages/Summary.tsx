import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Target, CheckCircle, XCircle, Lightbulb, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const TIPS = [
  "Banks will never ask you to verify credentials via a link in a message.",
  "Urgency is the #1 tool scammers use — legitimate institutions give you time.",
  "Always navigate to official websites directly, never through provided links.",
  "If an offer sounds too good to be true, it almost certainly is.",
  "Verify the sender's identity through a separate, trusted channel.",
];

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    score: number;
    accuracy: number;
    flaggedTactics: string[];
    missedTactics: string[];
    streak: number;
    difficulty?: "easy" | "medium" | "hard";
  } | null;

  const score = state?.score ?? 0;
  const accuracy = state?.accuracy ?? 0;
  const flaggedTactics = state?.flaggedTactics ?? [];
  const missedTactics = state?.missedTactics ?? [];
  const streak = state?.streak ?? 0;
  const difficulty = state?.difficulty ?? "medium";

  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">(difficulty);

  const DIFFICULTY_OPTIONS = [
    { value: "easy" as const, label: "Easy", desc: "1 tactic, friendly", classes: "border-success text-success data-[active=true]:bg-success/10" },
    { value: "medium" as const, label: "Medium", desc: "2–3 tactics, moderate", classes: "border-warning text-warning data-[active=true]:bg-warning/10" },
    { value: "hard" as const, label: "Hard", desc: "3–4 tactics, aggressive", classes: "border-destructive text-destructive data-[active=true]:bg-destructive/10" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 box-glow-cyan mb-2">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-mono">
            Round <span className="text-primary text-glow-cyan">Complete</span>
          </h1>
          <p className="text-muted-foreground">Here's how you performed against the scam bot.</p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-card border border-border text-center">
            <Target className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold font-mono text-primary">{score}</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Score</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border text-center">
            <div className="text-3xl font-bold font-mono">{accuracy}%</div>
            <Progress value={accuracy} className="h-1.5 mt-2" />
            <p className="text-xs text-muted-foreground mt-2 font-mono uppercase">Accuracy</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border text-center col-span-2 md:col-span-1">
            <div className="text-3xl font-bold font-mono">{streak}</div>
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Best Streak</p>
          </div>
        </div>

        {/* Caught & Missed */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-card border border-border">
            <h3 className="font-mono font-bold text-sm mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" /> Correctly Caught
            </h3>
            {flaggedTactics.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">None caught</p>
            ) : (
              <div className="space-y-1.5">
                {flaggedTactics.map((t) => (
                  <div key={t} className="text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-5 rounded-xl bg-card border border-border">
            <h3 className="font-mono font-bold text-sm mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" /> Missed
            </h3>
            {missedTactics.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Nothing missed — perfect!</p>
            ) : (
              <div className="space-y-1.5">
                {missedTactics.map((t) => (
                  <div key={t} className="text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Best Response */}
        <div className="p-5 rounded-xl bg-secondary/50 border border-border">
          <h3 className="font-mono font-bold text-sm mb-2">💡 Best Possible Response</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            "I'm not clicking any links. I'll contact National Trust Bank directly through their official website or phone number on my card. If this is legitimate, they'll have a record of it."
          </p>
        </div>

        {/* Tips */}
        <div className="p-5 rounded-xl bg-card border border-border">
          <h3 className="font-mono font-bold text-sm mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-warning" /> Educational Tips
          </h3>
          <ul className="space-y-2">
            {TIPS.map((tip, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary font-mono text-xs mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground font-mono text-center uppercase tracking-wider">Select Difficulty</p>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                data-active={selectedDifficulty === opt.value}
                onClick={() => setSelectedDifficulty(opt.value)}
                className={`rounded-xl border-2 px-3 py-4 text-center transition-all font-mono ${opt.classes} ${
                  selectedDifficulty === opt.value ? "ring-2 ring-offset-2 ring-offset-background" : "opacity-60 hover:opacity-100"
                }`}
                style={selectedDifficulty === opt.value ? { ringColor: "currentColor" } : {}}
              >
                <div className="font-bold text-sm">{opt.label}</div>
                <div className="text-[10px] mt-1 text-muted-foreground">{opt.desc}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-center pt-1">
            <Button
              onClick={() => navigate("/game", { state: { difficulty: selectedDifficulty } })}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono px-8 group"
            >
              Play
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
