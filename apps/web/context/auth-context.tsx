'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SEED_USERS, type UserAccount, type UserRole } from '@/types/auth';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';

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

  // Inicializa o estado lendo sincronamente do localStorage no client para evitar flash e perda de sessão
  const [user, setUser] = useState<UserAccount | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_AUTH);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.role !== 'SOLICITANTE') {
          delete parsed.predio;
        }
        return parsed;
      }
    } catch {
      // Ignora erro de parse inicial
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(STORAGE_KEY_TOKEN);
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validação no mount para garantir sincronia com o storage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_AUTH);
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.role !== 'SOLICITANTE') {
          delete parsed.predio;
        }
        setUser(parsed);
      }
      if (savedToken) {
        setToken(savedToken);
      }
    } catch (e) {
      logger.error('Erro ao ler autenticação do localStorage', e);
    } finally {
      setIsLoading(false);
    }
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

  // Sincroniza sessão no localStorage APENAS quando não estiver em carregamento inicial
  useEffect(() => {
    if (isLoading) return; // NUNCA remove a sessão durante o ciclo de inicialização inicial!
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
      if (token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    } catch (e) {
      logger.error('Erro ao salvar autenticação', e);
    }
  }, [user, token, isLoading]);

  async function login(email: string, password?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const data = await apiClient.login(email, password);
      if (data.success && data.user) {
        const userObj = data.user;
        if (userObj.role !== 'SOLICITANTE') {
          delete userObj.predio;
        }
        setUser(userObj);
        const jwtToken = data.token || `zelo_token_${userObj.id}`;
        setToken(jwtToken);
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userObj));
        localStorage.setItem(STORAGE_KEY_TOKEN, jwtToken);
        return { success: true };
      }
      let errorMsg = 'Credenciais inválidas. Verifique seu e-mail e senha de acesso.';
      if (data.message && !data.message.toLowerCase().includes('password') && !data.message.toLowerCase().includes('123')) {
        errorMsg = data.message;
      }
      return { success: false, message: errorMsg };
    } catch {
      // Fallback local se a API offline
      const found = SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        const userObj = { ...found };
        if (userObj.role !== 'SOLICITANTE') {
          delete userObj.predio;
        }
        setUser(userObj);
        const jwtToken = `zelo_token_${userObj.id}`;
        setToken(jwtToken);
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userObj));
        localStorage.setItem(STORAGE_KEY_TOKEN, jwtToken);
        return { success: true };
      }
      return { success: false, message: 'Erro de conexão com o servidor' };
    }
  }

  async function loginQuick(quickRole: 'GESTOR' | 'TECNICO' | 'SOLICITANTE_ESCOLA' | 'SOLICITANTE_UBS' | 'ADMIN') {
    try {
      const data = await apiClient.loginQuick(quickRole as any);
      if (data.success && data.user) {
        const userObj = data.user;
        if (userObj.role !== 'SOLICITANTE') {
          delete userObj.predio;
        }
        setUser(userObj);
        const jwtToken = data.token || `zelo_token_${userObj.id}`;
        setToken(jwtToken);
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userObj));
        localStorage.setItem(STORAGE_KEY_TOKEN, jwtToken);
        router.push('/');
        return;
      }
    } catch {
      // Fallback
    }

    // Fallback instantâneo
    let target = SEED_USERS[0]!;
    if (quickRole === 'ADMIN') target = SEED_USERS[SEED_USERS.length - 1]!;
    else if (quickRole === 'TECNICO') target = SEED_USERS[1]!;
    else if (quickRole === 'SOLICITANTE_ESCOLA') target = SEED_USERS[3]!;
    else if (quickRole === 'SOLICITANTE_UBS') target = SEED_USERS[4]!;

    const userObj = { ...target };
    if (userObj.role !== 'SOLICITANTE') {
      delete userObj.predio;
    }
    setUser(userObj);
    const jwtToken = `zelo_token_${userObj.id}`;
    setToken(jwtToken);
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userObj));
    localStorage.setItem(STORAGE_KEY_TOKEN, jwtToken);
    router.push('/');
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

  // Se for rota protegida e ainda estiver carregando ou não houver usuário autenticado,
  // bloqueia a renderização de qualquer conteúdo confidencial do painel!
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
            <div className="w-12 h-12 bg-[#1e293b] rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <div className="w-6 h-6 bg-white rounded-xs transform rotate-45" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-black text-slate-800 tracking-tight">zelo.</p>
              <p className="text-xs text-slate-400 font-medium">Validando autenticação e permissões...</p>
            </div>
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
