path = "src/pages/Admin.tsx"

with open(path, "r") as f:
    content = f.read()

old = '  const { user, signOut, loading: authLoading } = useAuth();'
new = '  const { user, session, signOut, loading: authLoading } = useAuth();'

content = content.replace(old, new)

old2 = """      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();"""

new2 = """      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", session!.user.id)
        .maybeSingle();"""

if old2 in content:
    content = content.replace(old2, new2)
    with open(path, "w") as f:
        f.write(content)
    print("✅ Fix 2 aplicado!")
else:
    print("❌ Trecho não encontrado.")
