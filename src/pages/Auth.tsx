import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Mail, Lock, User, Zap } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<null | "google" | "apple">(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate("/", { replace: true });
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        navigate("/", { replace: true });
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: name.trim() },
        },
      });

      if (signUpError) throw signUpError;

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (loginError) throw loginError;

      toast({
        title: "Conta criada!",
        description: "Cadastro realizado com sucesso.",
      });

      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("[AUTH EMAIL]", err);
      toast({
        title: "Erro",
        description: err?.message || "Falha na autenticação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setOauthLoading(provider);

    try {
      if (provider === "apple") {
        toast({
          title: "Apple temporariamente indisponível",
          description: "Configure o provider Apple no Supabase/Apple Developer antes de usar.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error(`[AUTH OAUTH ${provider}]`, err);
      toast({
        title: `Erro com ${provider === "google" ? "Google" : "Apple"}`,
        description: err?.message || "Falha ao iniciar autenticação",
        variant: "destructive",
      });
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tighter">
            Motor<span className="text-primary">Drive</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
            {isLogin ? "Entrar na conta" : "Criar conta"}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 gap-2 glass-card border-border"
            onClick={() => handleOAuth("google")}
            disabled={loading || oauthLoading !== null}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {oauthLoading === "google" ? "Conectando..." : "Continuar com Google"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 gap-2 glass-card border-border"
            onClick={() => handleOAuth("apple")}
            disabled={loading || oauthLoading !== null}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            {oauthLoading === "apple" ? "Conectando..." : "Continuar com Apple"}
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12 bg-muted/30 border-border"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 bg-muted/30 border-border"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 bg-muted/30 border-border"
              minLength={8}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary text-black font-display font-bold text-sm uppercase tracking-wider"
            disabled={loading || oauthLoading !== null}
          >
            {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
          </Button>
        </form>

        {isLogin && (
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={async () => {
                if (!email) {
                  toast({
                    title: "Digite seu email primeiro",
                    variant: "destructive",
                  });
                  return;
                }

                const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
                  redirectTo: `${window.location.origin}/reset-password`,
                });

                if (error) {
                  toast({
                    title: "Erro",
                    description: error.message,
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: "Email enviado!",
                    description: "Verifique sua caixa de entrada.",
                  });
                }
              }}
              className="text-xs text-primary hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-4">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </motion.div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
