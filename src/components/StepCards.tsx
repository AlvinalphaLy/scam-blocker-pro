import { MessageSquare, Flag, Trophy } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Chat with the scam bot",
    description: "Engage in realistic conversations with AI-powered scam simulations across various scenarios.",
  },
  {
    icon: Flag,
    step: "02",
    title: "Flag suspicious tactics",
    description: "Identify and flag manipulation techniques as they appear in real-time during the conversation.",
  },
  {
    icon: Trophy,
    step: "03",
    title: "Earn points & learn",
    description: "Get scored on accuracy, discover what you missed, and level up your scam detection skills.",
  },
];

const StepCards = () => {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <span className="text-primary font-mono text-sm tracking-widest uppercase">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">Three Steps to Scam-Proof Yourself</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className="relative group p-8 rounded-xl bg-card border border-border hover:border-glow transition-all duration-300 hover:box-glow-cyan"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-muted-foreground font-mono text-sm">{step.step}</span>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepCards;
