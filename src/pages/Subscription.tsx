import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Crown, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Subscription = () => {
  const navigate = useNavigate();
  const { session, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!session?.access_token) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la session de paiement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session?.access_token) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ouvrir le portail",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "Création illimitée de tontines",
    "Gestion des membres",
    "Suivi des contributions",
    "Historique complet",
    "Sauvegarde des données",
    "Support prioritaire",
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary p-6 pb-8 rounded-b-[2rem]"
      >
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-white text-xl font-bold">Abonnement</h1>
        </div>
        <p className="text-white/80 text-sm">
          Débloquez toutes les fonctionnalités de MTSANGO
        </p>
      </motion.div>

      <div className="px-6 py-6 space-y-6">
        {/* Status Card */}
        {subscription.loading ? (
          <Card className="p-6 border-border shadow-soft flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </Card>
        ) : subscription.subscribed ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 border-secondary border-2 shadow-soft bg-secondary/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">
                    {subscription.trial ? "Période d'essai" : "Premium"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {subscription.trial && subscription.trialEnd
                      ? `Essai jusqu'au ${formatDate(subscription.trialEnd)}`
                      : subscription.subscriptionEnd
                      ? `Renouvel le ${formatDate(subscription.subscriptionEnd)}`
                      : "Abonnement actif"}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleManageSubscription}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Gérer mon abonnement
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 border-border shadow-soft">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Gratuit</h3>
                  <p className="text-muted-foreground text-sm">
                    Fonctionnalités limitées
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Premium Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border-border shadow-soft overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-secondary text-white px-3 py-1 rounded-bl-lg text-xs font-semibold">
              7 jours gratuits
            </div>

            <div className="mb-6 pt-4">
              <h3 className="font-bold text-2xl text-foreground mb-2">
                MTSANGO Premium
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-secondary">4,99€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-secondary" />
                  </div>
                  <span className="text-foreground text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {!subscription.subscribed && (
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full h-14 text-lg font-semibold rounded-2xl bg-secondary hover:bg-secondary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Commencer l'essai gratuit
                  </>
                )}
              </Button>
            )}
          </Card>
        </motion.div>

        {/* Refresh button */}
        <Button
          variant="ghost"
          onClick={checkSubscription}
          className="w-full text-muted-foreground"
        >
          Actualiser le statut
        </Button>
      </div>
    </div>
  );
};

export default Subscription;
