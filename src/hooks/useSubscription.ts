import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Subscription {
  status: string;
  plan: string;
  current_period_end: string | null;

}

export function useSubscription() {
  const { user } = useAuth();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("subscriptions")
      .select("status, plan, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setSub(data);
        setLoading(false);
      });
  }, [user]);

  const isPro = sub !== null && ["active", "trialing"].includes(sub.status);
  const isTrialing = sub?.status === "trialing";
  const isCanceled = sub?.status === "canceled";

  // Considera trial de 7 dias para novos usuarios sem subscription
  const createdAt = user?.created_at ? new Date(user.created_at) : null;
  const trialDaysLeft = createdAt
    ? Math.max(0, 7 - Math.floor((Date.now() - createdAt.getTime()) / 86400000))
    : 0;
  const isInFreeTrial = !sub && trialDaysLeft > 0;

  const hasProAccess = isPro || isInFreeTrial;

  return { sub, loading, isPro, isTrialing, isCanceled, isInFreeTrial, trialDaysLeft, hasProAccess };
}