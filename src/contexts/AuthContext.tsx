import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, signIn as storageSignIn, signUp as storageSignUp, SignUpResult, signOut as storageSignOut, initializeStorage } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (username: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      initializeStorage();
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    init();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    const loggedInUser = await storageSignIn(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const signUp = async (username: string, email: string, password: string): Promise<boolean> => {
    const result: SignUpResult = await storageSignUp(username, email, password);
    if (result.success && result.user) {
      setUser(result.user);
      return true;
    }
    // success with no user means sign-up created but needs verification — do not auto-login
    return result.success;
  };

  const signOut = async () => {
    await storageSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
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
