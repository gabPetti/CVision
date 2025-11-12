import { Button } from "@/components/ui/button";
import { FileText, Target, Sparkles, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const [cvText, setCvText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarizeCV = async () => {
    if (!cvText.trim() || !jobDesc.trim()) {
      setError('Por favor preencha ambos os campos');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const params = new URLSearchParams({
        cv_text: cvText,
        job_description: jobDesc
      });

      const response = await fetch(`${apiUrl}/api/summarize-cv?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao processar CV');
        return;
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com o backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Análise de CV com IA
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Encontre a vaga perfeita e
            <span className="block mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              melhore seu currículo
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Nossa plataforma analisa seu currículo, encontra vagas compatíveis e fornece dicas personalizadas para aumentar suas chances de sucesso.
          </p>

          <Button
            size="lg"
            className="text-lg h-14 px-8 mt-8 shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate("/upload")}
          >
            Começar análise
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-card hover:shadow-elegant transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Upload do CV</h3>
              <p className="text-muted-foreground">
                Envie seu currículo em PDF ou DOCX. Nossa IA analisa suas qualificações e experiências.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-card hover:shadow-elegant transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Vagas compatíveis</h3>
              <p className="text-muted-foreground">
                Receba uma lista de vagas que melhor combinam com seu perfil, com score de compatibilidade.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-card hover:shadow-elegant transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Dicas personalizadas</h3>
              <p className="text-muted-foreground">
                Obtenha sugestões específicas para melhorar seu CV e aumentar suas chances na vaga escolhida.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-card hover:shadow-elegant transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">4. Resumo com IA</h3>
              <p className="text-muted-foreground">
                Veja um resumo inteligente de como seu CV se encaixa na vaga desejada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Summarize CV Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
            <h2 className="text-3xl font-bold text-center mb-2">Teste o Resumo com IA</h2>
            <p className="text-center text-muted-foreground mb-8">
              Cole seu CV e a descrição da vaga para obter um resumo personalizado
            </p>

            <div className="space-y-4">
              {/* CV Text Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Seu CV</label>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Cole aqui seu CV ou resumo profissional..."
                  className="w-full h-32 p-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Job Description Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Descrição da Vaga</label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Cole aqui a descrição da vaga..."
                  className="w-full h-32 p-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Summary Result */}
              {summary && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                  <h3 className="font-semibold text-success mb-2">Resumo da IA:</h3>
                  <p className="text-foreground whitespace-pre-wrap">{summary}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSummarizeCV}
                disabled={loading || !cvText.trim() || !jobDesc.trim()}
                className="w-full text-lg h-12"
                size="lg"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processando...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Gerar Resumo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
