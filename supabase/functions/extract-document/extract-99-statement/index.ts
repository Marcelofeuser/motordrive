import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurado");

    const systemPrompt = `Você analisa extratos, prints e comprovantes da plataforma 99 Motorista (Brasil).
Extraia ganhos por dia. Pode haver múltiplos dias. Responda SOMENTE chamando a função report_99_earnings.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "report_99_earnings",
          description: "Retorna lista de registros de ganhos diários da 99 extraídos do documento.",
          parameters: {
            type: "object",
            properties: {
              entries: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    trip_date: { type: "string", description: "Data no formato AAAA-MM-DD" },
                    gross_earnings: { type: "number", description: "Ganhos brutos em R$" },
                    net_earnings: { type: "number", description: "Ganhos líquidos em R$" },
                    bonuses: { type: "number", description: "Bônus/promoções em R$" },
                    fees: { type: "number", description: "Taxas da plataforma em R$" },
                    online_hours: { type: "number", description: "Horas online (decimal)" },
                    confidence: { type: "string", enum: ["alta", "media", "baixa"] },
                  },
                  required: ["trip_date", "gross_earnings", "net_earnings", "bonuses", "fees", "online_hours", "confidence"],
                  additionalProperties: false,
                },
              },
              summary: { type: "string", description: "Resumo curto do que foi identificado" },
            },
            required: ["entries", "summary"],
            additionalProperties: false,
          },
        },
      },
    ];

    const mt = mimeType || "image/jpeg";
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Extraia os ganhos da 99 deste documento." },
              { type: "image_url", image_url: { url: `data:${mt};base64,${imageBase64}` } },
            ],
          },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "report_99_earnings" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Erro ao processar documento" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ai = await response.json();
    const toolCall = ai.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Não foi possível extrair dados. Tente uma imagem mais nítida." }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const args = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-99-statement error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
