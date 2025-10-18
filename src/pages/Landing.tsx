import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Trophy,
} from "lucide-react";
import Navbar from "@/components/Navbar";

// Importe as imagens do seu projeto
import heroImage from "@/assets/hero-win.jpg";
import nervousMascotImage from "@/assets/mascote-nervoso.jpg";
import featureAnalysisImage from "@/assets/feature-analysis.jpg";
import featureHistoryImage from "@/assets/feature-history.jpg";
import featureTipsImage from "@/assets/feature-tips.jpg";
import featureStrategyImage from "@/assets/feature-strategy.jpg";
import multiSportImage from "@/assets/multi-sport.jpg";
import testimonialImage from "@/assets/testimonial-tv.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      image: featureAnalysisImage,
      title: "Análise Profunda",
      description:
        "Análises detalhadas de jogos, estatísticas e tendências para decisões mais inteligentes.",
    },
    {
      image: featureHistoryImage,
      title: "Histórico Completo",
      description:
        "Acesse o histórico completo de confrontos, desempenho de times e padrões de resultados.",
    },
    {
      image: featureTipsImage,
      title: "Dicas Personalizadas",
      description:
        "Receba dicas customizadas baseadas em análises avançadas e seu perfil de apostas.",
    },
    {
      image: featureStrategyImage,
      title: "Estratégias Inteligentes",
      description:
        "Desenvolva estratégias vencedoras com insights baseados em dados reais.",
    },
  ];

  return (
    // 1. Elemento raiz que envolve TODA a página
    <div className="pt-16">
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-10 pointer-events-none" />
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text and Button */}
              <div className="space-y-6 animate-fade-in relative z-10">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Trophy className="w-4 h-4" />
                  Seu Assistente de Apostas Esportivas
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
                  Almanaque{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-primary">
                    Bot
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed">
                  Transforme suas apostas esportivas com análises inteligentes,
                  estatísticas em tempo real e estratégias personalizadas.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="group text-lg h-14 px-8 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    onClick={() => navigate("/chat")}
                  >
                    Começar Agora
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {/* Right Side - Mascot Image */}
              <div className="relative animate-slide-up">
                <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20 animate-pulse-glow" />
                <img
                  src={heroImage}
                  alt="Almanaque Bot Mascote Comemorando"
                  className="relative w-full rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Seção "Pain Point" (A Dor) */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-primary rounded-3xl blur-3xl opacity-10" />
                <img
                  src={nervousMascotImage}
                  alt="Mascote nervoso com apostas"
                  className="relative w-full max-w-md mx-auto rounded-3xl shadow-2xl"
                />
              </div>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-medium">
                  Chega de Achismos
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                  Cansado de apostas incertas?
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Deixar a emoção tomar conta é a receita para perder. O
                  Almanaque Bot troca a intuição por dados, analisando
                  milhares de pontos de informação para você tomar a melhor
                  decisão.
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg"
                  onClick={() => navigate("/chat")}
                >
                  Usar Dados a Meu Favor
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Por que escolher o Almanaque Bot?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ferramentas profissionais para elevar suas apostas ao próximo
                nível
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-48 object-cover object-center"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Sports Focus Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center bg-card border rounded-2xl p-8 md:p-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                  ⚽ Especialistas em Futebol
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                  Foco em Futebol, Aberto ao Mundo
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Nossa especialidade é o futebol, com análises aprofundadas
                  dos principais campeonatos mundiais. Mas também oferecemos
                  suporte para outros esportes, garantindo que você tenha as
                  melhores informações.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-5 py-2 bg-background rounded-full border-2 border-primary/30 font-medium">
                    ⚽ Futebol
                  </span>
                  <span className="px-5 py-2 bg-background rounded-full border font-medium text-muted-foreground">
                    🏀 Basquete
                  </span>
                  <span className="px-5 py-2 bg-background rounded-full border font-medium text-muted-foreground">
                    🎾 Tênis
                  </span>
                  <span className="px-5 py-2 bg-background rounded-full border font-medium text-muted-foreground">
                    🏈 NFL
                  </span>
                </div>
              </div>

              <div className="relative">
                <img
                  src={multiSportImage}
                  alt="Mascote praticando vários esportes"
                  className="w-full rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Seção "Como Funciona" */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Comece em 3 Passos Simples
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold">1. Inicie a Conversa</h3>
                <p className="text-muted-foreground max-w-xs">
                  Abra o chat e faça sua pergunta. Pode ser sobre um jogo,
                  time ou estatística.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground">
                  <BarChart3 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold">2. Receba a Análise</h3>
                <p className="text-muted-foreground max-w-xs">
                  Nosso bot processa dados em tempo real e entrega uma análise
                  completa e imparcial.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold">
                  3. Aposte com Confiança
                </h3>
                <p className="text-muted-foreground max-w-xs">
                  Use os insights para tomar decisões informadas e aumentar
                  suas chances de sucesso.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Testemunho */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center bg-card border rounded-2xl p-8 md:p-12 overflow-hidden">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">
                  "Finalmente comecei a ter lucro de forma consistente!"
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  "Eu costumava apostar baseado no que eu 'achava' que ia
                  acontecer. Depois que comecei a usar o Almanaque Bot, minhas
                  decisões são 100% baseadas em dados e meus resultados
                  melhoraram da água para o vinho. É como ter um analista
                  profissional no bolso."
                </p>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    Marcelo G.
                  </p>
                  <p className="text-muted-foreground">Usuário Verificado</p>
                </div>
              </div>
              <div className="relative">
                <img
                  src={testimonialImage}
                  alt="Cliente comemorando gol na TV"
                  className="w-full rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Pronto para começar a vencer?
              </h2>
              <p className="text-xl text-muted-foreground">
                Junte-se aos apostadores inteligentes que usam o Almanaque Bot
                para tomar decisões mais informadas e estratégicas.
              </p>
              <Button
                size="lg"
                className="group text-xl h-16 px-12 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                onClick={() => navigate("/chat")}
              >
                Iniciar Conversa com o Bot
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* 2. O rodapé agora está DENTRO do elemento raiz, mas FORA do 'main content' */}
      <footer className="bg-muted text-muted-foreground border-t">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-semibold text-foreground">Donos do Jogo</p>
            <p className="text-sm">
              Um projeto do grupo de alunos da Escola da Nuvem.
            </p>
            <p className="text-sm mt-2">
              © 2025 Donos do Jogo. Todos os direitos reservados.
            </p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/chat")}
            >
              Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.scrollTo(0, 0)}
            >
              Voltar ao Topo
            </Button>
          </div>
        </div>
      </footer>
    </div> // 3. Fechamento correto do elemento raiz
  );
};

export default Landing;
