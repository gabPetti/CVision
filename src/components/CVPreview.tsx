import { FileText, Download, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CVPreviewProps {
  htmlContent: string;
  onDownload: () => void;
}

export const CVPreview = ({ htmlContent, onDownload }: CVPreviewProps) => {
  return (
    <div className="rounded-2xl border border-primary/30 bg-card/30 backdrop-blur-glass p-6 shadow-glass animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Currículo Otimizado
            </h3>
            <p className="text-sm text-muted-foreground">
              Seu CV foi otimizado com base na análise
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-border/50 bg-background/30 backdrop-blur-sm hover:bg-background/50"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
              <DialogHeader>
                <DialogTitle>Preview do Currículo Otimizado</DialogTitle>
              </DialogHeader>
              <div 
                className="prose prose-invert max-w-none p-6 bg-card/50 rounded-lg"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </DialogContent>
          </Dialog>
          
          <Button
            onClick={onDownload}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Preview compacto */}
      <div className="relative rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90 pointer-events-none z-10" />
        <div 
          className="prose prose-sm prose-invert max-w-none p-6 max-h-64 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};
