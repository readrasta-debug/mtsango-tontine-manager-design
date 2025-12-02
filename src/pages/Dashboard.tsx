import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      label: "Total donné",
      value: "125 000 KMF",
      icon: TrendingDown,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "À recevoir",
      value: "98 000 KMF",
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  const tontines = [
    {
      id: 1,
      name: "Tontine Famille",
      members: 8,
      amount: "15 000 KMF",
      status: "active",
      myTurn: false,
      progress: 60,
    },
    {
      id: 2,
      name: "Tontine Bureau",
      members: 12,
      amount: "20 000 KMF",
      status: "active",
      myTurn: true,
      progress: 40,
    },
    {
      id: 3,
      name: "Tontine Amis",
      members: 6,
      amount: "10 000 KMF",
      status: "active",
      myTurn: false,
      progress: 80,
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-white/80 text-sm">Bienvenue</p>
            <h1 className="text-white text-2xl font-bold mt-1">Mohamed Ali</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-lg font-bold">MA</span>
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
        <div className="space-y-4">
          {tontines.map((tontine, index) => (
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
                      <span>{tontine.members} membres</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-bold">{tontine.amount}</p>
                    {tontine.myTurn && (
                      <span className="inline-block mt-1 px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                        Votre tour
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-secondary h-2 rounded-full transition-all"
                    style={{ width: `${tontine.progress}%` }}
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Add Tontine Button */}
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
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
