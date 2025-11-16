import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvBase64, jobUrl } = await req.json();

    if (!cvBase64 || !jobUrl) {
      throw new Error("CV e URL da vaga são obrigatórios");
    }

    console.log("Iniciando análise de CV...");

    // Extract PDF content from base64
    const pdfBytes = Uint8Array.from(
      atob(cvBase64.split(',')[1]),
      (c) => c.charCodeAt(0)
    );

    // Use DOMParser to extract text from PDF (simplified approach)
    // In production, you'd want to use a proper PDF parsing library
    const cvText = new TextDecoder().decode(pdfBytes).slice(0, 10000);

    console.log("Extraindo conteúdo da vaga...");

    // Fetch job description from URL
    let jobDescription = "";
    try {
      const jobResponse = await fetch(jobUrl);
      const jobHtml = await jobResponse.text();
      // Simple text extraction (in production, use proper HTML parser)
      jobDescription = jobHtml.replace(/<[^>]*>/g, ' ').slice(0, 5000);
    } catch (error) {
      console.error("Erro ao buscar descrição da vaga:", error);
      jobDescription = "Não foi possível extrair a descrição da vaga automaticamente.";
    }

    console.log("Realizando análise com IA...");

    // Call Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um consultor de RH especializado em análise de currículos. Sua tarefa é:
1. Comparar o currículo do candidato com os requisitos da vaga
2. Identificar PONTOS FORTES (máximo 5 itens)
3. Identificar PONTOS DE MELHORIA/GAPS (máximo 5 itens)
4. Fornecer uma SUGESTÃO ESTRATÉGICA para se destacar na candidatura

Retorne APENAS um objeto JSON válido no formato:
{
  "strengths": ["ponto 1", "ponto 2", ...],
  "improvements": ["gap 1", "gap 2", ...],
  "strategy": "sugestão estratégica detalhada"
}

Seja objetivo, profissional e construtivo. Não inclua texto adicional fora do JSON.`
          },
          {
            role: "user",
            content: `CURRÍCULO DO CANDIDATO:\n${cvText}\n\nDESCRIÇÃO DA VAGA:\n${jobDescription}\n\nAnalise a aderência e forneça o JSON solicitado.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Erro na API de IA:", aiResponse.status, errorText);
      throw new Error(`Erro na análise de IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;

    console.log("Resposta da IA:", analysisText);

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       analysisText.match(/(\{[\s\S]*\})/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Erro ao fazer parse da resposta da IA:", parseError);
      // Fallback structure
      analysis = {
        strengths: ["Experiência relevante identificada"],
        improvements: ["Mais detalhes sobre realizações quantificáveis"],
        strategy: analysisText || "Continue desenvolvendo suas habilidades alinhadas à vaga."
      };
    }

    // Gerar CV otimizado em HTML
    console.log("Gerando CV otimizado...");
    
    const cvOptimizationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em redação de currículos. Sua tarefa é otimizar o currículo do candidato com base na análise de aderência.

Diretrizes:
- Use as sugestões estratégicas para destacar pontos fortes
- Reformule descrições para enfatizar realizações relevantes à vaga
- Mantenha a estrutura profissional
- Destaque competências-chave
- Use verbos de ação e quantifique resultados quando possível

Retorne APENAS o HTML otimizado do currículo, sem tags <html>, <head> ou <body>. Comece direto com o conteúdo estruturado com tags semânticas como <h1>, <h2>, <section>, <ul>, etc.`
          },
          {
            role: "user",
            content: `CURRÍCULO ORIGINAL:\n${cvText}\n\nANÁLISE DE ADERÊNCIA:\nPontos Fortes: ${analysis.strengths.join(', ')}\nPontos de Melhoria: ${analysis.improvements.join(', ')}\nSugestão Estratégica: ${analysis.strategy}\n\nDESCRIÇÃO DA VAGA:\n${jobDescription}\n\nOtimize o currículo em HTML.`
          }
        ],
      }),
    });

    let optimizedCvHtml = "";
    if (cvOptimizationResponse.ok) {
      const cvData = await cvOptimizationResponse.json();
      optimizedCvHtml = cvData.choices[0].message.content;
      // Remove markdown code blocks if present
      optimizedCvHtml = optimizedCvHtml.replace(/```html\s*|\s*```/g, '');
      console.log("CV otimizado gerado com sucesso");
    } else {
      console.error("Erro ao gerar CV otimizado");
    }

    const result = {
      ...analysis,
      optimizedCvHtml: optimizedCvHtml
    };

    console.log("Análise concluída com sucesso");

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Erro no processamento:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro ao processar a análise";
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
