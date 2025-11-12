import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/StepIndicator";
import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "Upload do CV" },
  { number: 2, label: "Vagas compatíveis" },
  { number: 3, label: "Análise e dicas" },
];

interface Tip {
  type: "strength" | "improvement" | "suggestion";
  title: string;
  description: string;
}

const Analysis = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if previous steps were completed
    const cvFile = sessionStorage.getItem("cvFile");
    const jobId = sessionStorage.getItem("selectedJobId");
    
    if (!cvFile || !jobId) {
      navigate("/upload");
      return;
    }

    // Simulate analysis - in real implementation, this would call backend
    const analyzeCV = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis data
      setTips([
        {
          type: "strength",
          title: "Experiência técnica relevante",
          description: "Seu currículo demonstra forte experiência com React e TypeScript, competências-chave para esta vaga.",
        },
        {
          type: "strength",
          title: "Projetos práticos bem documentados",
          description: "A inclusão de links para projetos no GitHub mostra suas habilidades de forma tangível.",
        },
        {
          type: "improvement",
          title: "Adicione métricas de impacto",
          description: "Inclua números concretos sobre o impacto do seu trabalho, como 'Aumentei a performance em 40%' ou 'Reduzi bugs em 60%'.",
        },
        {
          type: "improvement",
          title: "Atualize certificações",
          description: "Considere adicionar certificações recentes em tecnologias cloud (AWS, Azure) mencionadas na descrição da vaga.",
        },
        {
          type: "suggestion",
          title: "Destaque experiência com metodologias ágeis",
          description: "A vaga menciona Scrum/Kanban. Dê mais destaque à sua experiência com essas metodologias.",
        },
        {
          type: "suggestion",
          title: "Inclua soft skills relevantes",
          description: "Adicione exemplos de liderança técnica e mentorias, valorizados para posições senior.",
        },
      ]);
      
      setIsLoading(false);
    };

    analyzeCV();
  }, [navigate]);

  const getIcon = (type: Tip["type"]) => {
    switch (type) {
      case "strength":
        return <CheckCircle2 className="w-6 h-6 text-accent" />;
      case "improvement":
        return <XCircle className="w-6 h-6 text-destructive" />;
      case "suggestion":
        return <AlertCircle className="w-6 h-6 text-primary" />;
    }
  };

  const getBgColor = (type: Tip["type"]) => {
    switch (type) {
      case "strength":
        return "bg-accent/10 border-accent/20";
      case "improvement":
        return "bg-destructive/10 border-destructive/20";
      case "suggestion":
        return "bg-primary/10 border-primary/20";
    }
  };

  const getLabel = (type: Tip["type"]) => {
    switch (type) {
      case "strength":
        return "Ponto Forte";
      case "improvement":
        return "Para Melhorar";
      case "suggestion":
        return "Sugestão";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <StepIndicator currentStep={3} totalSteps={3} steps={steps} />

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Análise do seu currículo</h1>
          <p className="text-muted-foreground text-lg">
            Dicas personalizadas para aumentar suas chances nesta vaga
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Analisando seu currículo...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 mb-8">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className={cn(
                    "bg-card rounded-2xl p-6 border transition-all hover:shadow-card",
                    getBgColor(tip.type)
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(tip.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {getLabel(tip.type)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                      <p className="text-muted-foreground">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-card text-center">
              <h3 className="text-xl font-semibold mb-3">Pronto para aplicar!</h3>
              <p className="text-muted-foreground mb-6">
                Use essas dicas para otimizar seu currículo e aumentar suas chances de sucesso na vaga.
              </p>
              <Button
                size="lg"
                onClick={() => {
                  sessionStorage.clear();
                  navigate("/");
                }}
              >
                <Home className="mr-2 w-5 h-5" />
                Analisar outro currículo
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analysis;
