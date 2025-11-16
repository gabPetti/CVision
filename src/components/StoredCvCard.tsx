import { Button } from "@/components/ui/button";
import { Download, Sparkles, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const StoredCvCard = () => {
  const navigate = useNavigate();
  const [hasStoredPdf, setHasStoredPdf] = useState(false);

  useEffect(() => {
    // Check if there's a stored PDF in localStorage
    const storedPdf = localStorage.getItem("optimizedCvPdf");
    setHasStoredPdf(!!storedPdf);
  }, []);

  if (!hasStoredPdf) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-glass p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Content */}
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-2xl bg-primary/20 flex-shrink-0 mt-1">
                  <FileCheck className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    Você tem um Currículo Gerado!
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                    Já temos um currículo otimizado armazenado e pronto para usar. Visualize, baixe ou gere uma nova versão otimizada para outra vaga.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 flex-1 sm:flex-none"
                  onClick={() => navigate("/download")}
                >
                  <Download className="w-5 h-5" />
                  Ver Currículo
                </Button>
                <Button
                  size="lg"
                  className="gap-2 flex-1 sm:flex-none"
                  onClick={() => navigate("/analisys")}
                >
                  <Sparkles className="w-5 h-5" />
                  Nova Análise
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
