import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Hub } from "aws-amplify/utils";
import {
  getCurrentUser,
  fetchUserAttributes,
  signOut,
  AuthUser,
  FetchUserAttributesOutput,
} from "aws-amplify/auth";
import { Loader2 } from "lucide-react";

// (As interfaces permanecem as mesmas)
interface UserData { user: AuthUser; attributes: FetchUserAttributesOutput; }
interface AuthContextType { userData: UserData | null; loading: boolean; authenticated: boolean; handleSignOut: () => Promise<void>; }

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setUserData({ user: currentUser, attributes });
      } catch (error) {
        setUserData(null);
      } finally {
        // **A LÓGICA QUE RESOLVEU O LOADING INFINITO ESTÁ AQUI**
        // Este bloco SEMPRE é executado, garantindo que o loading termine.
        setLoading(false);
      }
    };

    const hubListener = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          checkCurrentUser();
          break;
        case "signedOut":
          setUserData(null);
          break;
      }
    });

    checkCurrentUser();

    return () => hubListener();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({ global: true });
    } catch (error) {
      console.error("Erro ao fazer logout: ", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        userData,
        loading,
        authenticated: !!userData,
        handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
