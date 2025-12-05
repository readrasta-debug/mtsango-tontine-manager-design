import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Users, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const CURRENCY_SYMBOLS: Record<string, string> = {
  KMF: "FC",
  EUR: "€",
  USD: "$",
  MGA: "Ar",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch user profile
  const { data: profile } = useQuery({
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

  // Fetch user's tontines
  const { data: tontines, isLoading: tontinesLoading } = useQuery({
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

  // Fetch contributions for stats
  const { data: contributions } = useQuery({
    queryKey: ["contributions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("contributions")
        .select(`
          *,
          tontines!inner(user_id)
        `)
        .eq("tontines.user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Group tontines by currency for stats
  const statsByCurrency = tontines?.reduce((acc, tontine) => {
    const currency = tontine.currency || "KMF";
    if (!acc[currency]) {
      acc[currency] = { totalAmount: 0, count: 0 };
    }
    acc[currency].totalAmount += Number(tontine.amount);
    acc[currency].count += 1;
    return acc;
  }, {} as Record<string, { totalAmount: number; count: number }>) || {};

  // Calculate contributions stats (grouped by currency from tontine)
  const contributionStats = contributions?.reduce((acc, c) => {
    // Find the tontine to get its currency
    const tontine = tontines?.find(t => t.id === c.tontine_id);
    const currency = tontine?.currency || "KMF";
    
    if (!acc[currency]) {
      acc[currency] = { given: 0, toReceive: 0 };
    }
    
    if (c.status === "paid") {
      acc[currency].given += Number(c.amount);
    } else if (c.status === "pending") {
      acc[currency].toReceive += Number(c.amount);
    }
    return acc;
  }, {} as Record<string, { given: number; toReceive: number }>) || {};

  // Get all unique currencies from tontines
  const currencies = Object.keys(statsByCurrency);
  
  // Build stats array for each currency
  const stats = currencies.length > 0 
    ? currencies.flatMap(currency => {
        const symbol = CURRENCY_SYMBOLS[currency] || currency;
        const contribStats = contributionStats[currency] || { given: 0, toReceive: 0 };
        return [
          {
            label: `Total donné (${currency})`,
            value: `${contribStats.given.toLocaleString()} ${symbol}`,
            icon: TrendingDown,
            color: "text-accent",
            bgColor: "bg-accent/10",
          },
          {
            label: `À recevoir (${currency})`,
            value: `${contribStats.toReceive.toLocaleString()} ${symbol}`,
            icon: TrendingUp,
            color: "text-secondary",
            bgColor: "bg-secondary/10",
          },
        ];
      })
    : [
        {
          label: "Total donné",
          value: "0 FC",
          icon: TrendingDown,
          color: "text-accent",
          bgColor: "bg-accent/10",
        },
        {
          label: "À recevoir",
          value: "0 FC",
          icon: TrendingUp,
          color: "text-secondary",
          bgColor: "bg-secondary/10",
        },
      ];

  const userName = profile?.full_name || "Utilisateur";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary p-6 pb-8 rounded-b-[2rem]"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-white/80 text-sm">Bienvenue</p>
            <h1 className="text-white text-2xl font-bold mt-1">{userName}</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-lg font-bold">{userInitials}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 bg-white/95 border-0 shadow-soft">
                <div className={`${stat.bgColor} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-muted-foreground text-xs mb-1">{stat.label}</p>
                <p className="text-foreground font-bold text-lg">{stat.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-foreground text-xl font-bold">Mes Tontines</h2>
          <Button
            onClick={() => navigate("/tontines")}
            variant="ghost"
            size="sm"
            className="text-secondary"
          >
            Voir tout
            <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>

        {/* Tontines List */}
        {tontinesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        ) : tontines && tontines.length > 0 ? (
          <div className="space-y-4">
            {tontines.slice(0, 3).map((tontine, index) => {
              const memberCount = tontine.tontine_members?.[0]?.count || tontine.total_members;
              const progress = Math.min(100, Math.round((memberCount / tontine.total_members) * 100));
              
              return (
                <motion.div
                  key={tontine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/tontines/${tontine.id}`)}
                >
                  <Card className="p-4 border-border shadow-soft hover:shadow-medium transition-smooth cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-foreground font-semibold text-lg mb-1">
                          {tontine.name}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Users className="w-4 h-4" />
                          <span>{memberCount} / {tontine.total_members} membres</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-bold">
                          {Number(tontine.amount).toLocaleString()} {CURRENCY_SYMBOLS[tontine.currency || "KMF"] || tontine.currency}
                        </p>
                        <span className="inline-block mt-1 px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                          {tontine.frequency}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-2 border-border">
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore de tontine
            </p>
            <Button
              onClick={() => navigate("/tontines/new")}
              className="bg-secondary hover:bg-secondary/90"
            >
              <Plus className="mr-2 w-4 h-4" />
              Créer ma première tontine
            </Button>
          </Card>
        )}

        {/* Add Tontine Button */}
        {tontines && tontines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Button
              onClick={() => navigate("/tontines/new")}
              className="w-full h-14 text-lg font-semibold rounded-2xl bg-secondary hover:bg-secondary/90 shadow-medium"
            >
              <Plus className="mr-2 w-5 h-5" />
              Créer une nouvelle tontine
            </Button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
