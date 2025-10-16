import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn, signUp } from 'aws-amplify/auth';
import { useAuth } from '@/context/AuthContext';
import { PasswordStrength } from "@/components/ui/PasswordStrength"; // Importando o novo componente

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Estados para os campos dos formulários
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Estados para visibilidade da senha
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPasswords, setShowSignupPasswords] = useState(false);

  // Estado para controlar quando mostrar a validação de senha
  const [isTypingPassword, setIsTypingPassword] = useState(false);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { isSignedIn } = await signIn({ username: loginEmail, password: loginPassword });
      if (isSignedIn) {
        toast({ title: "Login bem-sucedido!", description: "Redirecionando para o chat..." });
      }
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

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="login" className="text-base h-10">Entrar</TabsTrigger>
            <TabsTrigger value="signup" className="text-base h-10">Cadastrar</TabsTrigger>
          </TabsList>

          {/* Aba de Login */}
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
                    <div className="flex justify-between items-center">
                      <Label htmlFor="login-password">Senha</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto font-normal text-sm text-primary hover:underline"
                        onClick={() => navigate('/forgot-password')}
                      >
                        Esqueceu a senha?
                      </Button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        required
                        className="pl-10 pr-12"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Entrando..." : "Entrar"}</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Aba de Cadastro */}
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
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPasswords ? "text" : "password"}
                        placeholder="Crie uma senha forte"
                        required
                        className="pr-12"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        onFocus={() => setIsTypingPassword(true)}
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent" onClick={() => setShowSignupPasswords(!showSignupPasswords)}>
                        {showSignupPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </Button>
                    </div>
                    {isTypingPassword && <PasswordStrength password={signupPassword} />}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showSignupPasswords ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        required
                        className="pr-12"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent" onClick={() => setShowSignupPasswords(!showSignupPasswords)}>
                        {showSignupPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </Button>
                    </div>
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
