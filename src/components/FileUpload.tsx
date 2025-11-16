import { Upload, FileText, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File;
}

export const FileUpload = ({ onFileSelect, selectedFile }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <label
        className={cn(
          "relative block w-full rounded-2xl border-2 border-dashed border-border/50",
          "bg-card/30 backdrop-blur-glass transition-all duration-300 cursor-pointer overflow-hidden",
          "hover:border-primary/50 hover:bg-card/40 hover:shadow-glow",
          isDragging && "border-primary bg-card/50 shadow-glow"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileInput}
        />
        
        <div className="px-8 py-12 text-center">
          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onFileSelect(null as any);
                }}
                className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
              >
                <X className="h-5 w-5 text-destructive" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-primary mb-4 opacity-80" />
              <p className="text-lg font-medium text-foreground mb-2">
                Arraste seu currículo ou clique para selecionar
              </p>
              <p className="text-sm text-muted-foreground">
                Apenas arquivos PDF (máx. 20MB)
              </p>
            </>
          )}
        </div>
      </label>
    </div>
  );
};
