import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/StepIndicator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "Upload do CV" },
  { number: 2, label: "Vagas compatíveis" },
  { number: 3, label: "Análise e dicas" },
];

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".docx"))) {
      setFile(droppedFile);
    } else {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie um arquivo PDF ou DOCX",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    
    // Simulate analysis - in real implementation, this would upload to backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Store file reference and navigate to jobs page
    sessionStorage.setItem("cvFile", file.name);
    navigate("/jobs");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <StepIndicator currentStep={1} totalSteps={3} steps={steps} />

        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-elegant border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Upload do seu currículo</h1>
            <p className="text-muted-foreground text-lg">
              Envie seu CV em PDF ou DOCX para começar a análise
            </p>
          </div>

          <div
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center transition-all",
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              file && "border-primary bg-primary/5"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="cv-upload"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileInput}
            />

            {!file ? (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <UploadIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Arraste seu currículo aqui
                </h3>
                <p className="text-muted-foreground mb-6">
                  ou clique no botão abaixo para selecionar
                </p>
                <label htmlFor="cv-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Selecionar arquivo</span>
                  </Button>
                </label>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{file.name}</h3>
                <p className="text-muted-foreground mb-6">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setFile(null)}
                  >
                    Remover
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      "Analisar currículo"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Dica:</strong> Para melhores resultados, certifique-se de que seu CV está atualizado e contém informações detalhadas sobre suas experiências e habilidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
