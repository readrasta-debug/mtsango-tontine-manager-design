import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { exportBackup, downloadBackup } from "@/lib/backup";

interface BackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BackupDialog({ open, onOpenChange }: BackupDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleBackup = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await exportBackup(user.id);
      const date = new Date().toISOString().split("T")[0];
      const fileName = `mtsango-backup-${date}.mtsango`;
      downloadBackup(data, fileName);

      setIsComplete(true);
      toast({
        title: "Sauvegarde réussie",
        description: `${data.tontines.length} tontine(s) sauvegardée(s)`,
      });

      setTimeout(() => {
        setIsComplete(false);
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Backup error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la sauvegarde",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Sauvegarder mes données
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Illustration */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center items-center gap-6 mb-8"
          >
            <div className="relative">
              <div className="w-20 h-36 rounded-2xl bg-gradient-to-b from-secondary to-primary flex items-center justify-center">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <motion.div
                animate={{ x: [0, 30, 30], opacity: [1, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                className="absolute top-1/2 -right-2 w-4 h-4 bg-secondary rounded-full"
              />
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center"
            >
              <Download className="w-8 h-8 text-secondary" />
            </motion.div>
          </motion.div>

          <p className="text-center text-muted-foreground mb-6">
            Téléchargez un fichier contenant toutes vos tontines, membres et
            contributions. Vous pourrez le restaurer sur n'importe quel appareil.
          </p>

          {isComplete ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <CheckCircle className="w-16 h-16 text-success" />
              <p className="text-success font-semibold">Sauvegarde téléchargée !</p>
            </motion.div>
          ) : (
            <Button
              onClick={handleBackup}
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold rounded-2xl bg-secondary hover:bg-secondary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Download className="mr-2 w-5 h-5" />
                  Télécharger la sauvegarde
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
