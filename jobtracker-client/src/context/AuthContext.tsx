import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: UserPayload | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(savedToken);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          return null;
        }
        return savedToken;
      } catch {
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

  const [user, setUser] = useState<UserPayload | null>(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(savedToken);
        if (decoded.exp * 1000 < Date.now()) {
          return null;
        }
        return {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name || decoded.email,
          role: decoded.role,
        };
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      const decoded = jwtDecode<DecodedToken>(newToken);
      setUser({
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name || decoded.email,
        role: decoded.role,
      });
    } catch {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
