import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api.ts";

type User = { id: number; email: string } | null;

type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const raw = localStorage.getItem("finpower_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  async function login(email: string, password: string) {
    const u = await api.login(email, password);
    setUser(u);
    localStorage.setItem("finpower_user", JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("finpower_user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
