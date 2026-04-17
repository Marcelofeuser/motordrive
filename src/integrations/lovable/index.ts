import { supabase } from "@/integrations/supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  redirectTo?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: "google" | "apple" | "microsoft",
      opts?: SignInOptions,
    ) => {
      const redirectTo =
        opts?.redirectTo ||
        opts?.redirect_uri ||
        `${window.location.origin}/auth`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: opts?.extraParams,
        },
      });

      return {
        data,
        error,
        redirected: !error,
      };
    },
  },
};
