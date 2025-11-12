/**
 * API client for frontend to communicate with backend
 */
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const cvApi = {
  /**
   * Analyze CV file and get personalized tips
   */
  analyzeCv: async (file: File, jobDescription?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (jobDescription) {
      formData.append("job_description", jobDescription);
    }

    const response = await fetch(`${API_BASE_URL}/analyze-cv`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to analyze CV");
    }

    return response.json();
  },

  /**
   * Match CV against job listings
   */
  matchJobs: async (
    file: File,
    jobs: Array<{ id: string; title: string; description: string }>
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobs", JSON.stringify(jobs));

    const response = await fetch(`${API_BASE_URL}/match-jobs`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to match jobs");
    }

    return response.json();
  },

  /**
   * Health check
   */
  health: async () => {
    const response = await fetch(`${API_BASE_URL.replace("/api", "")}/health`);
    return response.ok;
  },
};
