path = "src/pages/Admin.tsx"

with open(path, "r") as f:
    content = f.read()

old = """  useEffect(() => {
    if (!user && !loading) { navigate("/login"); return; }
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/login"); return; }
    const { data, error } = await supabase.from("admins").select("id").eq("user_id", session.user.id).maybeSingle();
    console.log("admin check:", data, error);
    if (!data) { navigate("/"); return; }
    setIsAdmin(true);
    loadMetrics();
    setLoading(false);
  };"""

new = """  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    checkAdmin();
  }, [user, authLoading]);

  const checkAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      console.log("admin check:", data, error);

      if (!data) { navigate("/"); return; }

      setIsAdmin(true);
      await loadMetrics();
    } finally {
      setLoading(false);
    }
  };"""

if old in content:
    content = content.replace(old, new)
    with open(path, "w") as f:
        f.write(content)
    print("✅ Fix aplicado com sucesso!")
else:
    print("❌ Trecho não encontrado.")
