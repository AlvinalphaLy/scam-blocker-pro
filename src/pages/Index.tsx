import HeroSection from "@/components/HeroSection";
import StepCards from "@/components/StepCards";
import TacticsGrid from "@/components/TacticsGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StepCards />
      <TacticsGrid />
      <Footer />
    </div>
  );
};

export default Index;
