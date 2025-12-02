import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, TrendingUp, TrendingDown, Calendar, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const TontineDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const tontine = {
    name: "Tontine Famille",
    members: 8,
    amount: "15 000 KMF",
    frequency: "Mensuel",
    myPosition: 3,
    currentRound: 5,
    totalGiven: "45 000 KMF",
    totalToReceive: "30 000 KMF",
  };

  const members = [
    { id: 1, name: "Ahmed Mohamed", status: "paid", amount: "15 000 KMF", date: "15 Nov 2025" },
    { id: 2, name: "Fatima Ali", status: "paid", amount: "15 000 KMF", date: "15 Nov 2025" },
    { id: 3, name: "Vous", status: "pending", amount: "15 000 KMF", myTurn: true },
    { id: 4, name: "Said Hassan", status: "pending", amount: "15 000 KMF" },
    { id: 5, name: "Halima Ibrahim", status: "pending", amount: "15 000 KMF" },
    { id: 6, name: "Moussa Abdou", status: "pending", amount: "15 000 KMF" },
    { id: 7, name: "Amina Said", status: "pending", amount: "15 000 KMF" },
    { id: 8, name: "Omar Ali", status: "pending", amount: "15 000 KMF" },
  ];

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary p-6 pb-8 rounded-b-[2rem]"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-white text-xl font-bold flex-1">{tontine.name}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <MoreVertical className="w-6 h-6" />
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 bg-white/95 border-0 shadow-soft text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-foreground font-bold text-lg">{tontine.members}</p>
            <p className="text-muted-foreground text-xs">Membres</p>
          </Card>
          <Card className="p-3 bg-white/95 border-0 shadow-soft text-center">
            <Calendar className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-foreground font-bold text-lg">{tontine.currentRound}/{tontine.members}</p>
            <p className="text-muted-foreground text-xs">Tours</p>
          </Card>
          <Card className="p-3 bg-white/95 border-0 shadow-soft text-center">
            <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-foreground font-bold text-lg">#{tontine.myPosition}</p>
            <p className="text-muted-foreground text-xs">Ma position</p>
          </Card>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 border-border shadow-soft">
            <h3 className="text-foreground font-semibold text-lg mb-4">Résumé</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-accent/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-accent" />
                  <p className="text-muted-foreground text-sm">Total donné</p>
                </div>
                <p className="text-foreground font-bold text-xl">{tontine.totalGiven}</p>
              </div>
              <div className="bg-secondary/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  <p className="text-muted-foreground text-sm">À recevoir</p>
                </div>
                <p className="text-secondary font-bold text-xl">{tontine.totalToReceive}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Montant par tour</span>
                <span className="text-foreground font-bold">{tontine.amount}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-muted-foreground text-sm">Fréquence</span>
                <span className="text-foreground font-semibold">{tontine.frequency}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Members List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-foreground font-semibold text-lg">Membres ({tontine.members})</h3>
            <span className="text-sm text-muted-foreground">Tour {tontine.currentRound}</span>
          </div>
          <div className="space-y-3">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card className={`p-4 border-border shadow-soft ${
                  member.myTurn ? "border-2 border-secondary bg-secondary/5" : ""
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        member.status === "paid" 
                          ? "bg-success/10 text-success" 
                          : member.myTurn 
                          ? "bg-secondary/10 text-secondary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-semibold ${
                          member.myTurn ? "text-secondary" : "text-foreground"
                        }`}>
                          {member.name}
                        </p>
                        {member.status === "paid" && member.date && (
                          <p className="text-xs text-muted-foreground">{member.date}</p>
                        )}
                        {member.myTurn && (
                          <p className="text-xs text-secondary font-medium">C'est votre tour</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-foreground font-semibold">{member.amount}</p>
                      </div>
                      {member.status === "paid" ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4"
        >
          <Button className="h-12 rounded-xl bg-secondary hover:bg-secondary/90 font-semibold">
            J'ai donné
          </Button>
          <Button variant="outline" className="h-12 rounded-xl font-semibold border-2">
            J'ai reçu
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default TontineDetail;
