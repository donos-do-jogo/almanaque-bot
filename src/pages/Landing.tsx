import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BarChart3, History, Lightbulb, Target, ArrowRight, Trophy, MessageSquare } from "lucide-react";
import Navbar from '@/components/Navbar'
import mascoteImage from "@/assets/mascote.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "Análise Profunda",
      description: "Análises detalhadas de jogos, estatísticas e tendências para decisões mais inteligentes"
    },
    {
      icon: History,
      title: "Histórico Completo",
      description: "Acesse o histórico completo de confrontos, desempenho de times e padrões de resultados"
    },
    {
      icon: Lightbulb,
      title: "Dicas Personalizadas",
      description: "Receba dicas customizadas baseadas em análises avançadas e seu perfil de apostas"
    },
    {
      icon: Target,
      title: "Estratégias Inteligentes",
      description: "Desenvolva estratégias vencedoras com insights baseados em dados reais"
    }
  ];

  return (
    // Adicione um padding-top para evitar que o conteúdo fique escondido atrás do Navbar
    <div className="pt-16">
      <Navbar /> {/* 2. Adicione o Navbar aqui */}
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
                  Almanaque <span className="text-transparent bg-clip-text bg-gradient-primary">Bot</span>
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed">
                  Transforme suas apostas esportivas com análises inteligentes,
                  estatísticas em tempo real e estratégias personalizadas.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="group text-lg h-14 px-8 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    onClick={() => navigate('/chat')}
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
                  src={mascoteImage}
                  alt="Almanaque Bot Mascote"
                  className="relative w-full rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500"
                />
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
                Ferramentas profissionais para elevar suas apostas ao próximo nível
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Sports Focus Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Card className="p-8 md:p-12 bg-gradient-hero border-0 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-background/95" />
              <div className="relative space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                  ⚽ Especialistas em Futebol
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                  Foco em Futebol, Aberto ao Mundo
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                  Nossa especialidade é o futebol, com análises aprofundadas dos principais
                  campeonatos mundiais. Mas também oferecemos suporte para outros esportes,
                  garantindo que você tenha as melhores informações, independente da sua preferência.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-lg">
                  <span className="px-6 py-3 bg-card rounded-full border-2 border-primary/30 hover:border-primary hover:shadow-glow transition-all">
                    ⚽ Futebol
                  </span>
                  <span className="px-6 py-3 bg-card rounded-full border hover:border-primary/50 transition-all">
                    🏀 Basquete
                  </span>
                  <span className="px-6 py-3 bg-card rounded-full border hover:border-primary/50 transition-all">
                    🎾 Tênis
                  </span>
                  <span className="px-6 py-3 bg-card rounded-full border hover:border-primary/50 transition-all">
                    🏐 Vôlei
                  </span>
                  <span className="px-6 py-3 bg-card rounded-full border hover:border-primary/50 transition-all">
                    🏈 Futebol Americano
                  </span>
                </div>
              </div>
            </Card>
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
                onClick={() => navigate('/chat')}
              >
                Iniciar Conversa com o Bot
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;
