import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

const STORAGE_KEY_TOKEN = 'stagepass_token';
const STORAGE_KEY_USER = 'stagepass_user';

interface AuthResponse {
  token: string;
  user: User;
}

function isAuthResponse(data: unknown): data is AuthResponse {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d.token === 'string' && typeof d.user === 'object' && d.user !== null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data: unknown = await res.json();
    if (!isAuthResponse(data)) throw new Error('Unexpected response format from server');
    localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error('Signup failed');
    const data: unknown = await res.json();
    if (!isAuthResponse(data)) throw new Error('Unexpected response format from server');
    localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
