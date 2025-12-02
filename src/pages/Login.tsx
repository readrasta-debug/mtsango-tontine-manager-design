import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Lock } from "lucide-react";
import logo from "@/assets/mtsango-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 flex flex-col items-center"
      >
        <img src={logo} alt="MTSANGO" className="w-24 h-24 mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Bienvenue sur MTSANGO</h1>
        <p className="text-muted-foreground text-center mt-2">
          Connectez-vous pour gérer vos tontines
        </p>
      </motion.div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 px-6 py-8"
      >
        <div className="space-y-6 max-w-md mx-auto">
          {/* Phone Input */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground font-medium">
              Numéro de téléphone
            </Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+269 771 23 45"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-border bg-card text-foreground"
              />
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-2">
            <Label htmlFor="pin" className="text-foreground font-medium">
              Code PIN
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="pin"
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                className="pl-12 h-14 rounded-2xl border-border bg-card text-foreground"
              />
            </div>
          </div>

          {/* Forgot PIN */}
          <div className="flex justify-end">
            <Button variant="link" className="text-secondary p-0 h-auto">
              Code PIN oublié ?
            </Button>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full h-14 text-lg font-semibold rounded-2xl gradient-primary shadow-medium mt-8"
          >
            Se connecter
          </Button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-muted-foreground">
              Pas encore de compte ?{" "}
              <Button
                variant="link"
                onClick={() => navigate("/signup")}
                className="text-secondary p-0 h-auto font-semibold"
              >
                Créer un compte
              </Button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
