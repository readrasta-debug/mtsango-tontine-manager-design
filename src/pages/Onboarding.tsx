import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Shield, ChevronRight } from "lucide-react";

const slides = [
  {
    icon: Users,
    title: "Gérez vos tontines",
    description: "Organisez et suivez toutes vos tontines personnelles en un seul endroit",
    color: "text-secondary",
  },
  {
    icon: TrendingUp,
    title: "Suivez vos contributions",
    description: "Gardez trace de ce que vous avez donné et de ce que vous devez recevoir",
    color: "text-accent",
  },
  {
    icon: Shield,
    title: "Sécurisé et fiable",
    description: "Vos données sont sauvegardées et protégées en toute sécurité",
    color: "text-primary",
  },
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/login");
    }
  };

  const handleSkip = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip Button */}
      <div className="p-6 flex justify-end">
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Passer
        </Button>
      </div>

      {/* Slides */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center max-w-md"
          >
            <div className={`mb-8 p-6 rounded-3xl bg-muted ${slides[currentSlide].color}`}>
              {(() => {
                const Icon = slides[currentSlide].icon;
                return <Icon className="w-16 h-16" strokeWidth={1.5} />;
              })()}
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              {slides[currentSlide].title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="flex gap-2 mt-12">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-secondary"
                  : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Next Button */}
      <div className="p-6">
        <Button
          onClick={handleNext}
          className="w-full h-14 text-lg font-semibold rounded-2xl gradient-primary shadow-medium"
        >
          {currentSlide === slides.length - 1 ? "Commencer" : "Suivant"}
          <ChevronRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
