import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { Loader2 } from 'lucide-react';

type UserAttributes = {
  email?: string;
};

type AuthContextType = {
  userAttributes: UserAttributes | null;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userAttributes, setUserAttributes] = useState<UserAttributes | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        await getCurrentUser(); // Apenas para confirmar a sessão
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes);
      } catch (error) {
        setUserAttributes(null);
      } finally {
        setIsLoading(false);
      }
    };

    const hubListener = Hub.listen('auth', ({ payload }) => {
      const { event } = payload;
      if (event === 'signedIn' || event === 'autoSignIn') {
        checkUser();
      } else if (event === 'signedOut') {
        setUserAttributes(null);
      }
    });

    checkUser();

    return () => hubListener();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ userAttributes, isAuthenticated: !!userAttributes }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
