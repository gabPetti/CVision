/**
 * API client for frontend to communicate with backend
 */
const API_BASE_URL = "https://cvision-n5o8.onrender.com";

// Always use the full Render URL directly
const getApiUrl = (path: string) => {
  const fullUrl = `${API_BASE_URL}${path}`;
  console.log("[CV-API] Requesting:", fullUrl);
  return fullUrl;
};

export const cvApi = {
  /**
   * Analisar CV - Complete analysis combining file processing + gap analysis
   * Returns: CV analysis with strengths, gaps, and strategic suggestions
   */
  analisarCv: async (file: File, jobLink?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (jobLink) {
      formData.append("job_link", jobLink);
    }

    const response = await fetch(getApiUrl("/api/v1/analisar-cv"), {
      method: "POST",
      body: formData,
    });

    console.log("Response from analisarCv:", response);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Falha ao analisar CV");
    }

    return response.json();
  },

  gerarCv: async (file: File, analisys?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (analisys) {
      formData.append("cv_analisys", analisys);
    }

    const response = await fetch(getApiUrl("/api/v1/gerar_cv_otimizado"), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Falha ao gerar CV otimizado");
    }

    // Get the PDF as a blob and convert to base64
    const pdfBlob = await response.blob();

    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1]; // Remove data:application/pdf;base64, prefix
        resolve({
          pdf_base64: base64,
          filename: "cv_otimizado.pdf",
        });
      };
      reader.onerror = () => reject(new Error("Falha ao processar PDF"));
      reader.readAsDataURL(pdfBlob);
    });
  },
};
