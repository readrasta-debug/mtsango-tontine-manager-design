import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/mtsango-logo.png";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.name,
      phone: formData.phone
    });
    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Compte existant",
          description: "Un compte avec cet email existe déjà. Veuillez vous connecter.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Compte créé!",
        description: "Bienvenue sur MTSANGO!"
      });
      navigate("/dashboard");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
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
        className="flex-1 px-6 py-4 overflow-auto"
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
              Numéro de téléphone <span className="text-muted-foreground text-sm">(optionnel)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+269 771 23 45"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="pl-12 h-14 rounded-2xl border-border bg-card text-foreground"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`pl-12 h-14 rounded-2xl border-border bg-card text-foreground ${
                  errors.email ? "border-destructive" : ""
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              Mot de passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`pl-12 h-14 rounded-2xl border-border bg-card text-foreground ${
                  errors.password ? "border-destructive" : ""
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground font-medium">
              Confirmer le mot de passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={`pl-12 h-14 rounded-2xl border-border bg-card text-foreground ${
                  errors.confirmPassword ? "border-destructive" : ""
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">{errors.confirmPassword}</p>
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
            disabled={loading}
            className="w-full h-14 text-lg font-semibold rounded-2xl gradient-primary shadow-medium mt-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : null}
            Créer mon compte
          </Button>

          {/* Login Link */}
          <div className="text-center pt-4 pb-8">
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
