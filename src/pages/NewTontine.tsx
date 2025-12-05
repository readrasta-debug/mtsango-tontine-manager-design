import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Calendar, Coins, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const tontineSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  description: z.string().max(500).optional(),
  amount: z.number().min(1000, "Le montant minimum est de 1000 KMF"),
  frequency: z.enum(["weekly", "biweekly", "monthly", "flexible"]),
  total_members: z.number().min(2, "Minimum 2 membres"),
  start_date: z.string().optional(),
});

const NewTontine = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    frequency: "monthly",
    total_members: "2",
    start_date: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const validationResult = tontineSchema.safeParse({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      amount: Number(formData.amount),
      frequency: formData.frequency,
      total_members: Number(formData.total_members),
      start_date: formData.start_date || undefined,
    });

    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: tontine, error } = await supabase
        .from("tontines")
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          amount: Number(formData.amount),
          frequency: formData.frequency,
          total_members: Number(formData.total_members),
          start_date: formData.start_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Tontine créée",
        description: "Vous pouvez maintenant ajouter des membres",
      });

      navigate(`/tontines/${tontine.id}`);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la tontine",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-white text-xl font-bold">Nouvelle Tontine</h1>
        </div>
        <p className="text-white/80 text-sm">
          Créez votre tontine et invitez vos membres
        </p>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 border-border shadow-soft">
            <Label htmlFor="name" className="text-foreground font-medium mb-2 block">
              Nom de la tontine *
            </Label>
            <Input
              id="name"
              placeholder="Ex: Tontine Famille"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-12 rounded-xl"
              maxLength={100}
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1">{errors.name}</p>
            )}
          </Card>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-5 border-border shadow-soft">
            <Label htmlFor="description" className="text-foreground font-medium mb-2 block">
              Description (optionnel)
            </Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre tontine..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="rounded-xl resize-none"
              rows={3}
              maxLength={500}
            />
          </Card>
        </motion.div>

        {/* Amount & Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5 border-border shadow-soft space-y-4">
            <div>
              <Label htmlFor="amount" className="text-foreground font-medium mb-2 flex items-center gap-2">
                <Coins className="w-4 h-4 text-secondary" />
                Montant par tour (KMF) *
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Ex: 15000"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="h-12 rounded-xl"
                min={1000}
              />
              {errors.amount && (
                <p className="text-destructive text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <Label htmlFor="frequency" className="text-foreground font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary" />
                Fréquence *
              </Label>
              <Select value={formData.frequency} onValueChange={(v) => handleChange("frequency", v)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="biweekly">Bi-hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="flexible">Sans fréquence fixe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>

        {/* Members & Start Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="p-5 border-border shadow-soft space-y-4">
            <div>
              <Label htmlFor="total_members" className="text-foreground font-medium mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                Nombre de membres *
              </Label>
              <Input
                id="total_members"
                type="number"
                placeholder="Ex: 8"
                value={formData.total_members}
                onChange={(e) => handleChange("total_members", e.target.value)}
                className="h-12 rounded-xl"
                min={2}
              />
              {errors.total_members && (
                <p className="text-destructive text-sm mt-1">{errors.total_members}</p>
              )}
            </div>

            <div>
              <Label htmlFor="start_date" className="text-foreground font-medium mb-2 block">
                Date de début (optionnel)
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          </Card>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-secondary hover:bg-secondary/90 shadow-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Création...
              </>
            ) : (
              "Créer la tontine"
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default NewTontine;
