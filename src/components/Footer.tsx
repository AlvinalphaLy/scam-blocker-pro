import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-mono font-bold text-lg">ScamShield</span>
          </div>

          <nav className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
            <span className="text-primary font-mono">⚠ EDUCATIONAL USE ONLY</span> — This platform simulates scam conversations for training purposes. 
            No real personal data is collected or at risk. All scenarios are fictional.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
