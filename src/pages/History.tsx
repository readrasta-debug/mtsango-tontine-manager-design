import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, Calendar, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const History = () => {
  const { user } = useAuth();

  // Fetch contributions with tontine and member info
  const { data: contributions, isLoading } = useQuery({
    queryKey: ["contributions-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get user's tontines
      const { data: tontines, error: tontinesError } = await supabase
        .from("tontines")
        .select("id, name")
        .eq("user_id", user.id);
      
      if (tontinesError) throw tontinesError;
      if (!tontines || tontines.length === 0) return [];

      const tontineIds = tontines.map((t) => t.id);

      // Get contributions for these tontines
      const { data: contribs, error: contribsError } = await supabase
        .from("contributions")
        .select(`
          *,
          from_member:tontine_members!contributions_from_member_id_fkey(name),
          to_member:tontine_members!contributions_to_member_id_fkey(name)
        `)
        .in("tontine_id", tontineIds)
        .order("created_at", { ascending: false });

      if (contribsError) throw contribsError;

      // Map tontine names
      const tontineMap = Object.fromEntries(tontines.map((t) => [t.id, t.name]));
      
      return contribs?.map((c) => ({
        ...c,
        tontine_name: tontineMap[c.tontine_id] || "Tontine",
      })) || [];
    },
    enabled: !!user?.id,
  });

  // Calculate totals
  const totalGiven = contributions?.reduce((sum, c) => {
    if (c.status === "paid") return sum + Number(c.amount);
    return sum;
  }, 0) || 0;

  const totalReceived = contributions?.filter((c) => c.status === "paid").length || 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary p-6 pb-8 rounded-b-[2rem]"
      >
        <h1 className="text-white text-2xl font-bold mb-6">Historique</h1>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-white/95 border-0 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <ArrowDownCircle className="w-4 h-4" />
              </div>
              <p className="text-muted-foreground text-xs">Donné</p>
            </div>
            <p className="text-foreground font-bold text-xl">
              {totalGiven >= 1000 ? `${Math.round(totalGiven / 1000)}K` : totalGiven}
            </p>
            <p className="text-muted-foreground text-xs mt-1">Total KMF</p>
          </Card>

          <Card className="p-4 bg-white/95 border-0 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <ArrowUpCircle className="w-4 h-4" />
              </div>
              <p className="text-muted-foreground text-xs">Transactions</p>
            </div>
            <p className="text-foreground font-bold text-xl">{totalReceived}</p>
            <p className="text-muted-foreground text-xs mt-1">Complétées</p>
          </Card>
        </div>
      </motion.div>

      {/* Transactions List */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Transactions récentes</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        ) : contributions && contributions.length > 0 ? (
          <div className="space-y-3">
            {contributions.map((contribution, index) => {
              const isGiven = contribution.status === "paid";
              const fromName = contribution.from_member?.name || "Membre";
              const toName = contribution.to_member?.name || "Membre";
              const date = contribution.paid_at 
                ? new Date(contribution.paid_at)
                : new Date(contribution.created_at);

              return (
                <motion.div
                  key={contribution.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 border-border shadow-soft">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isGiven
                          ? "bg-accent/10 text-accent"
                          : "bg-secondary/10 text-secondary"
                      }`}>
                        {isGiven ? (
                          <ArrowDownCircle className="w-6 h-6" />
                        ) : (
                          <ArrowUpCircle className="w-6 h-6" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="text-foreground font-semibold">
                              {isGiven ? "Contribution donnée" : "En attente"}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {contribution.tontine_name}
                            </p>
                          </div>
                          <p className={`font-bold ${
                            isGiven ? "text-accent" : "text-secondary"
                          }`}>
                            {isGiven ? "-" : ""} {Number(contribution.amount).toLocaleString()} KMF
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground">
                            De {fromName} → {toName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {date.toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-2 border-border">
            <p className="text-muted-foreground">Aucune transaction pour le moment</p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default History;
