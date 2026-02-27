import { Clock, Shield, Package, AlertTriangle, Gift, KeyRound } from "lucide-react";

const tactics = [
  {
    icon: Clock,
    name: "False Urgency",
    description: "Creating artificial time pressure to force quick, irrational decisions.",
  },
  {
    icon: Shield,
    name: "Authority Impersonation",
    description: "Posing as trusted institutions like banks, government, or tech support.",
  },
  {
    icon: Package,
    name: "Scarcity",
    description: "Claiming limited availability to trigger fear of missing out.",
  },
  {
    icon: AlertTriangle,
    name: "Fear",
    description: "Using threats of account closure, legal action, or data loss.",
  },
  {
    icon: Gift,
    name: "Reward Bait",
    description: "Luring victims with prizes, refunds, or too-good-to-be-true offers.",
  },
  {
    icon: KeyRound,
    name: "Credential Harvesting",
    description: "Tricking users into revealing passwords, PINs, or personal data.",
  },
];

const TacticsGrid = () => {
  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <span className="text-primary font-mono text-sm tracking-widest uppercase">Tactics Library</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">Know Their Playbook</h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            These are the most common manipulation tactics used by scammers. Learn to spot them all.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tactics.map((tactic, i) => (
            <div
              key={tactic.name}
              className="group relative p-6 rounded-xl bg-card border border-border hover:border-glow transition-all duration-300 cursor-default hover:box-glow-cyan"
            >
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <tactic.icon className="w-5 h-5 text-destructive group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-bold text-lg mb-2 font-mono">{tactic.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{tactic.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TacticsGrid;
