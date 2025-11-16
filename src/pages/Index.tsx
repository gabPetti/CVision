import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { AnalysisResults } from "@/components/AnalysisResults";
import { CVPreview } from "@/components/CVPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cvApi } from "@/services/cv-api";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!cvFile || !jobUrl) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, faça upload do CV e cole o link da vaga.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    
    try {
      // Chama a API do backend para analisar o CV
      const result = await cvApi.analisarCv(cvFile, jobUrl);

      // Estrutura os dados para compatibilidade com AnalysisResults
      const analysisData = {
        strengths: result.pontos_fortes || [],
        improvements: result.pontos_melhoria || [],
        strategy: result.sugestao_estrategica || "",
      };      setAnalysis(analysisData);
      toast({
        title: "Análise concluída!",
        description: "Seu currículo foi analisado com sucesso.",
      });
    } catch (error) {
      console.error("Erro na análise:", error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao analisar seu currículo.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!analysis) {
      toast({
        title: "Erro",
        description: "Análise não disponível.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Chama a API do backend para gerar o PDF otimizado
      const result = await cvApi.gerarCv(cvFile!);
      
      if (!result.success) {
        throw new Error(result.message || "Erro ao gerar PDF");
      }

      // Extrai o PDF em base64 do resultado
      const pdfBase64 = result.data.pdf_base64 || result.data;
      
      // Cria um blob do PDF e faz download
      const pdfBlob = new Blob(
        [Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0))],
        { type: 'application/pdf' }
      );
      
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'curriculo-otimizado.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download iniciado!",
        description: "Seu CV otimizado está sendo baixado.",
      });
    } catch (error) {
      console.error("Erro no download:", error);
      toast({
        title: "Erro no download",
        description: error instanceof Error ? error.message : "Não foi possível baixar o CV.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background/95" />
      
      {/* Decorative glass orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50 animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in-0 slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-glass border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by AI</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
            CVision
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Seu Consultor de RH Digital
          </p>
          <p className="text-muted-foreground/80 max-w-xl mx-auto mt-3">
            Análise inteligente de aderência e otimização do seu currículo para vagas específicas
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Input Section */}
          <div className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-glass p-8 shadow-glass animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            <div className="space-y-6">
              {/* File Upload */}
              <div className="space-y-3">
                <Label htmlFor="cv-upload" className="text-base font-medium text-foreground">
                  Seu Currículo
                </Label>
                <FileUpload onFileSelect={setCvFile} selectedFile={cvFile || undefined} />
              </div>

              {/* Job URL Input */}
              <div className="space-y-3">
                <Label htmlFor="job-url" className="text-base font-medium text-foreground">
                  Link da Vaga
                </Label>
                <Input
                  id="job-url"
                  type="url"
                  placeholder="Cole aqui o link da descrição da vaga"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="h-12 bg-input/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !cvFile || !jobUrl}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Analisar CV
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {analysis && (
            <>
              <AnalysisResults analysis={analysis} />
              
              {analysis.optimizedCvHtml && (
                <CVPreview 
                  htmlContent={analysis.optimizedCvHtml} 
                  onDownload={handleDownload}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground/60 text-sm">
          <p>Desenvolvido com IA para profissionais que buscam excelência</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
