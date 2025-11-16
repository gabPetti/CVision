import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DownloadPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get PDF from location state first
    const state = location.state as { pdfBase64?: string; fileName?: string } | null;
    const pdfFromState = state?.pdfBase64;

    // If not in state, try to get from localStorage
    const pdfFromStorage = localStorage.getItem("optimizedCvPdf");
    const pdfToUse = pdfFromState || pdfFromStorage;

    if (!pdfToUse) {
      setError("Nenhum PDF disponível. Por favor, realize uma análise primeiro.");
      setLoading(false);
      return;
    }

    try {
      // Convert base64 to blob and create object URL
      const byteCharacters = atob(pdfToUse);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setLoading(false);
    } catch (err) {
      setError("Erro ao processar PDF");
      console.error(err);
      setLoading(false);
    }
  }, [location.state]);

  const handleDownload = () => {
    if (!pdfUrl) {
      toast({
        title: "Erro",
        description: "PDF não está disponível",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileName = localStorage.getItem("optimizedCvFileName") || "curriculo-otimizado.pdf";
      
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download iniciado!",
        description: "Seu CV otimizado está sendo baixado.",
      });
    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: "Erro no download",
        description: "Não foi possível fazer o download do arquivo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-glass border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Seu Currículo Otimizado</h1>
            <p className="text-sm text-muted-foreground mt-1">Visualize e baixe seu CV personalizado</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/analisys")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* PDF Viewer */}
          <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-glass overflow-hidden shadow-glass mb-6">
            <div className="bg-muted/50 p-4 border-b border-border/50">
              <p className="text-sm text-muted-foreground">Visualizador de PDF</p>
            </div>
            
            <div className="aspect-[8.5/11] bg-white relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Carregando PDF...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </div>
              )}

              {pdfUrl && !loading && !error && (
                <iframe
                  src={`${pdfUrl}#toolbar=0`}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              )}
            </div>
          </div>

          {/* Download Section */}
          <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-glass p-6 shadow-glass">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Pronto para enviar seu CV?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Baixe seu currículo otimizado e personalizando para a vaga.
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleDownload}
                disabled={!pdfUrl || loading}
                className="gap-2 whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                Baixar PDF
              </Button>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Ir para Home
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/analisys")}
              className="w-full"
            >
              Fazer Nova Análise
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
