import { Progress } from "@/components/ui/progress";
import { Flame, Target, AlertTriangle, CheckCircle } from "lucide-react";

interface GameSidebarProps {
  score: number;
  accuracy: number;
  streak: number;
  riskLevel: number;
  flaggedTactics: string[];
}

const GameSidebar = ({ score, accuracy, streak, riskLevel, flaggedTactics }: GameSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Score */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground font-mono uppercase">Score</span>
          <Target className="w-4 h-4 text-primary" />
        </div>
        <p className="text-3xl font-bold font-mono text-primary text-glow-cyan">{score}</p>
      </div>

      {/* Accuracy */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground font-mono uppercase">Accuracy</span>
          <span className="text-lg font-bold font-mono">{accuracy}%</span>
        </div>
        <Progress value={accuracy} className="h-2 mt-2" />
      </div>

      {/* Streak */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono uppercase">Streak</span>
          <Flame className="w-4 h-4 text-warning" />
        </div>
        <p className="text-2xl font-bold font-mono">{streak}</p>
      </div>

      {/* Risk Meter */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-mono uppercase">Risk Meter</span>
          <AlertTriangle className={`w-4 h-4 ${riskLevel > 60 ? "text-destructive" : "text-warning"}`} />
        </div>
        <Progress
          value={riskLevel}
          className={`h-2 ${riskLevel > 60 ? "[&>div]:bg-destructive" : "[&>div]:bg-warning"}`}
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          {riskLevel > 60 ? "High risk — you're missing tactics!" : "Keep flagging to stay safe"}
        </p>
      </div>

      {/* Flagged Tactics */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <span className="text-xs text-muted-foreground font-mono uppercase">Tactics Caught</span>
        <div className="mt-3 space-y-2">
          {flaggedTactics.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No tactics flagged yet</p>
          )}
          {flaggedTactics.map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-3.5 h-3.5 text-success" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameSidebar;
