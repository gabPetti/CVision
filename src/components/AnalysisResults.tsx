import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";

interface AnalysisData {
  strengths: string[];
  improvements: string[];
  strategy: string;
}

interface AnalysisResultsProps {
  analysis: AnalysisData;
}

export const AnalysisResults = ({ analysis }: AnalysisResultsProps) => {
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
    </div>
  );
};
