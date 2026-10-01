'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { type UserAccount, type UserRole } from '@/types/auth';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { Logo } from '@/components/logo';

interface AuthContextType {
  user: UserAccount | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  loginQuick: (role: 'GESTOR' | 'TECNICO' | 'SOLICITANTE_ESCOLA' | 'SOLICITANTE_UBS' | 'ADMIN') => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_AUTH = 'zelo_auth_user_v1';
const STORAGE_KEY_TOKEN = 'zelo_auth_token_v1';

// Rotas públicas que não exigem login
const PUBLIC_PATHS = ['/login', '/landing', '/abrir-chamado'];

// Rotas proibidas para cada perfil (RBAC)
const FORBIDDEN_ROUTES_BY_ROLE: Record<UserRole, string[]> = {
  SOLICITANTE: ['/kanban', '/unidades', '/agenda', '/relatorios', '/configuracoes'],
  TECNICO: ['/unidades', '/relatorios', '/configuracoes'],
  GESTOR: [],
  ADMIN: [],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validação no mount: verifica token ativo diretamente contra o servidor via /api/auth/me
  useEffect(() => {
    let isMounted = true;

    async function validateCurrentSession() {
      try {
        const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
        if (!savedToken) {
          if (isMounted) {
            setUser(null);
            setToken(null);
            setIsLoading(false);
          }
          return;
        }

        const meResult = await apiClient.getMe(savedToken);
        if (isMounted) {
          if (meResult.success && meResult.user) {
            const verifiedUser = meResult.user;
            if (verifiedUser.role !== 'SOLICITANTE') {
              delete verifiedUser.predio;
            }
            setUser(verifiedUser);
            setToken(savedToken);
            localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(verifiedUser));
          } else {
            // Token inválido, expirado ou usuário revogado
            setUser(null);
            setToken(null);
            localStorage.removeItem(STORAGE_KEY_AUTH);
            localStorage.removeItem(STORAGE_KEY_TOKEN);
          }
        }
      } catch (e) {
        logger.error('Erro ao validar sessão com o servidor', e);
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    validateCurrentSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Verifica se a rota atual é pública
  const isPublicRoute = useMemo(() => {
    if (!pathname) return false;
    return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  }, [pathname]);

  // Verifica se o usuário tem permissão para a rota atual (RBAC)
  const isRouteForbiddenForRole = useMemo(() => {
    if (!user || !pathname) return false;
    const forbidden = FORBIDDEN_ROUTES_BY_ROLE[user.role] || [];
    return forbidden.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  }, [user, pathname]);

  // Efeito de proteção e redirecionamento de rotas
  useEffect(() => {
    if (isLoading) return;

    // 1. Usuário não autenticado tentando acessar qualquer rota protegida -> Redireciona para /login
    if (!user && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    // 2. Usuário já autenticado tentando acessar /login -> Redireciona para o painel /
    if (user && pathname === '/login') {
      router.replace('/');
      return;
    }

    // 3. Usuário autenticado tentando acessar rota além do seu nível de permissão (RBAC) -> Redireciona para /
    if (user && isRouteForbiddenForRole) {
      router.replace('/');
      return;
    }
  }, [user, isLoading, pathname, isPublicRoute, isRouteForbiddenForRole, router]);

  async function login(email: string, password?: string): Promise<{ success: boolean; message?: string }> {
    const cleanEmail = email.trim().toLowerCase().replace(/@urboa\.gov\.br$/i, '@zelo.gov.br');
    try {
      const data = await apiClient.login(cleanEmail, password);
      if (data.success && data.user && data.token) {
        const userObj = data.user;
        if (userObj.role !== 'SOLICITANTE') {
          delete userObj.predio;
        }
        setUser(userObj);
        setToken(data.token);
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userObj));
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
        return { success: true };
      }
      return { 
        success: false, 
        message: data.message || 'Credenciais inválidas. Verifique seu e-mail e senha de acesso.' 
      };
    } catch {
      return { 
        success: false, 
        message: 'Não foi possível conectar ao servidor de autenticação.' 
      };
    }
  }

  async function loginQuick(quickRole: 'GESTOR' | 'TECNICO' | 'SOLICITANTE_ESCOLA' | 'SOLICITANTE_UBS' | 'ADMIN') {
    try {
      const data = await apiClient.loginQuick(quickRole);
      if (data.success && data.user && data.token) {
        const userObj = data.user;
        if (userObj.role !== 'SOLICITANTE') {
          delete userObj.predio;
        }
        setUser(userObj);
        setToken(data.token);
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userObj));
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
        router.push('/');
      }
    } catch (e) {
      logger.error('Erro no login rápido demo', e);
    }
  }

  function logout() {
    apiClient.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    router.replace('/login');
  }

  function hasRole(roles: UserRole[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
  }

  const role = useMemo<UserRole>(() => {
    return user?.role || 'GESTOR';
  }, [user]);

  // Bloqueia a renderização de dados sensíveis enquanto a sessão estiver sendo validada no servidor
  const shouldBlockRender = (!isPublicRoute && (isLoading || !user)) || (user && pathname === '/login') || (user && isRouteForbiddenForRole);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginQuick,
        logout,
        hasRole,
      }}
    >
      {shouldBlockRender ? (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
            <Logo size="lg" textStyle="tecnologia" subtitle="Validando autenticação e credenciais..." />
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
