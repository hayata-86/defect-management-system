import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  fetchUserAttributes,
  getCurrentUser,
  signOut,
} from "aws-amplify/auth";

type AuthUser = {
  username: string;
  name?: string;
  email?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const checkAuth = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      setUser({
        username: currentUser.username,
        name: attributes.name,
        email: attributes.email,
      });

      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut();
    } catch (error) {
      console.error(
        "ログアウト処理に失敗しました。",
        error,
      );

      throw error;
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        checkAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthはAuthProviderの中で使用してください。",
    );
  }

  return context;
}