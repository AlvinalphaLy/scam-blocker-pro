import { Shield, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-px bg-primary/20 animate-scan-line" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-glow bg-secondary/50 mb-8">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono text-primary">SCAM DETECTION TRAINING</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
          <span className="text-foreground">Spot the Scam.</span>
          <br />
          <span className="text-primary text-glow-cyan">Beat the Bot.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Learn to detect real-world manipulation tactics in a safe interactive simulation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 box-glow-cyan font-mono text-base px-8 py-6 group"
            onClick={() => navigate("/game")}
          >
            Start Simulation
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-glow text-foreground hover:bg-secondary font-mono text-base px-8 py-6"
            onClick={scrollToHowItWorks}
          >
            How It Works
            <ChevronDown className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
