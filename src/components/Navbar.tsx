import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserCircle, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userAttributes, isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Logout bem-sucedido!',
        description: 'Você foi desconectado. Até a próxima!',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer logout',
        description: error.message || 'Não foi possível desconectar.',
        variant: 'destructive',
      });
    }
  };

  return (
    // GRADIENTE EXATAMENTE IGUAL AO FUNDO DO AUTH.TSX
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-gradient-to-br from-background via-background to-primary/5 px-4 backdrop-blur-sm md:px-6">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold">
        <Trophy className="h-6 w-6 text-primary" />
        <span className="font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Almanaque<span className="text-primary"> Bot</span>
        </span>
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCircle className="h-5 w-5" />
            <span>Olá, {userAttributes?.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Deslogar
          </Button>
        </div>
      ) : (
        <Button size="sm" onClick={() => navigate('/auth')}>
          <LogIn className="mr-2 h-4 w-4" />
          Login / Cadastrar
        </Button>
      )}
    </header>
  );
};

export default Navbar;
