import { Button } from "@/components/ui/button";
import { FileText, Target, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
