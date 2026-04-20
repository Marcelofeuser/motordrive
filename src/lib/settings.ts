import { supabase } from "@/integrations/supabase/client";

export type UserSettings = {
  notifications_enabled: boolean;
  cnh_alert_enabled: boolean;
  fines_alert_enabled: boolean;
  discount_alert_enabled: boolean;
  ipva_alert_enabled: boolean;
  insurance_alert_enabled: boolean;
  maintenance_alert_enabled: boolean;
  ai_extract_documents: boolean;
  ai_financial_copilot: boolean;
  default_state: string | null;
  default_discount_percent: number | null;
  theme: string | null;
  language: string | null;
  currency: string | null;
};

export const DEFAULT_SETTINGS: UserSettings = {
  notifications_enabled: true,
  cnh_alert_enabled: true,
  fines_alert_enabled: true,
  discount_alert_enabled: true,
  ipva_alert_enabled: true,
  insurance_alert_enabled: true,
  maintenance_alert_enabled: true,
  ai_extract_documents: true,
  ai_financial_copilot: false,
  default_state: "GO",
  default_discount_percent: 40,
  theme: "dark",
  language: "pt-BR",
  currency: "BRL",
};

function toErrorMessage(error: unknown) {
  return String(
    (typeof error === "object" && error && "message" in error
      ? (error as { message?: unknown }).message
      : "") || "",
  ).trim();
}

export function isMissingUserSettingsTableError(error: unknown) {
  const message = toErrorMessage(error).toLowerCase();
  return (
    message.includes("public.user_settings") &&
    (message.includes("schema cache") || message.includes("could not find the table"))
  );
}

export async function getOrCreateSettings() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    if (isMissingUserSettingsTableError(error)) {
      return {
        user_id: user.id,
        ...DEFAULT_SETTINGS,
      };
    }
    throw error;
  }

  if (data) return data;

  const { data: inserted, error: insertError } = await supabase
    .from("user_settings")
    .insert({
      user_id: user.id,
      ...DEFAULT_SETTINGS,
    })
    .select("*")
    .single();

  if (insertError) throw insertError;
  return inserted;
}

export async function updateSettings(patch: Partial<UserSettings>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("user_settings")
    .update(patch)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    if (isMissingUserSettingsTableError(error)) {
      return {
        user_id: user.id,
        ...DEFAULT_SETTINGS,
        ...patch,
      };
    }
    throw error;
  }
  return data;
}
