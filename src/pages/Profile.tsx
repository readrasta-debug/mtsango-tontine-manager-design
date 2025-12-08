import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, User, Phone, Save, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  phone: z
    .string()
    .trim()
    .min(8, "Le numéro doit contenir au moins 8 chiffres")
    .max(20, "Le numéro ne peut pas dépasser 20 caractères")
    .regex(/^[+]?[\d\s-]+$/, "Format de numéro invalide"),
});

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ full_name?: string; phone?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Set initial values when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { full_name: string; phone: string }) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setShowSuccess(true);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées",
      });
      setTimeout(() => setShowSuccess(false), 2000);
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = profileSchema.safeParse({ full_name: fullName, phone });
    
    if (!result.success) {
      const fieldErrors: { full_name?: string; phone?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as "full_name" | "phone";
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    updateMutation.mutate({ full_name: result.data.full_name, phone: result.data.phone });
  };

  const userInitials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary p-6 pb-24 rounded-b-[2rem]"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-white text-2xl font-bold">Mon profil</h1>
        </div>
      </motion.div>

      {/* Avatar Card */}
      <div className="px-6 -mt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border-0 shadow-medium bg-card">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-soft">
                <span className="text-white text-3xl font-bold">{userInitials}</span>
              </div>
              <h2 className="text-card-foreground text-xl font-bold">
                {fullName || "Utilisateur"}
              </h2>
              <p className="text-muted-foreground text-sm">{phone || "Aucun numéro"}</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Form */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground font-medium">
                Nom complet
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom complet"
                  className={`h-14 pl-12 rounded-xl text-base ${
                    errors.full_name ? "border-destructive" : ""
                  }`}
                />
              </div>
              {errors.full_name && (
                <p className="text-destructive text-sm">{errors.full_name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-medium">
                Numéro de téléphone
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+269 3XX XX XX"
                  className={`h-14 pl-12 rounded-xl text-base ${
                    errors.phone ? "border-destructive" : ""
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-destructive text-sm">{errors.phone}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={updateMutation.isPending || showSuccess}
              className="w-full h-14 text-lg font-semibold rounded-2xl bg-secondary hover:bg-secondary/90 shadow-soft"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : showSuccess ? (
                <>
                  <CheckCircle className="mr-2 w-5 h-5" />
                  Enregistré !
                </>
              ) : (
                <>
                  <Save className="mr-2 w-5 h-5" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default Profile;
