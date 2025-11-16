import { CheckCircle2, AlertCircle, Lightbulb, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AnalysisData {
  strengths: string[];
  improvements: string[];
  strategy: string;
}

interface AnalysisResultsProps {
  analysis: AnalysisData;
  pdfBase64?: string | null;
}

export const AnalysisResults = ({ analysis, pdfBase64 }: AnalysisResultsProps) => {
  const navigate = useNavigate();

  const handleGoToDownload = () => {
    navigate("/download", {
      state: {
        pdfBase64: pdfBase64 || "",
        fileName: "curriculo-otimizado.pdf",
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      {/* Pontos Fortes */}
      <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-glass p-6 shadow-glass">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/20">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Pontos Fortes</h3>
        </div>
        <ul className="space-y-3">
          {analysis.strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-3 text-foreground/90">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pontos de Melhoria */}
      <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-glass p-6 shadow-glass">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-accent/20">
            <AlertCircle className="h-5 w-5 text-accent" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Pontos de Melhoria</h3>
        </div>
        <ul className="space-y-3">
          {analysis.improvements.map((improvement, index) => (
            <li key={index} className="flex items-start gap-3 text-foreground/90">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
              <span>{improvement}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sugestão Estratégica */}
      <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-glass p-6 shadow-glass">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-secondary/20">
            <Lightbulb className="h-5 w-5 text-secondary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Sugestão Estratégica</h3>
        </div>
        <p className="text-foreground/90 leading-relaxed">{analysis.strategy}</p>
      </div>

      {/* Download Button */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-glass p-6 shadow-glass">
        {pdfBase64 === null ? (
          // Loading State
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  Currículo sendo gerado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Aguarde um momento enquanto otimizamos seu CV...
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Completed State
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">
                Análise Concluída!
              </h3>
              <p className="text-sm text-muted-foreground">
                {pdfBase64 
                  ? "Visualize e baixe seu currículo otimizado personalizado."
                  : "Seu currículo foi analisado com sucesso."
                }
              </p>
            </div>
            {pdfBase64 && (
              <Button
                size="lg"
                onClick={handleGoToDownload}
                className="gap-2 whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                Ir para Download
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
