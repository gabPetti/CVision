/**
 * API client for frontend to communicate with backend
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const cvApi = {
  /**
   * Analizar CV - Complete analysis combining summarize + 3-chain analysis
   * Returns: CV summary + skills analysis + gaps analysis + optimized HTML
   */
  analizarCv: async (file: File, jobDescription?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (jobDescription) {
      formData.append("job_description", jobDescription);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/analizar-cv`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to analyze CV");
    }

    return response.json();
  },
};
