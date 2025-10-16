import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Mail, ArrowLeft } from "lucide-react";
// ALTERAÇÃO AQUI: A função agora é 'resetPassword'
import { resetPassword } from 'aws-amplify/auth';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // ALTERAÇÃO AQUI: Chamando a função correta
      const { nextStep } = await resetPassword({ username: email });
      if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        toast({ title: "Código enviado!", description: "Verifique sua caixa de entrada para o código de redefinição." });
        navigate('/reset-password', { state: { username: email } });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao enviar código",
        description: error.message || "Não foi possível processar a solicitação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md mx-auto relative z-10 space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 text-primary justify-center">
            <Trophy className="w-12 h-12" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Almanaque Bot
            </h1>
          </div>
        </div>

        <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95">
          <form onSubmit={handleForgotPassword}>
            <CardHeader>
              <CardTitle>Recuperar Senha</CardTitle>
              <CardDescription>Insira seu e-mail para receber um código de verificação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="seu@email.com" required className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Enviando..." : "Enviar Código"}</Button>
              <Button type="button" variant="link" className="text-muted-foreground" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
