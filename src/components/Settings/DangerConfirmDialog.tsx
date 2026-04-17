import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DangerConfirmDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  variant: "reset" | "delete";
  onConfirmed: () => Promise<void> | void;
}

const COPY = {
  reset: {
    title: "Zerar dados de registros",
    intro:
      "Esta ação remove permanentemente seus registros operacionais: multas, abastecimentos, manutenção, jornadas, metas, relatórios e histórico financeiro.",
    keepInfo: "Seu login, conta, perfil e configurações principais NÃO serão afetados.",
    phrase: "ZERAR REGISTROS",
    cta: "Zerar registros",
    requirePassword: false,
  },
  delete: {
    title: "Deletar conta",
    intro:
      "Esta ação apaga permanentemente sua conta inteira e TODOS os dados vinculados a ela. Esta ação é irreversível.",
    keepInfo: "Você perderá acesso ao app imediatamente após a confirmação.",
    phrase: "DELETAR MINHA CONTA",
    cta: "Deletar conta permanentemente",
    requirePassword: true,
  },
} as const;

export function DangerConfirmDialog({
  open,
  onOpenChange,
  variant,
  onConfirmed,
}: DangerConfirmDialogProps) {
  const { user } = useAuth();
  const cfg = COPY[variant];
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep(1);
    setFullName("");
    setEmail("");
    setPassword("");
    setPhrase("");
    setLoading(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const validStep1 =
    fullName.trim().length >= 3 &&
    email.trim().toLowerCase() === (user?.email ?? "").toLowerCase();

  const validStep2 =
    phrase.trim() === cfg.phrase && (!cfg.requirePassword || password.length >= 6);

  const handleConfirm = async () => {
    if (!validStep2) return;
    setLoading(true);
    try {
      if (cfg.requirePassword) {
        // Re-authenticate
        const { error } = await supabase.auth.signInWithPassword({
          email: user?.email ?? "",
          password,
        });
        if (error) {
          toast.error("Senha incorreta");
          setLoading(false);
          return;
        }
      }
      await onConfirmed();
      toast.success(variant === "reset" ? "Registros zerados com sucesso" : "Conta deletada");
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao executar ação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-11 h-11 rounded-full bg-destructive/15 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <DialogTitle className="text-destructive">{cfg.title}</DialogTitle>
          <DialogDescription className="text-left space-y-2 pt-1">
            <span className="block">{cfg.intro}</span>
            <span className="block text-xs text-muted-foreground">{cfg.keepInfo}</span>
            <span className="block text-xs font-semibold text-destructive">
              ⚠ Esta ação é irreversível.
            </span>
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome completo</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">E-mail cadastrado</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={user?.email ?? "seu@email.com"}
                className="mt-1"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {cfg.requirePassword && (
              <div>
                <Label className="text-xs">Senha atual</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label className="text-xs">
                Digite <span className="font-mono text-destructive">{cfg.phrase}</span> para
                confirmar
              </Label>
              <Input
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder={cfg.phrase}
                className="mt-1 font-mono"
                autoCapitalize="characters"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex-row gap-2">
          {step === 1 ? (
            <>
              <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={!validStep1}
                onClick={() => setStep(2)}
              >
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={!validStep2 || loading}
                onClick={handleConfirm}
              >
                {loading ? "Processando..." : cfg.cta}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
