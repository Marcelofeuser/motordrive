import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Users, DollarSign, TrendingUp, Activity, LogOut, Shield, Trash2, Ban, CheckCircle, BarChart3, Settings, Gift, Copy, Calendar } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: string; email: string; created_at: string; last_sign_in_at: string | null;
  banned_until: string | null; earnings_count: number; total_earned: number;
}

interface Metrics {
  totalUsers: number; activeToday: number; totalEarnings: number; avgEarningsPerUser: number;
  newThisWeek: number; newThisMonth: number;
}

type Tab = "dashboard" | "users" | "vouchers" | "settings";

export default function Admin() {
  const { user, session, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [metrics, setMetrics] = useState<Metrics>({ totalUsers: 0, activeToday: 0, totalEarnings: 0, avgEarningsPerUser: 0, newThisWeek: 0, newThisMonth: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vExpiry, setVExpiry] = useState("");
  const [vVitalicio, setVVitalicio] = useState(false);
  const [vLoading, setVLoading] = useState(false);
  const [vResult, setVResult] = useState<{link: string; senha: string; email: string} | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    checkAdmin();
  }, [user, authLoading]);

  const checkAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", session!.user.id)
        .maybeSingle();

      console.log("admin check:", data, error);

      if (!data) { navigate("/"); return; }

      setIsAdmin(true);
      await loadMetrics();
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);

    const [{ count: totalUsers }, { data: earningsData }, { count: newWeek }, { count: newMonth }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("earnings").select("bruto,gorjetas,bonus,user_id"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", monthAgo.toISOString()),
    ]);

    const totalEarnings = (earningsData ?? []).reduce((s: number, e: any) => s + Number(e.bruto) + Number(e.gorjetas) + Number(e.bonus), 0);
    const uniqueUsers = new Set((earningsData ?? []).map((e: any) => e.user_id)).size;

    setMetrics({
      totalUsers: totalUsers ?? 0,
      activeToday: 0,
      totalEarnings,
      avgEarningsPerUser: uniqueUsers > 0 ? totalEarnings / uniqueUsers : 0,
      newThisWeek: newWeek ?? 0,
      newThisMonth: newMonth ?? 0,
    });
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, created_at");
    const { data: earningsData } = await supabase.from("earnings").select("user_id, bruto, gorjetas, bonus");

    const earningsMap: Record<string, { count: number; total: number }> = {};
    (earningsData ?? []).forEach((e: any) => {
      if (!earningsMap[e.user_id]) earningsMap[e.user_id] = { count: 0, total: 0 };
      earningsMap[e.user_id].count++;
      earningsMap[e.user_id].total += Number(e.bruto) + Number(e.gorjetas) + Number(e.bonus);
    });

    const rows: UserRow[] = (profiles ?? []).map((p: any) => ({
      id: p.user_id,
      email: p.display_name ?? p.user_id.slice(0, 8) + "...",
      created_at: p.created_at,
      last_sign_in_at: null,
      banned_until: null,
      earnings_count: earningsMap[p.user_id]?.count ?? 0,
      total_earned: earningsMap[p.user_id]?.total ?? 0,
    }));

    setUsers(rows);
    setUsersLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza? Esta ação é irreversível.")) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const { error } = await supabase.functions.invoke("delete-account", {
      body: { userId },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (error) { toast.error("Erro ao deletar usuário"); return; }
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success("Usuário deletado!");
  };

  const createVoucher = async () => {
    if (!vEmail) { toast.error("Informe o email"); return; }
    if (!vVitalicio && !vExpiry) { toast.error("Informe a data ou marque vitalício"); return; }
    setVLoading(true);
    setVResult(null);
    try {
      const senha = "Motor@" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const serviceKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Cria usuário via edge function ou direto
      const { data: { session: adminSession } } = await supabase.auth.getSession();
      const token = adminSession?.access_token;
      
      // Tenta criar usuário
      const { data, error: fnError } = await supabase.functions.invoke("create-voucher", {
        body: { email: vEmail, password: senha, expiry: vExpiry, vitalicio: vVitalicio },
        headers: { Authorization: "Bearer " + token },
      });
      if (fnError || !data?.success) { toast.error("Erro: " + (fnError?.message || data?.error || "Tente novamente")); setVLoading(false); return; }
      
      const link = `https://motordrive.app/login`;
      setVResult({ link, senha, email: vEmail });
      toast.success("Usuário criado com sucesso!");
      setVEmail("");
      setVExpiry("");
      setVVitalicio(false);
    } catch(e: any) {
      toast.error(e.message || "Erro ao criar voucher");
    } finally {
      setVLoading(false);
    }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search)
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0d14]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white font-sans">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d1117] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-lg tracking-tight">MotorDrive <span className="text-blue-400">Admin</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <button onClick={async () => { await signOut(); navigate("/login"); }} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {([
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "users", label: "Usuários", icon: Users },
            { id: "vouchers", label: "Vouchers", icon: Gift },
            { id: "settings", label: "Configurações", icon: Settings },
          ] as { id: Tab; label: string; icon: any }[]).map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "users") loadUsers(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total de Usuários", value: metrics.totalUsers, icon: Users, color: "text-blue-400" },
                { label: "Novos esta semana", value: metrics.newThisWeek, icon: TrendingUp, color: "text-green-400" },
                { label: "Novos este mês", value: metrics.newThisMonth, icon: Activity, color: "text-purple-400" },
                { label: "Faturamento total registrado", value: `R$ ${fmt(metrics.totalEarnings)}`, icon: DollarSign, color: "text-yellow-400" },
                { label: "Média por usuário", value: `R$ ${fmt(metrics.avgEarningsPerUser)}`, icon: BarChart3, color: "text-orange-400" },
              ].map((m, i) => (
                <div key={i} className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <m.icon className={`w-4 h-4 ${m.color}`} />
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{m.label}</p>
                  </div>
                  <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-gray-300">Planos · Em breve</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-400">—</p>
                  <p className="text-sm text-gray-400 mt-1">Trial Ativo</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-400">—</p>
                  <p className="text-sm text-gray-400 mt-1">Pro Ativo</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">Integração com Stripe disponível após configuração das chaves de API</p>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === "users" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">{users.length} usuários</h2>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por email ou ID..."
                className="bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 w-72 focus:outline-none focus:border-blue-500"
              />
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
            ) : (
              <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3">Usuário</th>
                      <th className="text-left px-4 py-3">Cadastro</th>
                      <th className="text-right px-4 py-3">Corridas</th>
                      <th className="text-right px-4 py-3">Faturamento</th>
                      <th className="text-right px-4 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, i) => (
                      <tr key={u.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{u.email}</p>
                          <p className="text-xs text-gray-500">{u.id.slice(0, 16)}...</p>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                        <td className="px-4 py-3 text-right text-gray-300">{u.earnings_count}</td>
                        <td className="px-4 py-3 text-right font-medium text-green-400">R$ {fmt(u.total_earned)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteUser(u.id)} className="text-red-400/50 hover:text-red-400 transition-colors ml-3">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-12 text-gray-500">Nenhum usuário encontrado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VOUCHERS TAB */}
        {tab === "vouchers" && (
          <div className="max-w-xl">
            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6 mb-4">
              <h3 className="font-semibold mb-1 flex items-center gap-2"><Gift className="w-4 h-4 text-blue-400" /> Criar Acesso Pro</h3>
              <p className="text-sm text-gray-400 mb-4">Crie um acesso Pro para um usuário com prazo configurável.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Email do usuário</label>
                  <input value={vEmail} onChange={e => setVEmail(e.target.value)} placeholder="email@exemplo.com"
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="vitalicio" checked={vVitalicio} onChange={e => setVVitalicio(e.target.checked)}
                    className="w-4 h-4 accent-blue-500" />
                  <label htmlFor="vitalicio" className="text-sm text-gray-300 cursor-pointer">Acesso Vitalício</label>
                </div>
                {!vVitalicio && (
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3" /> Data de expiração</label>
                    <input type="date" value={vExpiry} onChange={e => setVExpiry(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                )}
                <button onClick={createVoucher} disabled={vLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  {vLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Gift className="w-4 h-4" /> Gerar Acesso</>}
                </button>
              </div>
            </div>

            {vResult && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <h3 className="font-semibold text-green-400 mb-3">✅ Acesso criado!</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Email cadastrado</p>
                    <p className="text-sm font-mono text-white">{vResult?.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Senha provisória</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono text-yellow-400 flex-1">{vResult.senha}</p>
                      <button onClick={() => { navigator.clipboard.writeText(vResult.senha); toast.success("Copiado!"); }}
                        className="text-gray-400 hover:text-white"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Link de acesso</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono text-blue-400 flex-1 break-all">{vResult.link}</p>
                      <button onClick={() => { navigator.clipboard.writeText(vResult.link); toast.success("Copiado!"); }}
                        className="text-gray-400 hover:text-white"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 mt-2">
                    <p className="text-xs text-gray-400 mb-1">Mensagem para enviar:</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {"Olá! Seu acesso ao MotorDrive Pro foi criado.\n\nSite: https://motordrive.app\nEmail: " + (vEmail || "") + "\nSenha: " + vResult.senha + "\n\nRecomendamos trocar a senha após o primeiro acesso."}
                    </p>
                    <button onClick={() => { navigator.clipboard.writeText("Olá! Seu acesso ao MotorDrive Pro foi criado.\n\nSite: https://motordrive.app\nEmail: " + (vEmail||"") + "\nSenha: " + vResult.senha + "\n\nRecomendamos trocar a senha após o primeiro acesso."); toast.success("Mensagem copiada!"); }}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar mensagem</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <div className="max-w-xl">
            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6 mb-4">
              <h3 className="font-semibold mb-4">Stripe · Pagamentos</h3>
              <p className="text-sm text-gray-400 mb-4">Configure as chaves do Stripe para habilitar a cobrança dos planos.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Chave Pública (pk_live_...)</label>
                  <input placeholder="pk_live_..." className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Chave Secreta (sk_live_...)</label>
                  <input type="password" placeholder="sk_live_..." className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors">
                  Salvar Chaves Stripe
                </button>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-red-500/20 rounded-xl p-6">
              <h3 className="font-semibold text-red-400 mb-2">Zona de Risco</h3>
              <p className="text-sm text-gray-400 mb-4">Ações irreversíveis do sistema.</p>
              <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-semibold transition-colors">
                Exportar todos os dados (CSV)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
