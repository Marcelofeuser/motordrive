import { supabase } from "@/supabase/client";

export async function upload99Statement(file: File) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const filePath = `${user.id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("earnings-imports")
    .upload(filePath, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data: importRow, error: importError } = await supabase
    .from("earnings_imports")
    .insert({
      user_id: user.id,
      provider: "99",
      file_name: file.name,
      file_url: filePath,
      status: "uploaded",
    })
    .select("*")
    .single();

  if (importError) throw importError;

  const { data, error } = await supabase.functions.invoke("extract-99-statement", {
    body: { importId: importRow.id },
  });

  if (error) throw error;

  return {
    importRow,
    extracted: data?.extracted,
  };
}

export async function save99Extracted(data: {
  trip_date: string;
  gross_earnings: number;
  net_earnings: number;
  bonuses: number;
  fees: number;
  online_hours: number;
  source_import_id?: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const { data: inserted, error } = await supabase
    .from("manual_earnings")
    .insert({
      user_id: user.id,
      provider: "99",
      ...data,
    })
    .select("*")
    .single();

  if (error) throw error;
  return inserted;
}