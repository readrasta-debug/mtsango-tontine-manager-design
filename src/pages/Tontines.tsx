import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, Search, TrendingUp, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Tontines = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  // Fetch user's tontines with member counts
  const { data: tontines, isLoading } = useQuery({
    queryKey: ["tontines", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("tontines")
        .select(`
          *,
          tontine_members(count)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Filter tontines by search query
  const filteredTontines = tontines?.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Calculate totals
  const totalAmount = filteredTontines.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary p-6 pb-8 rounded-b-[2rem]"
      >
        <h1 className="text-white text-2xl font-bold mb-6">Mes Tontines</h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <Input
            type="text"
            placeholder="Rechercher une tontine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-0 bg-white/20 text-white placeholder:text-white/60"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="p-4 bg-white/95 border-0 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-muted-foreground text-xs">Total</p>
            </div>
            <p className="text-foreground font-bold text-xl">{filteredTontines.length}</p>
            <p className="text-muted-foreground text-xs mt-1">Tontines actives</p>
          </Card>

          <Card className="p-4 bg-white/95 border-0 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-muted-foreground text-xs">Montant</p>
            </div>
            <p className="text-foreground font-bold text-xl">
              {totalAmount >= 1000 ? `${Math.round(totalAmount / 1000)}K` : totalAmount}
            </p>
            <p className="text-muted-foreground text-xs mt-1">KMF total</p>
          </Card>
        </div>
      </motion.div>

      {/* Tontines List */}
      <div className="px-6 py-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        ) : filteredTontines.length > 0 ? (
          filteredTontines.map((tontine, index) => {
            const memberCount = tontine.tontine_members?.[0]?.count || 0;
            const progress = Math.min(100, Math.round((memberCount / tontine.total_members) * 100));

            return (
              <motion.div
                key={tontine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/tontines/${tontine.id}`)}
              >
                <Card className="p-5 border-border shadow-soft hover:shadow-medium transition-smooth cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-foreground font-semibold text-lg">
                          {tontine.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Users className="w-4 h-4" />
                        <span>{memberCount} / {tontine.total_members} membres</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-bold text-lg">
                        {Number(tontine.amount).toLocaleString()} KMF
                      </p>
                      <p className="text-muted-foreground text-xs">par tour</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-muted-foreground text-xs mb-1">Fréquence</p>
                      <p className="text-foreground font-semibold">{tontine.frequency}</p>
                    </div>
                    <div className="bg-secondary/10 rounded-xl p-3">
                      <p className="text-muted-foreground text-xs mb-1">Date début</p>
                      <p className="text-secondary font-semibold">
                        {tontine.start_date 
                          ? new Date(tontine.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                          : "Non définie"}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Membres inscrits</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <Card className="p-8 text-center border-dashed border-2 border-border">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Aucune tontine trouvée" : "Vous n'avez pas encore de tontine"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => navigate("/tontines/new")}
                className="bg-secondary hover:bg-secondary/90"
              >
                <Plus className="mr-2 w-4 h-4" />
                Créer ma première tontine
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Floating Add Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-24 right-6"
      >
        <Button
          onClick={() => navigate("/tontines/new")}
          className="w-16 h-16 rounded-full shadow-medium gradient-primary"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Tontines;
