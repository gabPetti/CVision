/**
 * API client for frontend to communicate with backend
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://cvision-n5o8.onrender.com";

// Use relative path for development (proxied through Vite to Render), full URL for production
const getApiUrl = (path: string) => {
  if (import.meta.env.DEV) {
    return path; // Use proxied path during development (Vite proxy to Render)
  }
  return `${API_BASE_URL}${path}`;
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
      const error = await response.json();
      throw new Error(error.message || "Falha ao analisar CV");
    }

    return response.json();
  },
};
