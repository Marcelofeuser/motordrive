import { useEffect, useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Car, Sparkles, Upload, Loader2, CheckCircle2, Trash2,
  Plug, Clock, PlusCircle, ShieldAlert, KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";

type Provider = "uber" | "99";
type Status = "disconnected" | "pending" | "connected" | "error" | "manual";

interface Integration {
  id: string;
  provider: Provider;
  status: Status;
  account_label: string | null;
  last_synced_at: string | null;
}

interface ParsedEntry {
  trip_date: string;
  gross_earnings: number;
  net_earnings: number;
  bonuses: number;
  fees: number;
  online_hours: number;
  confidence: "alta" | "media" | "baixa";
}

const STATUS_LABEL: Record<Status, { label: string; className: string }> = {
  disconnected: { label: "Desconectado", className: "bg-muted text-muted-foreground" },
  pending: { label: "Aprovação pendente", className: "bg-warning/20 text-warning" },
  connected: { label: "Conectado", className: "bg-accent/20 text-accent" },
  error: { label: "Erro", className: "bg-destructive/20 text-destructive" },
  manual: { label: "Modo manual", className: "bg-primary/15 text-primary" },
};

export default function Integracoes() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_integracoes"));
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  // 99 import flow
  const [importing, setImporting] = useState(false);
  const [parsed, setParsed] = useState<ParsedEntry[] | null>(null);
  const [parsedSummary, setParsedSummary] = useState<string>("");
  const [currentImportId, setCurrentImportId] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Manual entry dialog
  const [manualOpen, setManualOpen] = useState(false);
  const [manualProvider, setManualProvider] = useState<Provider>("uber");
  const [manualForm, setManualForm] = useState({
    trip_date: new Date().toISOString().slice(0, 10),
    gross_earnings: "",
    net_earnings: "",
    bonuses: "",
    fees: "",
    online_hours: "",
  });

  useEffect(() => {
    loadIntegrations();
  }, [user?.id]);

  const loadIntegrations = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("integrations")
      .select("id, provider, status, account_label, last_synced_at")
      .eq("user_id", user.id);
    if (error) {
      toast.error("Erro ao carregar integrações");
    } else {
      setIntegrations((data || []) as Integration[]);
    }
    setLoading(false);
  };

  const getIntegration = (provider: Provider): Integration | undefined =>
    integrations.find((i) => i.provider === provider);

  const upsertIntegration = async (provider: Provider, patch: Partial<Integration>) => {
    if (!user) return;
    const existing = getIntegration(provider);
    if (existing) {
      const { error } = await supabase
        .from("integrations")
        .update(patch)
        .eq("id", existing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase
        .from("integrations")
        .insert({ user_id: user.id, provider, status: "disconnected", ...patch });
      if (error) return toast.error(error.message);
    }
    await loadIntegrations();
  };

  const connectUber = async () => {
    await upsertIntegration("uber", { status: "pending", account_label: user?.email ?? null });
    toast.success("Solicitação enviada", {
      description: "A conexão com a Uber requer aprovação de acesso limitado à Driver API.",
    });
  };

  const disconnect = async (provider: Provider) => {
    const existing = getIntegration(provider);
    if (!existing) return;
    const { error } = await supabase.from("integrations").delete().eq("id", existing.id);
    if (error) return toast.error(error.message);
    toast.success(`Desconectado de ${provider === "uber" ? "Uber" : "99"}`);
    await loadIntegrations();
  };

  const setManualMode = async (provider: Provider) => {
    await upsertIntegration(provider, { status: "manual", account_label: "Entrada manual" });
    toast.success("Modo manual ativado");
    setManualProvider(provider);
    setManualOpen(true);
  };

  // ===== 99 import flow =====
  const handleFile = async (file: File) => {
    if (!user) return;
    setImporting(true);
    setParsed(null);
    setCurrentImportId(null);
    setSourceFile(file.name);

    try {
      // 1. Upload to Storage
      const storagePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("earnings-imports")
        .upload(storagePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      // 2. Create earnings_imports row
      const { data: importRow, error: insertError } = await supabase
        .from("earnings_imports")
        .insert({
          user_id: user.id,
          provider: "99",
          storage_path: storagePath,
          original_filename: file.name,
          mime_type: file.type || "image/jpeg",
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError || !importRow) throw insertError ?? new Error("Falha ao criar registro");

      setCurrentImportId(importRow.id);

      // 3. Invoke edge function with importId
      const { data, error } = await supabase.functions.invoke("extract-99-statement", {
        body: { importId: importRow.id },
      });

      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);

      const entries: ParsedEntry[] = (data as { entries?: ParsedEntry[] })?.entries ?? [];
      if (!entries.length) {
        toast.error("Nenhum dado identificado. Tente outra imagem.");
      } else {
        setParsed(entries);
        setParsedSummary((data as { summary?: string })?.summary ?? "");
        toast.success(`${entries.length} registro(s) extraído(s)`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao processar arquivo";
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  const savePreview = async () => {
    if (!user || !parsed) return;
    setSaving(true);
    try {
      const rows = parsed.map((p) => ({
        user_id: user.id,
        provider: "99" as const,
        trip_date: p.trip_date,
        gross_earnings: p.gross_earnings,
        net_earnings: p.net_earnings,
        bonuses: p.bonuses,
        fees: p.fees,
        online_hours: p.online_hours,
        source: "ai" as const,
        import_id: currentImportId ?? undefined,
      }));

      const { error } = await supabase.from("manual_earnings").insert(rows);
      if (error) throw error;

      await upsertIntegration("99", {
        status: "connected",
        account_label: "Importação por IA",
        last_synced_at: new Date().toISOString(),
      });

      toast.success(`${rows.length} registro(s) salvos com sucesso`);
      setParsed(null);
      setSourceFile("");
      setCurrentImportId(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar registros");
    } finally {
      setSaving(false);
    }
  };

  const updateParsed = (i: number, key: keyof ParsedEntry, value: string) => {
    if (!parsed) return;
    const next = [...parsed];
    const v = key === "trip_date" || key === "confidence" ? value : Number(value || 0);
    (next[i] as Record<string, unknown>)[key] = v;
    setParsed(next);
  };

  const removeParsed = (i: number) => {
    if (!parsed) return;
    const next = parsed.filter((_, idx) => idx !== i);
    setParsed(next.length ? next : null);
  };

  // ===== manual entry =====
  const submitManual = async () => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      provider: manualProvider,
      trip_date: manualForm.trip_date,
      gross_earnings: Number(manualForm.gross_earnings || 0),
      net_earnings: Number(manualForm.net_earnings || 0),
      bonuses: Number(manualForm.bonuses || 0),
      fees: Number(manualForm.fees || 0),
      online_hours: Number(manualForm.online_hours || 0),
      source: "manual" as const,
    };
    const { error } = await supabase.from("manual_earnings").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Registro manual salvo");
    setManualOpen(false);
    setManualForm({
      trip_date: new Date().toISOString().slice(0, 10),
      gross_earnings: "", net_earnings: "", bonuses: "", fees: "", online_hours: "",
    });
  };

  const uber = getIntegration("uber");
  const noventaENove = getIntegration("99");

  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Integrações" subtitle="Plataformas conectadas" showBack />
      <div className="flex justify-end -mt-2 mb-2"><button onClick={() => { localStorage.removeItem("tour_integracoes"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"><HelpCircle className="w-4 h-4" /> Ajuda</button></div>

      {/* Uber */}
      <ProviderCard
        title="Uber"
        subtitle="Conexão OAuth com a Driver API"
        icon={<Car className="w-5 h-5" />}
        status={uber?.status ?? "disconnected"}
        accountLabel={uber?.account_label}
        synced={uber?.last_synced_at}
      >
        <div className="rounded-xl bg-warning/10 border border-warning/30 p-3 flex gap-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="text-[11px] leading-snug text-warning-foreground/90">
            A <strong>Uber Driver API</strong> exige aprovação de acesso limitado.
            Após "Conectar Uber" sua solicitação ficará como <em>aprovação pendente</em> até liberação oficial.
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Dados sincronizados: <strong>perfil</strong>, <strong>corridas</strong>, <strong>ganhos</strong>.
        </p>
        <div className="flex gap-2">
          {uber?.status === "connected" || uber?.status === "pending" ? (
            <Button variant="outline" className="flex-1" onClick={() => disconnect("uber")}>
              <Trash2 className="w-4 h-4 mr-1.5" /> Desconectar
            </Button>
          ) : (
            <Button className="flex-1" onClick={connectUber}>
              <Plug className="w-4 h-4 mr-1.5" /> Conectar Uber
            </Button>
          )}
          <Button variant="secondary" onClick={() => setManualMode("uber")}>
            <KeyRound className="w-4 h-4 mr-1.5" /> Manual
          </Button>
        </div>
      </ProviderCard>

      {/* 99 */}
      <ProviderCard
        title="99 Motorista"
        subtitle="Importação por IA (sem API pública)"
        icon={<Sparkles className="w-5 h-5" />}
        status={noventaENove?.status ?? "disconnected"}
        accountLabel={noventaENove?.account_label}
        synced={noventaENove?.last_synced_at}
      >
        <div className="rounded-xl bg-muted/40 border border-border p-3 mb-3">
          <p className="text-[11px] leading-snug text-muted-foreground">
            A 99 não disponibiliza API pública para motoristas. Envie <strong>prints</strong>,{" "}
            <strong>PDFs</strong> ou comprovantes do app — a IA extrai automaticamente data, ganhos brutos/líquidos,
            bônus, taxas e horas online.
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/60 transition-colors p-5 flex flex-col items-center gap-2 mb-3 disabled:opacity-60"
        >
          {importing ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <Upload className="w-6 h-6 text-primary" />
          )}
          <span className="text-sm font-semibold">
            {importing ? "Enviando e analisando com IA..." : "Enviar print, PDF ou extrato"}
          </span>
          <span className="text-[11px] text-muted-foreground">JPG, PNG ou PDF • máx 10 MB</span>
        </button>

        <div className="flex gap-2">
          {noventaENove && (
            <Button variant="outline" className="flex-1" onClick={() => disconnect("99")}>
              <Trash2 className="w-4 h-4 mr-1.5" /> Remover
            </Button>
          )}
          <Button variant="secondary" className="flex-1" onClick={() => setManualMode("99")}>
            <PlusCircle className="w-4 h-4 mr-1.5" /> Adicionar manual
          </Button>
        </div>
      </ProviderCard>

      {/* Parsed preview */}
      {parsed && (
        <section className="mb-6">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
            Pré-visualização — {sourceFile}
          </h3>
          {parsedSummary && (
            <p className="text-xs text-muted-foreground mb-2 px-1">{parsedSummary}</p>
          )}
          <div className="space-y-3">
            {parsed.map((p, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant="outline"
                    className={
                      p.confidence === "alta"
                        ? "border-accent/50 text-accent"
                        : p.confidence === "media"
                        ? "border-warning/50 text-warning"
                        : "border-destructive/50 text-destructive"
                    }
                  >
                    Confiança: {p.confidence}
                  </Badge>
                  <button
                    onClick={() => removeParsed(i)}
                    className="text-destructive text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remover
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Data" type="date" value={p.trip_date} onChange={(v) => updateParsed(i, "trip_date", v)} />
                  <Field label="Horas online" value={String(p.online_hours)} onChange={(v) => updateParsed(i, "online_hours", v)} />
                  <Field label="Bruto (R$)" value={String(p.gross_earnings)} onChange={(v) => updateParsed(i, "gross_earnings", v)} />
                  <Field label="Líquido (R$)" value={String(p.net_earnings)} onChange={(v) => updateParsed(i, "net_earnings", v)} />
                  <Field label="Bônus (R$)" value={String(p.bonuses)} onChange={(v) => updateParsed(i, "bonuses", v)} />
                  <Field label="Taxas (R$)" value={String(p.fees)} onChange={(v) => updateParsed(i, "fees", v)} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" className="flex-1" onClick={() => setParsed(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={savePreview} disabled={saving}>
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Salvando...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Salvar tudo</>
              )}
            </Button>
          </div>
        </section>
      )}

      {/* Manual dialog */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Entrada manual — {manualProvider === "uber" ? "Uber" : "99"}
            </DialogTitle>
            <DialogDescription>
              Use este modo se a integração não estiver disponível.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Data" type="date" value={manualForm.trip_date}
              onChange={(v) => setManualForm({ ...manualForm, trip_date: v })} />
            <Field label="Horas online" value={manualForm.online_hours}
              onChange={(v) => setManualForm({ ...manualForm, online_hours: v })} />
            <Field label="Bruto (R$)" value={manualForm.gross_earnings}
              onChange={(v) => setManualForm({ ...manualForm, gross_earnings: v })} />
            <Field label="Líquido (R$)" value={manualForm.net_earnings}
              onChange={(v) => setManualForm({ ...manualForm, net_earnings: v })} />
            <Field label="Bônus (R$)" value={manualForm.bonuses}
              onChange={(v) => setManualForm({ ...manualForm, bonuses: v })} />
            <Field label="Taxas (R$)" value={manualForm.fees}
              onChange={(v) => setManualForm({ ...manualForm, fees: v })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualOpen(false)}>Cancelar</Button>
            <Button onClick={submitManual}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading && (
        <p className="text-center text-xs text-muted-foreground mt-4">Carregando...</p>
      )}
    </div>
  );
}

function ProviderCard({
  title, subtitle, icon, status, accountLabel, synced, children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  status: Status;
  accountLabel?: string | null;
  synced?: string | null;
  children: React.ReactNode;
}) {
  const s = STATUS_LABEL[status];
  return (
    <section className="mb-5 rounded-2xl bg-card border border-border p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-display font-bold">{title}</h2>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${s.className}`}>
              {s.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          {accountLabel && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{accountLabel}</p>
          )}
          {synced && (
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Sincronizado em {new Date(synced).toLocaleString("pt-BR")}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  const tourSteps = [{ target: "h1", title: "Integrações 🔗", description: "Conecte o MotorDrive com outros apps." }];


  return (
    <div>
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        inputMode={type === "text" ? "decimal" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-sm"
      />
      {tourActive && <TourTooltip steps={tourSteps} tourKey="integracoes" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
