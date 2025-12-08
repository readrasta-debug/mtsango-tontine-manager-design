import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle, Smartphone, FileText, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { parseBackupFile, importBackup, BackupData } from "@/lib/backup";
import { useQueryClient } from "@tanstack/react-query";

interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestoreDialog({ open, onOpenChange }: RestoreDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<"select" | "preview" | "importing" | "complete">("select");
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [importResult, setImportResult] = useState<{ tontinesImported: number; membersImported: number } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseBackupFile(file);
      setBackupData(data);
      setStep("preview");
    } catch (error) {
      toast({
        title: "Fichier invalide",
        description: "Le fichier sélectionné n'est pas une sauvegarde valide",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!user?.id || !backupData) return;

    setStep("importing");
    try {
      const result = await importBackup(
        new File([JSON.stringify(backupData)], "backup.mtsango"),
        user.id
      );
      setImportResult(result);
      setStep("complete");
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["tontines"] });
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      
      toast({
        title: "Restauration réussie",
        description: `${result.tontinesImported} tontine(s) et ${result.membersImported} membre(s) importé(s)`,
      });

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de restaurer la sauvegarde",
        variant: "destructive",
      });
      setStep("select");
    }
  };

  const handleClose = () => {
    setStep("select");
    setBackupData(null);
    setImportResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Restaurer la sauvegarde
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {step === "select" && (
            <>
              {/* Illustration */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex justify-center items-center gap-6 mb-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-secondary" />
                </motion.div>
                <motion.div
                  animate={{ x: [0, 30, 30], opacity: [1, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                  className="w-4 h-4 bg-secondary rounded-full"
                />
                <div className="w-20 h-36 rounded-2xl bg-gradient-to-b from-secondary to-primary flex items-center justify-center">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <p className="text-center text-muted-foreground mb-6">
                Sélectionnez un fichier .mtsango pour restaurer vos tontines sur cet appareil.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".mtsango,.json"
                className="hidden"
                onChange={handleFileSelect}
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-14 text-lg font-semibold rounded-2xl bg-secondary hover:bg-secondary/90"
              >
                <Upload className="mr-2 w-5 h-5" />
                Choisir un fichier
              </Button>
            </>
          )}

          {step === "preview" && backupData && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-accent" />
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4 mb-6 space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Date d'export:</span>{" "}
                  {new Date(backupData.exportedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Tontines:</span>{" "}
                  {backupData.tontines.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Membres:</span>{" "}
                  {backupData.tontines.reduce((acc, t) => acc + t.members.length, 0)}
                </p>
              </div>

              <div className="flex items-start gap-3 bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Les tontines importées seront ajoutées à vos données existantes.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="flex-1 h-12 rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleImport}
                  className="flex-1 h-12 rounded-xl bg-secondary hover:bg-secondary/90"
                >
                  Restaurer
                </Button>
              </div>
            </>
          )}

          {step === "importing" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-12 h-12 animate-spin text-secondary" />
              <p className="text-muted-foreground">Importation en cours...</p>
            </div>
          )}

          {step === "complete" && importResult && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <CheckCircle className="w-16 h-16 text-success" />
              <p className="text-success font-semibold text-center">
                {importResult.tontinesImported} tontine(s) et{" "}
                {importResult.membersImported} membre(s) importé(s) !
              </p>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
