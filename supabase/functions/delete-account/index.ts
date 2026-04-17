import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type DeleteAccountRequest = {
  confirmedEmail?: string;
  confirmationPhrase?: string;
};

const REQUIRED_CONFIRMATION_PHRASE = "DELETAR MINHA CONTA";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return jsonResponse(
        {
          error:
            "Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY",
        },
        500,
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing Authorization header" }, 401);
    }

    let body: DeleteAccountRequest = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const confirmedEmail = String(body.confirmedEmail || "").trim().toLowerCase();
    const confirmationPhrase = String(body.confirmationPhrase || "").trim();

    if (!confirmedEmail || confirmedEmail !== String(user.email || "").trim().toLowerCase()) {
      return jsonResponse({ error: "E-mail de confirmação inválido" }, 400);
    }

    if (confirmationPhrase !== REQUIRED_CONFIRMATION_PHRASE) {
      return jsonResponse({ error: "Frase de confirmação inválida" }, 400);
    }

    const userId = user.id;

    const { data: deletionRequest, error: deletionInsertError } = await admin
      .from("account_deletion_requests")
      .insert({
        user_id: userId,
        reason: `Solicitado pelo usuário: ${user.email ?? "desconhecido"}`,
        status: "processing",
      })
      .select("id")
      .single();

    if (deletionInsertError) {
      return jsonResponse(
        { error: `Erro ao registrar solicitação de exclusão: ${deletionInsertError.message}` },
        500,
      );
    }

    const deletionRequestId = deletionRequest.id;

    const cleanupResults: Array<{ table: string; ok: boolean; error?: string }> = [];

    const tablesToDelete = [
      "manual_earnings",
      "platform_imports",
      "earnings_imports",
      "integrations",
      "earnings",
      "fueling",
      "journeys",
      "goals",
      "electric_usage",
      "electric_charging",
      "electric_alerts",
      "user_settings",
      "profiles",
    ];

    for (const table of tablesToDelete) {
      const { error } = await admin.from(table).delete().eq("user_id", userId);

      if (error) {
        cleanupResults.push({
          table,
          ok: false,
          error: error.message,
        });
      } else {
        cleanupResults.push({
          table,
          ok: true,
        });
      }
    }

    // remove arquivos do bucket de importações, se existir
    try {
      const { data: files, error: listError } = await admin.storage
        .from("earnings-imports")
        .list(userId, {
          limit: 1000,
          offset: 0,
        });

      if (!listError && files?.length) {
        const paths = files.map((file) => `${userId}/${file.name}`);
        const { error: removeError } = await admin.storage.from("earnings-imports").remove(paths);

        if (removeError) {
          cleanupResults.push({
            table: "storage/earnings-imports",
            ok: false,
            error: removeError.message,
          });
        } else {
          cleanupResults.push({
            table: "storage/earnings-imports",
            ok: true,
          });
        }
      }
    } catch (storageError) {
      cleanupResults.push({
        table: "storage/earnings-imports",
        ok: false,
        error: storageError instanceof Error ? storageError.message : String(storageError),
      });
    }

    const failedCleanups = cleanupResults.filter((item) => !item.ok);

    if (failedCleanups.length > 0) {
      await admin
        .from("account_deletion_requests")
        .update({
          status: "failed",
        })
        .eq("id", deletionRequestId);

      return jsonResponse(
        {
          error: "Falha ao limpar todos os dados do usuário antes de excluir a conta",
          details: failedCleanups,
        },
        500,
      );
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      await admin
        .from("account_deletion_requests")
        .update({
          status: "failed",
        })
        .eq("id", deletionRequestId);

      return jsonResponse({ error: deleteUserError.message }, 500);
    }

    await admin
      .from("account_deletion_requests")
      .update({
        status: "completed",
      })
      .eq("id", deletionRequestId);

    return jsonResponse({
      success: true,
      message: "Conta excluída com sucesso",
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});