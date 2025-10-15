/*import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
// Correct v6 modular imports
import { hub } from 'aws-amplify/utils';
import { getCurrentUser, fetchUserAttributes, FetchUserAttributesOutput } from 'aws-amplify/auth';
import { HubPayload } from '@aws-amplify/core/internals/utils';
import { Loader2 } from 'lucide-react';

// Define a type for our user attributes for better type safety
type User = FetchUserAttributesOutput;

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Exposed in case other components need it
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // This state is only for the very initial app load
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This function is the single source of truth for the user's state
    const checkUser = async () => {
      try {
        // These are the correct v6 modular functions.
        // getCurrentUser() throws an error if the user is not signed in.
        await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setUser(attributes);
      } catch (error) {
        // If any error occurs (e.g., no user in session), reset the user state
        setUser(null);
      }
    };

    // The hub listener setup is the standard v6 pattern
    const listener = (data: HubPayload) => {
      const { event } = data.payload;

      switch (event) {
        case 'signedIn':
        case 'autoSignIn':
          // When a user signs in, re-check their session and attributes
          checkUser();
          break;
        case 'signedOut':
          // When a user signs out, clear the user state
          setUser(null);
          break;
      }
    };

    // Subscribe to authentication events
    const unsubscribe = hub.listen('auth', listener);

    // Check the user's status when the app first loads
    const initializeAuth = async () => {
      await checkUser();
      setIsLoading(false);
    };
    initializeAuth();

    // Cleanup function to remove the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Display a loading indicator on initial app load
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};*/

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
