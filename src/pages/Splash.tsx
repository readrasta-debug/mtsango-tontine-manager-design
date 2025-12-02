import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/mtsango-logo.png";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <motion.img
          src={logo}
          alt="MTSANGO"
          className="w-40 h-40"
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex gap-2"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Splash;
