import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, Lock, Bell, Globe, Moon, Download, 
  Upload, Info, LogOut, ChevronRight, Loader2
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import logo from "@/assets/mtsango-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  };

  const userName = profile?.full_name || "Utilisateur";
  const userPhone = profile?.phone || "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const settingsSections = [
    {
      title: "Compte",
      items: [
        { icon: User, label: "Profil utilisateur", action: "profile" },
        { icon: Lock, label: "Sécurité & PIN", action: "security" },
      ],
    },
    {
      title: "Préférences",
      items: [
        { icon: Bell, label: "Notifications", action: "notifications" },
        { icon: Globe, label: "Langue", value: "Français", action: "language" },
        { icon: Moon, label: "Thème", value: "Clair", action: "theme" },
      ],
    },
    {
      title: "Données",
      items: [
        { icon: Download, label: "Sauvegarder mes données", action: "backup" },
        { icon: Upload, label: "Restaurer la sauvegarde", action: "restore" },
      ],
    },
    {
      title: "À propos",
      items: [
        { icon: Info, label: "Informations sur l'app", value: "v1.0.0", action: "about" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary p-6 pb-8 rounded-b-[2rem]"
      >
        <h1 className="text-white text-2xl font-bold mb-6">Paramètres</h1>

        {/* Profile Card */}
        <Card className="p-5 bg-white/95 border-0 shadow-soft">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-secondary" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{userInitials}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-foreground font-bold text-lg">{userName}</h3>
                <p className="text-muted-foreground text-sm">{userPhone}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </Card>
      </motion.div>

      {/* Settings Sections */}
      <div className="px-6 py-6 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <h3 className="text-foreground font-semibold text-sm mb-3 px-2">
              {section.title}
            </h3>
            <Card className="border-border shadow-soft overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <button
                  key={item.label}
                  className={`w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-smooth ${
                    itemIndex !== section.items.length - 1 ? "border-b border-border/50" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-foreground font-medium">{item.label}</p>
                    {item.value && (
                      <p className="text-muted-foreground text-sm">{item.value}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </Card>
          </motion.div>
        ))}

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-14 rounded-2xl border-2 border-destructive text-destructive hover:bg-destructive hover:text-white font-semibold"
          >
            <LogOut className="mr-2 w-5 h-5" />
            Déconnexion
          </Button>
        </motion.div>

        {/* App Logo & Version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-2 pt-4"
        >
          <img src={logo} alt="MTSANGO" className="w-12 h-12 opacity-60" />
          <p className="text-muted-foreground text-xs">MTSANGO v1.0.0</p>
          <p className="text-muted-foreground text-xs">© 2025 Tous droits réservés</p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;