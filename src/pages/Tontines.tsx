import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, Search, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";

const Tontines = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const tontines = [
    {
      id: 1,
      name: "Tontine Famille",
      members: 8,
      amount: "15 000 KMF",
      totalGiven: "45 000 KMF",
      totalToReceive: "30 000 KMF",
      status: "active",
      myTurn: false,
      progress: 60,
    },
    {
      id: 2,
      name: "Tontine Bureau",
      members: 12,
      amount: "20 000 KMF",
      totalGiven: "60 000 KMF",
      totalToReceive: "48 000 KMF",
      status: "active",
      myTurn: true,
      progress: 40,
    },
    {
      id: 3,
      name: "Tontine Amis",
      members: 6,
      amount: "10 000 KMF",
      totalGiven: "20 000 KMF",
      totalToReceive: "20 000 KMF",
      status: "active",
      myTurn: false,
      progress: 80,
    },
    {
      id: 4,
      name: "Tontine Quartier",
      members: 10,
      amount: "25 000 KMF",
      totalGiven: "75 000 KMF",
      totalToReceive: "50 000 KMF",
      status: "active",
      myTurn: false,
      progress: 30,
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
            <p className="text-foreground font-bold text-xl">{tontines.length}</p>
            <p className="text-muted-foreground text-xs mt-1">Tontines actives</p>
          </Card>

          <Card className="p-4 bg-white/95 border-0 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-muted-foreground text-xs">Montant</p>
            </div>
            <p className="text-foreground font-bold text-xl">200K</p>
            <p className="text-muted-foreground text-xs mt-1">KMF total</p>
          </Card>
        </div>
      </motion.div>

      {/* Tontines List */}
      <div className="px-6 py-6 space-y-4">
        {tontines.map((tontine, index) => (
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
                    {tontine.myTurn && (
                      <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                        Votre tour
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Users className="w-4 h-4" />
                    <span>{tontine.members} membres</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-foreground font-bold text-lg">{tontine.amount}</p>
                  <p className="text-muted-foreground text-xs">par tour</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-muted-foreground text-xs mb-1">Donné</p>
                  <p className="text-foreground font-semibold">{tontine.totalGiven}</p>
                </div>
                <div className="bg-secondary/10 rounded-xl p-3">
                  <p className="text-muted-foreground text-xs mb-1">À recevoir</p>
                  <p className="text-secondary font-semibold">{tontine.totalToReceive}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progression</span>
                  <span>{tontine.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-secondary h-2 rounded-full transition-all"
                    style={{ width: `${tontine.progress}%` }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
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
