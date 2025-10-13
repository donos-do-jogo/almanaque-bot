import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

const ConfirmSignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // O e-mail é passado da página de cadastro
  const [username, setUsername] = useState(location.state?.username || '');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !confirmationCode) {
      toast({ title: "Erro", description: "Por favor, preencha todos os campos.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username,
        confirmationCode,
      });

      if (isSignUpComplete) {
        toast({
          title: "Conta confirmada!",
          description: "Você já pode fazer o login.",
        });
        navigate('/auth'); // Redireciona para a página de login
      }
    } catch (error: any) {
      toast({ title: "Erro na confirmação", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await resendSignUpCode({ username });
      toast({ title: "Sucesso", description: "Um novo código foi enviado para o seu e-mail." });
    } catch (error: any) {
      toast({ title: "Erro", description: "Não foi possível reenviar o código.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleConfirmation}>
          <CardHeader>
            <CardTitle>Verifique seu E-mail</CardTitle>
            <CardDescription>
              Enviamos um código de 6 dígitos para {username || 'seu e-mail'}. Insira-o abaixo para confirmar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={username} onChange={e => setUsername(e.target.value)} required placeholder="seu@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Código de Confirmação</Label>
              <Input id="code" type="text" value={confirmationCode} onChange={e => setConfirmationCode(e.target.value)} required placeholder="123456" />
            </div>
          </CardContent>
          <CardContent className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoading}>{isLoading ? "Confirmando..." : "Confirmar Conta"}</Button>
            <Button variant="link" type="button" onClick={handleResendCode}>
              Não recebeu o código? Reenviar.
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default ConfirmSignUp;
