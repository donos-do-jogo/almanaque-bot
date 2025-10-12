import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserCircle, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // Consuma os novos dados do contexto
  const { userData, authenticated, handleSignOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-gradient-to-br from-background via-background to-primary/5 px-4 backdrop-blur-sm md:px-6">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold">
        <Trophy className="h-6 w-6 text-primary" />
        <span>
          Almanaque<span className="text-primary">Bot</span>
        </span>
      </Link>

      {authenticated ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCircle className="h-5 w-5" />
            {/* Ajuste para pegar o email da nova estrutura */}
            <span>Olá, {userData?.attributes.email}</span>
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
