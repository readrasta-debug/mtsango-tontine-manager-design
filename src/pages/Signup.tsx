import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Lock, ArrowLeft } from "lucide-react";
import logo from "@/assets/mtsango-logo.png";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    pin: "",
    confirmPin: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est requis";
    } else if (!/^\+?[0-9\s-]{9,}$/.test(formData.phone)) {
      newErrors.phone = "Numéro de téléphone invalide";
    }

    if (!formData.pin) {
      newErrors.pin = "Le code PIN est requis";
    } else if (formData.pin.length !== 4) {
      newErrors.pin = "Le code PIN doit contenir 4 chiffres";
    }

    if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = "Les codes PIN ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = () => {
    if (validateForm()) {
      // TODO: Implement actual signup logic with backend
      navigate("/otp-verification");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/login")}
          className="mb-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        
        <div className="flex flex-col items-center">
          <img src={logo} alt="MTSANGO" className="w-20 h-20 mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
          <p className="text-muted-foreground text-center mt-2">
            Rejoignez MTSANGO pour gérer vos tontines
          </p>
        </div>
      </motion.div>

      {/* Signup Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 px-6 py-4"
      >
        <div className="space-y-5 max-w-md mx-auto">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
              Nom complet
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Mohamed Ali"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`pl-12 h-14 rounded-2xl border-border bg-card text-foreground ${
                  errors.name ? "border-destructive" : ""
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name}</p>
            )}
          </div>

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
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`pl-12 h-14 rounded-2xl border-border bg-card text-foreground ${
                  errors.phone ? "border-destructive" : ""
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-destructive text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Email Input (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email <span className="text-muted-foreground text-sm">(optionnel)</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-12 h-14 rounded-2xl border-border bg-card text-foreground"
              />
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-2">
            <Label htmlFor="pin" className="text-foreground font-medium">
              Code PIN (4 chiffres)
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="pin"
                type="password"
                placeholder="••••"
                value={formData.pin}
                onChange={(e) => handleInputChange("pin", e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                inputMode="numeric"
                className={`pl-12 h-14 rounded-2xl border-border bg-card text-foreground ${
                  errors.pin ? "border-destructive" : ""
                }`}
              />
            </div>
            {errors.pin && (
              <p className="text-destructive text-sm">{errors.pin}</p>
            )}
          </div>

          {/* Confirm PIN Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmPin" className="text-foreground font-medium">
              Confirmer le code PIN
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPin"
                type="password"
                placeholder="••••"
                value={formData.confirmPin}
                onChange={(e) => handleInputChange("confirmPin", e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                inputMode="numeric"
                className={`pl-12 h-14 rounded-2xl border-border bg-card text-foreground ${
                  errors.confirmPin ? "border-destructive" : ""
                }`}
              />
            </div>
            {errors.confirmPin && (
              <p className="text-destructive text-sm">{errors.confirmPin}</p>
            )}
          </div>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center px-4">
            En créant un compte, vous acceptez nos{" "}
            <span className="text-secondary font-medium">Conditions d'utilisation</span> et notre{" "}
            <span className="text-secondary font-medium">Politique de confidentialité</span>
          </p>

          {/* Signup Button */}
          <Button
            onClick={handleSignup}
            className="w-full h-14 text-lg font-semibold rounded-2xl gradient-primary shadow-medium mt-6"
          >
            Créer mon compte
          </Button>

          {/* Login Link */}
          <div className="text-center pt-4">
            <p className="text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Button
                variant="link"
                onClick={() => navigate("/login")}
                className="text-secondary p-0 h-auto font-semibold"
              >
                Se connecter
              </Button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
