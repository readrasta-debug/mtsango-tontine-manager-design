import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, Calendar } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const History = () => {
  const transactions = [
    {
      id: 1,
      type: "given",
      tontine: "Tontine Famille",
      amount: "15 000 KMF",
      recipient: "Ahmed Mohamed",
      date: "15 Nov 2025",
      time: "14:30",
    },
    {
      id: 2,
      type: "received",
      tontine: "Tontine Bureau",
      amount: "20 000 KMF",
      sender: "Fatima Ali",
      date: "10 Nov 2025",
      time: "10:15",
    },
    {
      id: 3,
      type: "given",
      tontine: "Tontine Amis",
      amount: "10 000 KMF",
      recipient: "Said Hassan",
      date: "5 Nov 2025",
      time: "16:45",
    },
    {
      id: 4,
      type: "given",
      tontine: "Tontine Bureau",
      amount: "20 000 KMF",
      recipient: "Halima Ibrahim",
      date: "1 Nov 2025",
      time: "09:20",
    },
    {
      id: 5,
      type: "received",
      tontine: "Tontine Famille",
      amount: "15 000 KMF",
      sender: "Moussa Abdou",
      date: "25 Oct 2025",
      time: "11:00",
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
            <p className="text-foreground font-bold text-xl">45K</p>
            <p className="text-muted-foreground text-xs mt-1">Total KMF</p>
          </Card>

          <Card className="p-4 bg-white/95 border-0 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <ArrowUpCircle className="w-4 h-4" />
              </div>
              <p className="text-muted-foreground text-xs">Reçu</p>
            </div>
            <p className="text-foreground font-bold text-xl">35K</p>
            <p className="text-muted-foreground text-xs mt-1">Total KMF</p>
          </Card>
        </div>
      </motion.div>

      {/* Transactions List */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Transactions récentes</span>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 border-border shadow-soft">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    transaction.type === "given"
                      ? "bg-accent/10 text-accent"
                      : "bg-secondary/10 text-secondary"
                  }`}>
                    {transaction.type === "given" ? (
                      <ArrowDownCircle className="w-6 h-6" />
                    ) : (
                      <ArrowUpCircle className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-foreground font-semibold">
                          {transaction.type === "given" ? "Contribution donnée" : "Contribution reçue"}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {transaction.tontine}
                        </p>
                      </div>
                      <p className={`font-bold ${
                        transaction.type === "given" ? "text-accent" : "text-secondary"
                      }`}>
                        {transaction.type === "given" ? "-" : "+"} {transaction.amount}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        {transaction.type === "given" 
                          ? `À ${transaction.recipient}` 
                          : `De ${transaction.sender}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.date} • {transaction.time}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default History;
