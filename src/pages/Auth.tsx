import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Mail, Lock } from "lucide-react";
import { signIn, signUp, signInWithRedirect } from "aws-amplify/auth";
import { useAuth } from "@/context/AuthContext";

// Ícone do Google para o botão
const GoogleIcon = () => (
  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
);

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Estados dos formulários
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Consome o estado do contexto como única fonte da verdade
  const { authenticated } = useAuth();

  // Efeito que reage à mudança de autenticação e redireciona se necessário
  useEffect(() => {
    if (authenticated) {
      navigate('/chat', { replace: true });
    }
  }, [authenticated, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: "Google" });
    } catch (error: any) {
      toast({
        title: "Erro ao entrar com Google",
        description: error.message || "Não foi possível iniciar o login.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn({ username: loginEmail, password: loginPassword });
      // O Hub notificará o AuthContext, que acionará o useEffect para redirecionar
    } catch (error: any) {
      toast({
        title: "Erro no Login",
        description: error.message || "Verifique seu e-mail e senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      toast({ title: "Erro no Cadastro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { nextStep } = await signUp({
        username: signupEmail,
        password: signupPassword,
        options: { userAttributes: { email: signupEmail } },
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        toast({ title: "Cadastro quase completo!", description: "Enviamos um código para o seu e-mail." });
        navigate('/confirm-signup', { state: { username: signupEmail } });
      }
    } catch (error: any) {
      toast({
        title: "Erro no Cadastro",
        description: error.message || "Não foi possível criar a conta.",
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
          <p className="text-lg text-muted-foreground">Análise inteligente de apostas esportivas com IA</p>
        </div>

        <div className="space-y-4">
          <Button variant="outline" className="w-full h-12 text-base" onClick={handleGoogleSignIn}>
            <GoogleIcon />
            Entrar com Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="login" className="text-base h-10">Entrar</TabsTrigger>
            <TabsTrigger value="signup" className="text-base h-10">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Bem-vindo de volta!</CardTitle>
                  <CardDescription>Entre com suas credenciais para continuar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input id="login-email" type="email" placeholder="seu@email.com" required className="pl-10" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input id="login-password" type="password" placeholder="Sua senha" required className="pl-10" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Entrando..." : "Entrar"}</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95">
              <form onSubmit={handleSignup}>
                <CardHeader>
                  <CardTitle>Crie sua conta</CardTitle>
                  <CardDescription>Comece sua jornada para apostas mais inteligentes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input id="signup-email" type="email" placeholder="seu@email.com" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input id="signup-password" type="password" placeholder="Crie uma senha forte" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirmar Senha</Label>
                    <Input id="signup-confirm-password" type="password" placeholder="Confirme sua senha" required value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Criando conta..." : "Cadastrar"}</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
