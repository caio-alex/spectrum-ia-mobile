// src/contexts/index.tsx
import React, { createContext, useState, useContext } from 'react';

// --- AUTH CONTEXT ---
interface AuthContextData {
  signed: boolean;
  signIn: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [signed, setSigned] = useState(false); // Estado inicial deslogado

  const signIn = () => setSigned(true);

  return (
    <AuthContext.Provider value={{ signed, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- SESSION CONTEXT ---
// Gerencia o ID da pesquisa ativa para o comparador e resultados da IA
const SessionContext = createContext({});

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionContext.Provider value={{}}>
      {children}
    </SessionContext.Provider>
  );
};

// Hook personalizado para facilitar o uso da autenticação
export const useAuth = () => useContext(AuthContext);