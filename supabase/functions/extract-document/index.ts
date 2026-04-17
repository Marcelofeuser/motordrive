import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, documentType } = await req.json();

    if (!imageBase64 || !documentType) {
      return new Response(JSON.stringify({ error: "imageBase64 and documentType are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompts: Record<string, string> = {
      multa: `Você é um especialista em multas de trânsito brasileiras. Analise esta imagem de multa/notificação e extraia os seguintes dados em JSON:
{
  "data_infracao": "DD/MM/AAAA ou null",
  "hora": "HH:MM ou null",
  "orgao": "nome do órgão autuador ou null",
  "estado": "UF ou null",
  "municipio": "nome ou null",
  "placa": "ABC-1234 ou ABC1D23 ou null",
  "auto_infracao": "número ou null",
  "codigo_infracao": "código ou null",
  "descricao": "descrição da infração ou null",
  "gravidade": "leve/média/grave/gravíssima ou null",
  "valor": número ou null,
  "pontos": número ou null,
  "vencimento": "DD/MM/AAAA ou null",
  "prazo_desconto": "DD/MM/AAAA ou null",
  "prazo_recurso": "DD/MM/AAAA ou null",
  "sne": true/false ou null,
  "elegivel_desconto": true/false ou null,
  "percentual_desconto": número ou null,
  "valor_com_desconto": número ou null
}
Para cada campo, inclua também um nível de confiança:
"confianca": { "campo": "alta/media/baixa" }
Retorne APENAS o JSON, sem explicações.`,

      cnh: `Você é um especialista em documentos brasileiros. Analise esta imagem de CNH e extraia os dados em JSON:
{
  "nome": "nome completo ou null",
  "cpf": "000.000.000-00 ou null",
  "data_nascimento": "DD/MM/AAAA ou null",
  "numero_registro": "número ou null",
  "categoria": "A/B/AB/C/D/E ou null",
  "validade": "DD/MM/AAAA ou null",
  "primeira_habilitacao": "DD/MM/AAAA ou null",
  "orgao_emissor": "DETRAN-UF ou null",
  "observacoes": "texto ou null",
  "ear": "sim/não ou null"
}
Para cada campo, inclua também:
"confianca": { "campo": "alta/media/baixa" }
Retorne APENAS o JSON.`,

      crv: `Você é um especialista em documentos veiculares brasileiros. Analise esta imagem de CRV/CRLV e extraia os dados em JSON:
{
  "marca": "marca ou null",
  "modelo": "modelo ou null",
  "ano_fabricacao": "AAAA ou null",
  "ano_modelo": "AAAA ou null",
  "placa": "ABC-1234 ou null",
  "cor": "cor ou null",
  "renavam": "número ou null",
  "chassi": "número ou null",
  "combustivel": "gasolina/etanol/diesel/flex/elétrico/híbrido ou null",
  "potencia": "número CV ou null",
  "cilindrada": "número cc ou null",
  "categoria": "particular/aluguel ou null",
  "municipio": "nome ou null",
  "estado": "UF ou null",
  "proprietario": "nome ou null",
  "cpf_cnpj": "número ou null"
}
Para cada campo, inclua também:
"confianca": { "campo": "alta/media/baixa" }
Retorne APENAS o JSON.`,
    };

    const systemPrompt = prompts[documentType];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: "Invalid documentType. Use: multa, cnh, crv" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Extraia os dados deste documento:" },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 400) {
        return new Response(JSON.stringify({ error: "Imagem não suportada. Tente com uma foto mais nítida ou em formato JPEG/PNG." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Erro ao processar documento" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];

    let extractedData;
    try {
      extractedData = JSON.parse(jsonStr.trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Não foi possível extrair dados. Tente com uma imagem mais nítida.", raw: content }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: extractedData, documentType }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-document error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
