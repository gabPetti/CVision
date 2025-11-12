import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, DollarSign, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/StepIndicator";
import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "Upload do CV" },
  { number: 2, label: "Vagas compatíveis" },
  { number: 3, label: "Análise e dicas" },
];

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  matchScore: number;
  description: string;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if CV was uploaded
    const cvFile = sessionStorage.getItem("cvFile");
    if (!cvFile) {
      navigate("/upload");
      return;
    }

    // Simulate loading jobs - in real implementation, this would call backend
    const loadJobs = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock jobs data
      setJobs([
        {
          id: "1",
          title: "Desenvolvedor Full Stack Senior",
          company: "Tech Solutions Inc",
          location: "São Paulo, SP",
          salary: "R$ 12.000 - R$ 18.000",
          type: "CLT",
          matchScore: 92,
          description: "Procuramos desenvolvedor com experiência em React, Node.js e TypeScript.",
        },
        {
          id: "2",
          title: "Engenheiro de Software",
          company: "StartupXYZ",
          location: "Remoto",
          salary: "R$ 10.000 - R$ 15.000",
          type: "PJ",
          matchScore: 87,
          description: "Oportunidade em startup de tecnologia financeira.",
        },
        {
          id: "3",
          title: "Desenvolvedor Frontend",
          company: "Digital Agency",
          location: "Rio de Janeiro, RJ",
          salary: "R$ 8.000 - R$ 12.000",
          type: "CLT",
          matchScore: 78,
          description: "Especialista em React e desenvolvimento de interfaces modernas.",
        },
      ]);
      
      setIsLoading(false);
    };

    loadJobs();
  }, [navigate]);

  const handleSelectJob = (jobId: string) => {
    sessionStorage.setItem("selectedJobId", jobId);
    navigate("/analysis");
  };

  const getMatchColor = (score: number) => {
    if (score >= 85) return "text-accent";
    if (score >= 70) return "text-primary";
    return "text-muted-foreground";
  };

  const getMatchBg = (score: number) => {
    if (score >= 85) return "bg-accent/10 border-accent";
    if (score >= 70) return "bg-primary/10 border-primary";
    return "bg-muted border-border";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <StepIndicator currentStep={2} totalSteps={3} steps={steps} />

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Vagas compatíveis com seu perfil</h1>
          <p className="text-muted-foreground text-lg">
            Selecionamos as melhores oportunidades baseadas no seu currículo
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Buscando vagas compatíveis...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={cn(
                  "bg-card rounded-2xl p-6 md:p-8 border transition-all hover:shadow-elegant cursor-pointer",
                  selectedJob === job.id ? "border-primary shadow-elegant" : "border-border"
                )}
                onClick={() => setSelectedJob(job.id)}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
                        <p className="text-muted-foreground">{job.company}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "px-4 py-2 rounded-full border-2 flex items-center gap-2",
                    getMatchBg(job.matchScore)
                  )}>
                    <span className={cn("text-2xl font-bold", getMatchColor(job.matchScore))}>
                      {job.matchScore}%
                    </span>
                    <span className="text-sm text-muted-foreground">match</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{job.description}</p>

                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {job.type}
                  </div>
                </div>

                <Button
                  className="w-full md:w-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectJob(job.id);
                  }}
                >
                  Analisar para esta vaga
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
