import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, Users, TrendingUp, TrendingDown, Calendar, 
  CheckCircle, XCircle, MoreVertical, Loader2, Plus, UserPlus, X 
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TontineDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showAddMember, setShowAddMember] = useState(false);
  const [showContribution, setShowContribution] = useState<"give" | "receive" | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [selectedFromMember, setSelectedFromMember] = useState("");
  const [selectedToMember, setSelectedToMember] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tontine details
  const { data: tontine, isLoading: tontineLoading } = useQuery({
    queryKey: ["tontine", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("tontines")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch tontine members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["tontine_members", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("tontine_members")
        .select("*")
        .eq("tontine_id", id)
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch contributions for this tontine
  const { data: contributions } = useQuery({
    queryKey: ["contributions", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("contributions")
        .select("*")
        .eq("tontine_id", id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Calculate stats
  const totalGiven = contributions?.reduce((sum, c) => {
    if (c.status === "paid") return sum + Number(c.amount);
    return sum;
  }, 0) || 0;

  const totalToReceive = contributions?.reduce((sum, c) => {
    if (c.status === "pending") return sum + Number(c.amount);
    return sum;
  }, 0) || 0;

  const currentUserMember = members?.find((m) => m.is_current_user);
  const myPosition = currentUserMember?.position || 0;
  const paidContributions = contributions?.filter((c) => c.status === "paid").length || 0;
  const currentRound = Math.floor(paidContributions / (members?.length || 1)) + 1;

  const handleAddMember = async () => {
    if (!memberName.trim() || !tontine?.id) return;

    setIsSubmitting(true);
    try {
      const nextPosition = (members?.length || 0) + 1;
      
      const { error } = await supabase
        .from("tontine_members")
        .insert({
          tontine_id: tontine.id,
          name: memberName.trim(),
          phone: memberPhone.trim() || null,
          position: nextPosition,
          is_current_user: isCurrentUser,
        });

      if (error) throw error;

      toast({
        title: "Membre ajouté",
        description: `${memberName} a été ajouté à la tontine`,
      });

      queryClient.invalidateQueries({ queryKey: ["tontine_members", id] });
      setShowAddMember(false);
      setMemberName("");
      setMemberPhone("");
      setIsCurrentUser(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le membre",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContribution = async (type: "give" | "receive") => {
    if (!selectedFromMember || !selectedToMember || !tontine?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("contributions")
        .insert({
          tontine_id: tontine.id,
          from_member_id: selectedFromMember,
          to_member_id: selectedToMember,
          amount: tontine.amount,
          status: type === "give" ? "paid" : "pending",
          paid_at: type === "give" ? new Date().toISOString() : null,
        });

      if (error) throw error;

      toast({
        title: type === "give" ? "Contribution enregistrée" : "Réception enregistrée",
        description: `La transaction a été enregistrée avec succès`,
      });

      queryClient.invalidateQueries({ queryKey: ["contributions", id] });
      setShowContribution(null);
      setSelectedFromMember("");
      setSelectedToMember("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer la contribution",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = tontineLoading || membersLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!tontine) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Tontine non trouvée</p>
        <Button onClick={() => navigate("/dashboard")} variant="outline">
          Retour au dashboard
        </Button>
      </div>
    );
  }

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
            <p className="text-foreground font-bold text-lg">{members?.length || 0}</p>
            <p className="text-muted-foreground text-xs">Membres</p>
          </Card>
          <Card className="p-3 bg-white/95 border-0 shadow-soft text-center">
            <Calendar className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-foreground font-bold text-lg">{currentRound}/{tontine.total_members}</p>
            <p className="text-muted-foreground text-xs">Tours</p>
          </Card>
          <Card className="p-3 bg-white/95 border-0 shadow-soft text-center">
            <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-foreground font-bold text-lg">#{myPosition || "-"}</p>
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
                <p className="text-foreground font-bold text-xl">{totalGiven.toLocaleString()} KMF</p>
              </div>
              <div className="bg-secondary/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  <p className="text-muted-foreground text-sm">À recevoir</p>
                </div>
                <p className="text-secondary font-bold text-xl">{totalToReceive.toLocaleString()} KMF</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Montant par tour</span>
                <span className="text-foreground font-bold">{Number(tontine.amount).toLocaleString()} KMF</span>
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
            <h3 className="text-foreground font-semibold text-lg">
              Membres ({members?.length || 0}/{tontine.total_members})
            </h3>
            {(members?.length || 0) < tontine.total_members && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddMember(true)}
                className="text-secondary border-secondary"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            )}
          </div>
          
          {members && members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member, index) => {
                const memberContributions = contributions?.filter(
                  (c) => c.from_member_id === member.id && c.status === "paid"
                );
                const hasPaid = memberContributions && memberContributions.length > 0;
                const isCurrentTurn = member.position === currentRound;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Card className={`p-4 border-border shadow-soft ${
                      member.is_current_user && isCurrentTurn ? "border-2 border-secondary bg-secondary/5" : ""
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            hasPaid 
                              ? "bg-success/10 text-success" 
                              : member.is_current_user && isCurrentTurn 
                              ? "bg-secondary/10 text-secondary"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className={`font-semibold ${
                              member.is_current_user && isCurrentTurn ? "text-secondary" : "text-foreground"
                            }`}>
                              {member.name} {member.is_current_user && "(Vous)"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Position #{member.position}
                              {member.phone && ` • ${member.phone}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-foreground font-semibold">
                              {Number(tontine.amount).toLocaleString()} KMF
                            </p>
                          </div>
                          {hasPaid ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="p-6 text-center border-dashed border-2 border-border">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">Aucun membre dans cette tontine</p>
              <Button onClick={() => setShowAddMember(true)} className="bg-secondary hover:bg-secondary/90">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter le premier membre
              </Button>
            </Card>
          )}
        </motion.div>

        {/* Action Buttons */}
        {members && members.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            <Button 
              onClick={() => setShowContribution("give")}
              className="h-12 rounded-xl bg-secondary hover:bg-secondary/90 font-semibold"
            >
              J'ai donné
            </Button>
            <Button 
              onClick={() => setShowContribution("receive")}
              variant="outline" 
              className="h-12 rounded-xl font-semibold border-2"
            >
              J'ai reçu
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un membre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="memberName">Nom du membre *</Label>
              <Input
                id="memberName"
                placeholder="Ex: Mohamed Ali"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="mt-1.5"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="memberPhone">Téléphone (optionnel)</Label>
              <Input
                id="memberPhone"
                placeholder="Ex: +269 321 45 67"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                className="mt-1.5"
                maxLength={20}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCurrentUser"
                checked={isCurrentUser}
                onChange={(e) => setIsCurrentUser(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="isCurrentUser" className="text-sm font-normal cursor-pointer">
                C'est moi
              </Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAddMember(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!memberName.trim() || isSubmitting}
                className="flex-1 bg-secondary hover:bg-secondary/90"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contribution Dialog */}
      <Dialog open={!!showContribution} onOpenChange={() => setShowContribution(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {showContribution === "give" ? "Enregistrer une contribution" : "Enregistrer une réception"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>De qui ? *</Label>
              <Select value={selectedFromMember} onValueChange={setSelectedFromMember}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionner un membre" />
                </SelectTrigger>
                <SelectContent>
                  {members?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} {m.is_current_user && "(Vous)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>À qui ? *</Label>
              <Select value={selectedToMember} onValueChange={setSelectedToMember}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionner un membre" />
                </SelectTrigger>
                <SelectContent>
                  {members?.filter((m) => m.id !== selectedFromMember).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} {m.is_current_user && "(Vous)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Montant</span>
                <span className="text-foreground font-bold">
                  {Number(tontine?.amount || 0).toLocaleString()} KMF
                </span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowContribution(null)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={() => showContribution && handleContribution(showContribution)}
                disabled={!selectedFromMember || !selectedToMember || isSubmitting}
                className="flex-1 bg-secondary hover:bg-secondary/90"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TontineDetail;
