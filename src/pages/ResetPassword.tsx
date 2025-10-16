import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { confirmResetPassword } from 'aws-amplify/auth';
import { PasswordStrength } from "@/components/ui/PasswordStrength"; // 1. Importar o componente

const ResetPassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // 2. Estado para controlar a visibilidade da validação
  const [isTypingPassword, setIsTypingPassword] = useState(false);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!state?.username) {
      toast({ title: "Erro", description: "E-mail não encontrado. Por favor, tente novamente desde o início.", variant: "destructive" });
      navigate('/forgot-password');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await confirmResetPassword({
        username: state.username,
        confirmationCode: code,
        newPassword: newPassword,
      });
      toast({ title: "Senha Redefinida!", description: "Sua senha foi alterada com sucesso. Por favor, faça o login." });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir a senha",
        description: error.message || "Código inválido ou expirado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* ... layout de fundo ... */}
      <div className="w-full max-w-md mx-auto relative z-10 space-y-8 animate-fade-in">
        {/* ... cabeçalho ... */}
        <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95">
          <form onSubmit={handleResetPassword}>
            <CardHeader>
              <CardTitle>Crie sua Nova Senha</CardTitle>
              <CardDescription>Insira o código enviado para seu e-mail e sua nova senha.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de Verificação</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="code" type="text" placeholder="_ _ _ _ _ _" required className="pl-10 tracking-[0.5em] text-center" value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPasswords ? "text" : "password"}
                    placeholder="Sua nova senha"
                    required
                    className="pl-10 pr-12"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setIsTypingPassword(true)}
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent" onClick={() => setShowPasswords(!showPasswords)}>
                    {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
                {/* 3. Renderizar o componente de validação */}
                {isTypingPassword && <PasswordStrength password={newPassword} />}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirm-new-password"
                    type={showPasswords ? "text" : "password"}
                    placeholder="Confirme a nova senha"
                    required
                    className="pl-10 pr-12"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent" onClick={() => setShowPasswords(!showPasswords)}>
                    {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Redefinindo..." : "Redefinir Senha"}</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
