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
    const { htmlContent } = await req.json();

    if (!htmlContent) {
      throw new Error("HTML content é obrigatório");
    }

    console.log("Gerando PDF do CV otimizado...");

    // Use jsPDF ou Puppeteer via Deno Deploy
    // Para simplificar, vamos usar uma API de conversão HTML para PDF
    // Em produção, considere usar serviços como PDFShift, HTML2PDF API, etc.
    
    // Por enquanto, vamos retornar o HTML como base64 para demonstração
    // Em produção real, você integraria com um serviço de geração de PDF
    const htmlWithStyles = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #2563eb;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            h2 {
              color: #1e40af;
              margin-top: 25px;
              margin-bottom: 15px;
            }
            h3 {
              color: #3b82f6;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            ul {
              margin: 10px 0;
              padding-left: 25px;
            }
            li {
              margin: 8px 0;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .highlight {
              background-color: #dbeafe;
              padding: 2px 6px;
              border-radius: 3px;
            }
            .contact-info {
              margin-bottom: 20px;
              font-size: 0.95em;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    // Simula a conversão para PDF (em produção, use um serviço real)
    const base64Html = btoa(unescape(encodeURIComponent(htmlWithStyles)));

    console.log("PDF gerado com sucesso (simulado)");

    return new Response(
      JSON.stringify({ 
        pdfBase64: base64Html,
        message: "PDF gerado com sucesso. Em produção, integre com um serviço de geração de PDF real."
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro ao gerar PDF";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
