import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTRACT_PROMPT = `Você é um especialista em extrair dados de extratos e comprovantes do aplicativo 99 Motorista.
Analise a imagem/documento fornecido e extraia os dados de ganhos em JSON:

{
  "entries": [
    {
      "trip_date": "AAAA-MM-DD",
      "gross_earnings": número,
      "net_earnings": número,
      "bonuses": número,
      "fees": número,
      "online_hours": número,
      "confidence": "alta" | "media" | "baixa"
    }
  ],
  "summary": "resumo breve do que foi encontrado"
}

Regras:
- Se o documento cobre um período (ex: semana ou mês), crie uma entrada por dia ou por período identificável.
- Se só há um total sem datas específicas, crie uma entrada com a data mais provável.
- gross_earnings = ganho bruto (antes de taxas)
- net_earnings = ganho líquido (após taxas da plataforma)
- bonuses = bônus, incentivos, promoções
- fees = taxas cobradas pela plataforma
- online_hours = horas online (0 se não informado)
- confidence = "alta" se os dados estão claramente visíveis, "media" se parcialmente visíveis, "baixa" se estimados
- Retorne APENAS o JSON, sem explicações adicionais.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();

    let imageBase64: string;
    let mimeType: string;
    let importId: string | undefined;

    if (body.importId) {
      // New flow: fetch file from storage
      importId = body.importId;

      const { data: importRow, error: importError } = await admin
        .from("earnings_imports")
        .select("*")
        .eq("id", importId)
        .single();

      if (importError || !importRow) {
        return new Response(JSON.stringify({ error: "Importação não encontrada" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!importRow.storage_path) {
        return new Response(JSON.stringify({ error: "Arquivo não encontrado no storage" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: fileData, error: downloadError } = await admin.storage
        .from("earnings-imports")
        .download(importRow.storage_path);

      if (downloadError || !fileData) {
        await admin
          .from("earnings_imports")
          .update({ status: "error", error_message: "Falha ao baixar arquivo do storage" })
          .eq("id", importId);
        return new Response(JSON.stringify({ error: "Falha ao baixar arquivo" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      imageBase64 = btoa(String.fromCharCode(...uint8Array));
      mimeType = importRow.mime_type || "image/jpeg";

      await admin
        .from("earnings_imports")
        .update({ status: "processing" })
        .eq("id", importId);
    } else if (body.imageBase64) {
      // Legacy flow: base64 sent directly
      imageBase64 = body.imageBase64;
      mimeType = body.mimeType || "image/jpeg";
    } else {
      return new Response(JSON.stringify({ error: "Forneça importId ou imageBase64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call AI gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: EXTRACT_PROMPT },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
              },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      const errMsg =
        aiResponse.status === 429
          ? "Muitas requisições. Tente novamente em instantes."
          : aiResponse.status === 402
          ? "Créditos de IA esgotados."
          : "Erro ao processar documento com IA.";

      if (importId) {
        await admin
          .from("earnings_imports")
          .update({ status: "error", error_message: errMsg })
          .eq("id", importId);
      }

      return new Response(JSON.stringify({ error: errMsg }), {
        status: aiResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResponse.json();
    const content = aiJson.choices?.[0]?.message?.content || "";

    // Strip markdown code blocks if present
    let jsonStr = content;
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) jsonStr = match[1];

    type ParsedEntry = { trip_date: string; gross_earnings: number; net_earnings: number; bonuses: number; fees: number; online_hours: number; confidence: string };
    let parsed: { entries: ParsedEntry[]; summary?: string };
    try {
      parsed = JSON.parse(jsonStr.trim());
    } catch {
      if (importId) {
        await admin
          .from("earnings_imports")
          .update({ status: "error", error_message: "Não foi possível interpretar resposta da IA" })
          .eq("id", importId);
      }
      return new Response(
        JSON.stringify({ error: "Não foi possível extrair dados. Tente com uma imagem mais nítida." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];

    if (importId) {
      await admin
        .from("earnings_imports")
        .update({
          status: "processed",
          extracted_payload: { entries, summary: parsed.summary ?? "" },
        })
        .eq("id", importId);
    }

    return new Response(
      JSON.stringify({ entries, summary: parsed.summary ?? "", importId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("extract-99-statement error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
