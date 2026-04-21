import TourTooltip from "@/components/TourTooltip";
import { HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import { Plus, Pencil, Trash2, PiggyBank, Check, X, ArrowDownCircle, ArrowUpCircle, History } from "lucide-react";
import { toast } from "sonner";

interface Reserva {
  id: string; nome: string; emoji: string; saldo: number; meta: number | null;
  tipo_aporte: "valor" | "percentual"; valor_aporte: number;
  frequencia: "diario" | "semanal" | "mensal"; cor: string; ativo: boolean;
  automatico: boolean;
}
interface Historico {
  id: string; tipo: "aporte" | "saque" | "ajuste"; valor: number;
  descricao: string | null; created_at: string;
}

const CORES = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"];
const EMOJIS = ["🪣","🚗","🛞","🔧","🏥","🏠","✈️","📱","⛽","🎯","💰","🛡️"];
const FREQ_LABEL: Record<string, string> = { diario: "Diário", semanal: "Semanal", mensal: "Mensal" };

export default function Reservas() {
  const [tourActive, setTourActive] = useState(!localStorage.getItem("tour_reservas"));
  const { user } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [showMovimento, setShowMovimento] = useState<"aporte" | "saque" | null>(null);
  const [movValor, setMovValor] = useState("");
  const [movDesc, setMovDesc] = useState("");
  const [form, setForm] = useState({
    nome: "", emoji: "🪣", cor: "#3b82f6", meta: "",
    tipo_aporte: "valor" as "valor" | "percentual",
    valor_aporte: "", frequencia: "mensal" as "diario" | "semanal" | "mensal", automatico: false,
  });

  useEffect(() => { if (user) fetchReservas(); }, [user]);

  const fetchReservas = async () => {
    const { data } = await supabase.from("reservas").select("*").eq("user_id", user!.id).eq("ativo", true).order("created_at");
    setReservas(data ?? []);
    setLoading(false);
  };

  const openNew = () => {
    setEditId(null);
    setForm({ nome: "", emoji: "🪣", cor: "#3b82f6", meta: "", tipo_aporte: "valor", valor_aporte: "", frequencia: "mensal", automatico: false });
    setShowForm(true);
  };

  const openEdit = (r: Reserva) => {
    setEditId(r.id);
    setForm({ nome: r.nome, emoji: r.emoji, cor: r.cor, meta: r.meta ? String(r.meta) : "", tipo_aporte: r.tipo_aporte, valor_aporte: String(r.valor_aporte), frequencia: r.frequencia, automatico: r.automatico ?? false });
    setShowForm(true);
  };

  const saveReserva = async () => {
    if (!form.nome.trim()) { toast.error("Nome obrigatório"); return; }
    const payload = {
      user_id: user!.id, nome: form.nome.trim(), emoji: form.emoji, cor: form.cor,
      meta: form.meta ? parseFloat(form.meta) : null, tipo_aporte: form.tipo_aporte,
      valor_aporte: parseFloat(form.valor_aporte) || 0, frequencia: form.frequencia, automatico: form.automatico,
      updated_at: new Date().toISOString(),
    };
    if (editId) {
      await supabase.from("reservas").update(payload).eq("id", editId);
      toast.success("Reserva atualizada!");
    } else {
      await supabase.from("reservas").insert({ ...payload, saldo: 0 });
      toast.success("Reserva criada!");
    }
    setShowForm(false);
    fetchReservas();
  };

  const deleteReserva = async (id: string) => {
    if (!confirm("Excluir esta reserva?")) return;
    await supabase.from("reservas").update({ ativo: false }).eq("id", id);
    toast.success("Reserva removida");
    fetchReservas();
  };

  const fetchHistorico = async (id: string) => {
    const { data } = await supabase.from("reservas_historico").select("*").eq("reserva_id", id).order("created_at", { ascending: false }).limit(20);
    setHistorico(data ?? []);
    setSelectedId(id);
    setShowHistorico(true);
  };

  const registrarMovimento = async () => {
    if (!movValor || !selectedId || !showMovimento) return;
    const valor = parseFloat(movValor);
    if (isNaN(valor) || valor <= 0) { toast.error("Valor inválido"); return; }
    const reserva = reservas.find(r => r.id === selectedId)!;
    const novoSaldo = showMovimento === "aporte" ? reserva.saldo + valor : reserva.saldo - valor;
    if (novoSaldo < 0) { toast.error("Saldo insuficiente"); return; }
    await supabase.from("reservas").update({ saldo: novoSaldo, updated_at: new Date().toISOString() }).eq("id", selectedId);
    await supabase.from("reservas_historico").insert({ reserva_id: selectedId, user_id: user!.id, tipo: showMovimento, valor, descricao: movDesc || null });
    toast.success(showMovimento === "aporte" ? "Aporte registrado!" : "Saque registrado!");
    setShowMovimento(null); setMovValor(""); setMovDesc("");
    fetchReservas();
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalReservado = reservas.reduce((s, r) => s + r.saldo, 0);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const tourSteps = [{ target: "h1", title: "Reservas 🪣", description: "Crie caixinhas de reserva para seus objetivos." }];


  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Reservas" subtitle="Seu cofre inteligente" />
      <div className="flex justify-end -mt-2 mb-2"><button onClick={() => { localStorage.removeItem("tour_reservas"); setTourActive(true); }} className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-xs"><HelpCircle className="w-4 h-4" /> Ajuda</button></div>
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <PiggyBank className="w-4 h-4 text-blue-400" />
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Reservado</p>
        </div>
        <p className="text-3xl font-bold text-white">R$ {fmt(totalReservado)}</p>
        <p className="text-xs text-gray-500 mt-1">{reservas.length} reserva{reservas.length !== 1 ? "s" : ""} ativa{reservas.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="space-y-3 mb-6">
        {reservas.map((r) => {
          const pct = r.meta ? Math.min((r.saldo / r.meta) * 100, 100) : null;
          return (
            <div key={r.id} className="bg-[#0d1117] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: r.cor + "33", border: `1px solid ${r.cor}44` }}>{r.emoji}</div>
                  <div>
                    <p className="font-semibold text-sm">{r.nome}</p>
                    <p className="text-xs text-gray-500">{r.tipo_aporte === "valor" ? `R$ ${fmt(r.valor_aporte)}` : `${r.valor_aporte}%`} · {FREQ_LABEL[r.frequencia]} {r.automatico ? "· ⚡ Auto" : "· ✋ Manual"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" style={{ color: r.cor }}>R$ {fmt(r.saldo)}</p>
                  {r.meta && <p className="text-xs text-gray-500">meta R$ {fmt(r.meta)}</p>}
                </div>
              </div>
              {pct !== null && (
                <div className="mb-3">
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: r.cor }} />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{pct.toFixed(0)}% da meta</p>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setSelectedId(r.id); setShowMovimento("aporte"); }} className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all flex items-center justify-center gap-1">
                  <ArrowDownCircle className="w-3.5 h-3.5" /> Aportar
                </button>
                <button onClick={() => { setSelectedId(r.id); setShowMovimento("saque"); }} className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1">
                  <ArrowUpCircle className="w-3.5 h-3.5" /> Retirar
                </button>
                <button onClick={() => fetchHistorico(r.id)} className="px-2.5 py-1.5 rounded-lg text-xs bg-white/5 text-gray-400 hover:bg-white/10 transition-all"><History className="w-3.5 h-3.5" /></button>
                <button onClick={() => openEdit(r)} className="px-2.5 py-1.5 rounded-lg text-xs bg-white/5 text-gray-400 hover:bg-white/10 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteReserva(r.id)} className="px-2.5 py-1.5 rounded-lg text-xs bg-red-500/5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
        {reservas.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <PiggyBank className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma reserva ainda</p>
            <p className="text-xs mt-1">Crie sua primeira reserva abaixo</p>
          </div>
        )}
      </div>
      <button onClick={openNew} className="w-full py-3 rounded-2xl border border-dashed border-white/20 text-gray-400 hover:border-blue-500/40 hover:text-blue-400 transition-all flex items-center justify-center gap-2 text-sm">
        <Plus className="w-4 h-4" /> Nova Reserva
      </button>
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
          <div className="bg-[#0d1117] border border-white/10 rounded-t-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">{editId ? "Editar" : "Nova"} Reserva</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-2">Ícone</p>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (<button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))} className={`w-10 h-10 rounded-xl text-xl transition-all ${form.emoji === e ? "bg-blue-500/30 border border-blue-500" : "bg-white/5 border border-transparent"}`}>{e}</button>))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Cor</p>
                <div className="flex gap-2">
                  {CORES.map(c => (<button key={c} onClick={() => setForm(f => ({ ...f, cor: c }))} className={`w-8 h-8 rounded-full transition-all ${form.cor === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#0d1117]" : ""}`} style={{ backgroundColor: c }} />))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Nome</p>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Troca de óleo" maxLength={30} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Meta (opcional)</p>
                <input value={form.meta} onChange={e => setForm(f => ({ ...f, meta: e.target.value }))} type="number" placeholder="R$ 0,00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Tipo de aporte</p>
                <div className="flex gap-2">
                  {(["valor", "percentual"] as const).map(t => (<button key={t} onClick={() => setForm(f => ({ ...f, tipo_aporte: t }))} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${form.tipo_aporte === t ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400"}`}>{t === "valor" ? "Valor fixo" : "Percentual"}</button>))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">{form.tipo_aporte === "valor" ? "Valor (R$)" : "Percentual (%)"}</p>
                <input value={form.valor_aporte} onChange={e => setForm(f => ({ ...f, valor_aporte: e.target.value }))} type="number" placeholder={form.tipo_aporte === "valor" ? "50.00" : "5"} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Frequência</p>
                <div className="flex gap-2">
                  {(["diario", "semanal", "mensal"] as const).map(f => (<button key={f} onClick={() => setForm(fm => ({ ...fm, frequencia: f }))} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${form.frequencia === f ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400"}`}>{FREQ_LABEL[f]}</button>))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Alimentação</p>
                <div className="flex gap-2">
                  <button onClick={() => setForm(f => ({ ...f, automatico: false }))} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${!form.automatico ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400"}`}>Manual</button>
                  <button onClick={() => setForm(f => ({ ...f, automatico: true }))} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${form.automatico ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400"}`}>Automático</button>
                </div>
                {form.automatico && <p className="text-[10px] text-gray-500 mt-1.5">O aporte será descontado do lucro líquido conforme a frequência configurada</p>}
              </div>
              <button onClick={saveReserva} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> {editId ? "Salvar" : "Criar Reserva"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showMovimento && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
          <div className="bg-[#0d1117] border border-white/10 rounded-t-3xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">{showMovimento === "aporte" ? "💰 Aportar" : "💸 Retirar"}</h2>
              <button onClick={() => setShowMovimento(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Valor (R$)</p>
                <input value={movValor} onChange={e => setMovValor(e.target.value)} type="number" placeholder="0,00" autoFocus className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Descrição (opcional)</p>
                <input value={movDesc} onChange={e => setMovDesc(e.target.value)} placeholder="Ex: Troca de óleo feita" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <button onClick={registrarMovimento} className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${showMovimento === "aporte" ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"}`}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
      {showHistorico && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
          <div className="bg-[#0d1117] border border-white/10 rounded-t-3xl w-full max-h-[70vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Histórico</h2>
              <button onClick={() => setShowHistorico(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {historico.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">Nenhum movimento ainda</p>
            ) : (
              <div className="space-y-2">
                {historico.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-sm font-medium">{h.descricao || (h.tipo === "aporte" ? "Aporte" : "Saque")}</p>
                      <p className="text-xs text-gray-500">{new Date(h.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <p className={`font-bold text-sm ${h.tipo === "aporte" ? "text-green-400" : "text-red-400"}`}>{h.tipo === "aporte" ? "+" : "-"}R$ {fmt(h.valor)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {tourActive && <TourTooltip steps={tourSteps} tourKey="reservas" onFinish={() => setTourActive(false)} />}
    </div>
  );
}
