import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const TACTICS = [
  "False Urgency",
  "Authority",
  "Scarcity",
  "Fear",
  "Reward Bait",
  "Impersonation",
  "Suspicious Link",
];

interface FlagTacticModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tactics: string[]) => void;
}

const FlagTacticModal = ({ open, onClose, onSubmit }: FlagTacticModalProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (tactic: string) => {
    setSelected((prev) =>
      prev.includes(tactic) ? prev.filter((t) => t !== tactic) : [...prev, tactic]
    );
  };

  const handleSubmit = () => {
    onSubmit(selected);
    setSelected([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg">Flag Tactic</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {TACTICS.map((tactic) => (
            <label
              key={tactic}
              className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Checkbox
                checked={selected.includes(tactic)}
                onCheckedChange={() => toggle(tactic)}
              />
              <span className="text-sm">{tactic}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={selected.length === 0}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
          >
            Submit Flag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlagTacticModal;
