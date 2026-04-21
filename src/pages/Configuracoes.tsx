import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { SettingsRow, SettingsSection } from "@/components/Settings/SettingsRow";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DEFAULT_SETTINGS, isMissingUserSettingsTableError, type UserSettings } from "@/lib/settings";
import { Bell, BellOff, FileText, Brain, MapPin, Tag, Loader2, ShieldAlert, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";

const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const DATA_TABLES = ["earnings","fueling","journeys","maintenance","electric_usage","electric_charging","electric_alerts","multas","lucro_real","manual_earnings","platform_imports","earnings_imports","goals"];

export default function Configuracoes() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_configuracoes"));
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => { loadSettings(); }, [user?.id]);

  const loadSettings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      if (data) {
        setSettings({ notifications_enabled: data.notifications_enabled, cnh_alert_enabled: data.cnh_alert_enabled, fines_alert_enabled: data.fines_alert_enabled, discount_alert_enabled: data.discount_alert_enabled, ipva_alert_enabled: data.ipva_alert_enabled, insurance_alert_enabled: data.insurance_alert_enabled, maintenance_alert_enabled: data.maintenance_alert_enabled, ai_extract_documents: data.ai_extract_documents, ai_financial_copilot: data.ai_financial_copilot, default_state: data.default_state, default_discount_percent: data.default_discount_percent, theme: data.theme, language: data.language, currency: data.currency });
      } else {
        await supabase.from("user_settings").insert({ user_id: user.id, ...DEFAULT_SETTINGS });
      }
    } catch (error: unknown) {
      if (isMissingUserSettingsTableError(error)) { setSettings(DEFAULT_SETTINGS); }
      else { toast.error("Erro ao carregar configurações"); }
    } finally { setLoading(false); }
  };

  const persist = async (patch: Partial<UserSettings>) => {
    if (!user || saving) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    try {
      const { error } = await supabase.from("user_settings").update(patch).eq("user_id", user.id);
      if (error) throw error;
    } catch { toast.error("Erro ao salvar"); setSettings(settings); }
    finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (deleteEmail.trim().toLowerCase() !== (user.email ?? "").toLowerCase()) { toast.error("E-mail inválido"); return; }
    if (deletePhrase.trim() !== "DELETAR MINHA CONTA") { toast.error('Digite exatamente: DELETAR MINHA CONTA'); return; }
    setDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const { error } = await supabase.functions.invoke("delete-account", {
        body: { confirmedEmail: deleteEmail.trim(), confirmationPhrase: deletePhrase.trim() },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (error) throw error;
      toast.success("Conta excluída com sucesso");
      await signOut();
      navigate("/auth", { replace: true });
    } catch (error: unknown) {
      toast.error("Falha ao excluir conta", { description: error instanceof Error ? error.message : "Tente novamente." });
    } finally { setDeleting(false); setDeleteOpen(false); }
  };

  const handleResetData = async () => {
    if (!user || !resetPassword) { toast.error("Digite sua senha"); return; }
    setResetting(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email!, password: resetPassword });
      if (authError) { toast.error("Senha incorreta"); setResetting(false); return; }
      for (const table of DATA_TABLES) {
        await supabase.from(table as any).delete().eq("user_id", user.id);
      }
      toast.success("Dados zerados com sucesso!");
      setResetOpen(false);
      setResetPassword("");
    } catch (error: unknown) {
      toast.error("Erro ao zerar dados", { description: error instanceof Error ? error.message : "Tente novamente." });
    } finally { setResetting(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const tourSteps = [{ target: "h1", title: "Configurações ⚙️", description: "Personalize o app conforme suas preferências." }];


  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Configurações" subtitle="Preferências do app" showBack />
      <div className="flex justify-end -mt-2 mb-2"><button onClick={() => { localStorage.removeItem("tour_configuracoes"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"><HelpCircle className="w-4 h-4" /> Ajuda</button></div>
      {saving && <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 px-1"><Loader2 className="w-3 h-3 animate-spin" /> Salvando...</div>}

      <SettingsSection title="Notificações">
        <SettingsRow icon={Bell} label="Notificações" description="Receber alertas e lembretes" toggle={{ checked: settings.notifications_enabled, onChange: (v) => persist({ notifications_enabled: v }) }} />
        <SettingsRow icon={FileText} label="Alertas de CNH" description="Aviso de vencimento de CNH" toggle={{ checked: settings.cnh_alert_enabled, onChange: (v) => persist({ cnh_alert_enabled: v }) }} />
        <SettingsRow icon={AlertTriangle} label="Alertas de Multas" description="Notificações de novas multas" toggle={{ checked: settings.fines_alert_enabled, onChange: (v) => persist({ fines_alert_enabled: v }) }} />
        <SettingsRow icon={Tag} label="Alertas de Desconto" description="Lembrete para pagar com desconto" toggle={{ checked: settings.discount_alert_enabled, onChange: (v) => persist({ discount_alert_enabled: v }) }} />
        <SettingsRow icon={Bell} label="IPVA" description="Avisos de IPVA" toggle={{ checked: settings.ipva_alert_enabled, onChange: (v) => persist({ ipva_alert_enabled: v }) }} />
        <SettingsRow icon={Bell} label="Seguro" description="Vencimento de seguro" toggle={{ checked: settings.insurance_alert_enabled, onChange: (v) => persist({ insurance_alert_enabled: v }) }} />
        <SettingsRow icon={BellOff} label="Manutenção" description="Lembretes de manutenção" toggle={{ checked: settings.maintenance_alert_enabled, onChange: (v) => persist({ maintenance_alert_enabled: v }) }} />
      </SettingsSection>

      <SettingsSection title="Inteligência Artificial">
        <SettingsRow icon={Brain} label="Extração por IA" description="Analisar documentos com IA" toggle={{ checked: settings.ai_extract_documents, onChange: (v) => persist({ ai_extract_documents: v }) }} />
        <SettingsRow icon={Brain} label="Copiloto Financeiro" description="Análise automática de ganhos" badge="Beta" toggle={{ checked: settings.ai_financial_copilot, onChange: (v) => persist({ ai_financial_copilot: v }) }} />
      </SettingsSection>

      <SettingsSection title="Preferências">
        <div className="px-4 py-3">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Estado padrão (multas)</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {STATES.map((s) => (
              <button key={s} onClick={() => persist({ default_state: s })} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${settings.default_state === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="px-4 py-3 border-t border-border/50">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Desconto padrão em multas (%)</Label>
          <div className="flex gap-2 mt-1.5">
            {[20, 30, 40].map((p) => (
              <button key={p} onClick={() => persist({ default_discount_percent: p })} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${settings.default_discount_percent === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{p}%</button>
            ))}
            <div className="flex-1">
              <Input type="number" min={0} max={100} value={settings.default_discount_percent ?? ""} onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v)) persist({ default_discount_percent: v }); }} className="h-8 text-xs text-center" placeholder="Outro" />
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Zona de Risco" danger>
        <SettingsRow icon={RefreshCw} label="Zerar Dados" description="Apaga todos os registros, mantém a conta" danger onClick={() => setResetOpen(true)} />
        <SettingsRow icon={Trash2} label="Excluir Conta" description="Remove todos os dados permanentemente" danger onClick={() => setDeleteOpen(true)} />
      </SettingsSection>

      {/* Reset Data Dialog */}
      <Dialog open={resetOpen} onOpenChange={(o) => { if (!resetting) setResetOpen(o); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-secondary"><RefreshCw className="w-5 h-5" /> Zerar Dados</DialogTitle>
            <DialogDescription>Todos os seus registros serão apagados permanentemente. Sua conta será mantida.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div>
              <Label className="text-xs text-muted-foreground">Confirme sua senha para continuar</Label>
              <Input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="••••••••" className="mt-1" disabled={resetting} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setResetOpen(false)} disabled={resetting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleResetData} disabled={resetting || !resetPassword}>
              {resetting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Zerando...</> : <><RefreshCw className="w-4 h-4 mr-2" /> Zerar tudo</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteOpen} onOpenChange={(o) => { if (!deleting) setDeleteOpen(o); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="w-5 h-5" /> Excluir Conta</DialogTitle>
            <DialogDescription>Esta ação é <strong>irreversível</strong>. Todos os seus dados serão apagados permanentemente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div>
              <Label className="text-xs text-muted-foreground">Confirme seu e-mail</Label>
              <Input value={deleteEmail} onChange={(e) => setDeleteEmail(e.target.value)} placeholder={user?.email ?? "seu@email.com"} className="mt-1" disabled={deleting} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Digite: <span className="font-mono font-bold text-destructive">DELETAR MINHA CONTA</span></Label>
              <Input value={deletePhrase} onChange={(e) => setDeletePhrase(e.target.value)} placeholder="DELETAR MINHA CONTA" className="mt-1 font-mono" disabled={deleting} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting || !deleteEmail || !deletePhrase}>
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Excluindo...</> : <><Trash2 className="w-4 h-4 mr-2" /> Excluir permanentemente</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {tourActive && <TourTooltip steps={tourSteps} tourKey="configuracoes" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
