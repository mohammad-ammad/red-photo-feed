import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, signIn as storageSignIn, signUp as storageSignUp, signOut as storageSignOut, initializeStorage } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
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

  const signIn = async (username: string, password: string): Promise<boolean> => {
    const loggedInUser = await storageSignIn(username, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const signUp = async (username: string, email: string, password: string): Promise<boolean> => {
    const newUser = await storageSignUp(username, email, password);
    if (newUser) {
      setUser(newUser);
      return true;
    }
    return false;
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
