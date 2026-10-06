'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sun, 
  Inbox, 
  Calendar, 
  Building2, 
  TrendingUp, 
  Settings, 
  ChevronLeft,
  MoreVertical,
  LogOut,
  Sparkles,
  X,
  Compass,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOrders } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { useOnboarding } from '@/context/onboarding-context';
import { Logo } from '@/components/logo';

export type AppRoute = 
  | '/' 
  | '/chamados' 
  | '/kanban' 
  | '/unidades' 
  | '/agenda' 
  | '/relatorios' 
  | '/configuracoes'
  | '/abrir-chamado'
  | '/landing';

interface SidebarProps {
  currentRoute: AppRoute;
  onOpenAgenda?: () => void;
  onOpenReports?: () => void;
  onOpenSettings?: () => void;
  onOpenCopilot?: () => void;
}

export function Sidebar({ 
  currentRoute, 
  onOpenAgenda, 
  onOpenReports, 
  onOpenSettings,
  onOpenCopilot,
}: SidebarProps) {
  const { stats, units, isSidebarCollapsed, toggleSidebar, openCopilot } = useOrders();
  const { user, role, logout } = useAuth();
  const { resetTour } = useOnboarding();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsLogoutModalOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const isGestor = role === 'GESTOR' || role === 'ADMIN';
  const isTecnico = role === 'TECNICO';

  return (
    <aside 
      className={`${
        isSidebarCollapsed ? 'w-[72px]' : 'w-64'
      } flex flex-col h-full shrink-0 select-none print:hidden transition-[width] duration-300 ease-in-out relative z-40 bg-[#FAFAFA] border-r border-border`}
    >
      {/* Brand Header */}
      <div className={`px-4 py-5 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} min-h-[68px]`}>
        {isSidebarCollapsed ? (
          <button
            type="button"
            onClick={toggleSidebar}
            title="Expandir barra lateral (Ctrl+B)"
            className="p-1 rounded-lg flex items-center justify-center transition-all group cursor-pointer hover:bg-muted"
          >
            <Logo size="sm" showText={false} />
          </button>
        ) : (
          <>
            <Logo href="/" size="md" textStyle="simple" />

            <button
              type="button"
              onClick={toggleSidebar}
              title="Recolher barra lateral (Ctrl+B)"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-3'} py-2 overflow-visible`}>
        {/* Main Section */}
        <div className={`${isSidebarCollapsed ? 'space-y-1' : 'space-y-0.5'} mb-6`}>
          <SidebarNavItem 
            icon={<Sun size={15} />} 
            label="Hoje" 
            href="/" 
            active={currentRoute === '/'} 
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarNavItem 
            icon={<Inbox size={15} />} 
            label="Chamados" 
            href="/chamados" 
            active={currentRoute === '/chamados'} 
            badge={stats.totalOpen > 0 ? String(stats.totalOpen) : undefined}
            isCollapsed={isSidebarCollapsed}
          />
          {(isGestor || isTecnico) && (
            <SidebarNavItem 
              icon={<Calendar size={15} />} 
              label="Agenda" 
              href="/agenda"
              active={currentRoute === '/agenda'}
              onClick={onOpenAgenda}
              isCollapsed={isSidebarCollapsed}
            />
          )}
        </div>

        {/* GESTÃO Section */}
        {isGestor && (
          <div>
            {!isSidebarCollapsed ? (
              <div className="px-3 mb-2">
                <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">
                  Gestão
                </p>
              </div>
            ) : (
              <div className="w-6 h-px bg-border mx-auto mb-2" />
            )}
            <div className={isSidebarCollapsed ? 'space-y-1' : 'space-y-0.5'}>
              <SidebarNavItem 
                icon={<Building2 size={15} />} 
                label="Unidades" 
                href="/unidades" 
                active={currentRoute === '/unidades'} 
                badge={units.length > 0 ? String(units.length) : undefined}
                isCollapsed={isSidebarCollapsed}
              />
              <SidebarNavItem 
                icon={<TrendingUp size={15} />} 
                label="Relatórios" 
                href="/relatorios"
                active={currentRoute === '/relatorios'}
                onClick={onOpenReports}
                isCollapsed={isSidebarCollapsed}
              />
              <SidebarNavItem 
                icon={<Sparkles size={15} />}
                label="Urbi (IA)" 
                active={false}
                onClick={onOpenCopilot || openCopilot}
                isCollapsed={isSidebarCollapsed}
                shortcut="Ctrl+J"
                tooltip="Consultar Urbi (IA)"
                accent
              />
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div
        className={`${isSidebarCollapsed ? 'px-2 py-3' : 'px-3 py-3'} border-t border-border`}
      >
        {/* Configurações */}
        {isGestor && (
          <div className="mb-1">
            <SidebarNavItem 
              icon={<Settings size={15} />} 
              label="Configurações" 
              href="/configuracoes"
              active={currentRoute === '/configuracoes'}
              onClick={onOpenSettings}
              isCollapsed={isSidebarCollapsed}
            />
          </div>
        )}

        {/* User Card */}
        {isSidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2 pt-1 relative" ref={userMenuRef}>
            {isUserMenuOpen && (
              <UserMenuPopover
                position="collapsed"
                user={user}
                role={role}
                isGestor={isGestor}
                isTecnico={isTecnico}
                onSettings={onOpenSettings ? () => { setIsUserMenuOpen(false); onOpenSettings(); } : undefined}
                onStartTour={() => { setIsUserMenuOpen(false); resetTour(); }}
                onLogout={() => { setIsUserMenuOpen(false); setIsLogoutModalOpen(true); }}
              />
            )}
            <div 
              className="group relative cursor-pointer mt-1" 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
              title={`${user?.nome || 'Mariana Alves'} (Opções de conta)`}
            >
              <Avatar className="h-8 w-8 ring-1 ring-border group-hover:ring-foreground/20 transition-all">
                <AvatarImage src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">MA</AvatarFallback>
              </Avatar>
              {!isUserMenuOpen && (
                <div
                  className="pointer-events-none absolute left-full ml-3 bottom-0 px-2.5 py-1.5 rounded-md shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 bg-card border border-border"
                >
                  <p className="text-[11px] font-medium text-foreground">{user?.nome || 'Mariana Alves'}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative mt-1" ref={userMenuRef}>
            {isUserMenuOpen && (
              <UserMenuPopover
                position="expanded"
                user={user}
                role={role}
                isGestor={isGestor}
                isTecnico={isTecnico}
                onSettings={onOpenSettings ? () => { setIsUserMenuOpen(false); onOpenSettings(); } : undefined}
                onStartTour={() => { setIsUserMenuOpen(false); resetTour(); }}
                onLogout={() => { setIsUserMenuOpen(false); setIsLogoutModalOpen(true); }}
              />
            )}

            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-full flex items-center gap-2.5 p-2 rounded-md transition-all cursor-pointer group text-left ${
                isUserMenuOpen ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <Avatar className="h-7 w-7 shrink-0 ring-1 ring-border">
                <AvatarImage src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'} />
                <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">MA</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-[13px] font-medium text-foreground truncate leading-tight">
                  {user?.nome || 'Mariana Alves'}
                </span>
                <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                  {role === 'ADMIN' ? 'Admin' : isGestor ? 'Gestora' : isTecnico ? 'Técnico' : 'Solicitante'}
                </span>
              </div>
              <MoreVertical size={14} className={`shrink-0 transition-colors ${
                isUserMenuOpen ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
              }`} />
            </button>
          </div>
        )}
      </div>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-xl max-w-sm w-full p-6 space-y-4 shadow-lg text-left">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Deseja sair da sua conta?
              </h3>
              <button 
                type="button" 
                onClick={() => setIsLogoutModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors cursor-pointer shrink-0"
                title="Fechar"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Você precisará informar seu e-mail e senha institucional para acessar o painel novamente.
            </p>

            <div className="p-3 rounded-md bg-muted/50 border border-border flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-border shrink-0">
                <AvatarImage src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">MA</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground truncate">
                  {user?.nome || 'Mariana Alves'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email || 'gestor@urboa.gov.br'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2 px-4 rounded-md border border-border hover:bg-muted text-foreground text-[13px] font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  logout();
                }}
                className="flex-1 py-2 px-4 rounded-md bg-foreground hover:bg-foreground/90 text-background text-[13px] font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// ─── User Menu Popover ──────────────────────────────────────────────────────

function UserMenuPopover({
  position,
  user,
  role,
  isGestor,
  isTecnico: _isTecnico,
  onSettings,
  onStartTour,
  onLogout,
}: {
  position: 'expanded' | 'collapsed';
  user: { nome?: string; cargo?: string; email?: string; avatar?: string } | null | undefined;
  role: string | null | undefined;
  isGestor: boolean;
  isTecnico: boolean;
  onSettings?: () => void;
  onStartTour?: () => void;
  onLogout: () => void;
}) {
  const positionClass = position === 'collapsed'
    ? 'absolute bottom-0 left-full ml-3 w-56'
    : 'absolute bottom-full left-0 right-0 mb-2';

  return (
    <div
      className={`${positionClass} p-1.5 rounded-lg shadow-md border border-border bg-card z-50 animate-in fade-in zoom-in-95 duration-150`}
    >
      <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
        <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border">
          <AvatarImage src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">MA</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-foreground truncate">
            {user?.nome || 'Mariana Alves'}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {user?.email || 'gestor@urboa.gov.br'}
          </p>
        </div>
      </div>

      <div className="h-px bg-border mx-1 mb-1" />

      {onStartTour && (
        <button
          type="button"
          onClick={onStartTour}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all cursor-pointer text-left"
        >
          <Compass size={14} className="text-[#2563EB]" />
          <span>Guia & Tour da Plataforma</span>
        </button>
      )}

      {isGestor && onSettings && (
        <button
          type="button"
          onClick={onSettings}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all cursor-pointer text-left"
        >
          <Settings size={14} className="text-muted-foreground" />
          <span>Configurações</span>
        </button>
      )}

      <button
        type="button"
        onClick={onLogout}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-md transition-all cursor-pointer text-left"
      >
        <LogOut size={14} />
        <span>Sair da Sessão</span>
      </button>
    </div>
  );
}

// ─── Tooltip helper ─────────────────────────────────────────────────────────

function SidebarTooltip({ label, shortcut }: { label: string; shortcut?: string }) {
  return (
    <div
      className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-md shadow-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 flex items-center gap-1.5 bg-foreground border border-foreground"
    >
      <span className="text-[11px] font-medium text-background">{label}</span>
      {shortcut && (
        <kbd
          className="px-1 py-0.5 text-[9px] font-mono text-background/80 rounded bg-background/20"
        >
          {shortcut}
        </kbd>
      )}
    </div>
  );
}

function SidebarNavItem({ 
  icon, 
  label, 
  active = false, 
  href, 
  onClick, 
  badge,
  isCollapsed = false,
  shortcut,
  tooltip,
  accent = false,
  dataTour,
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  href?: string; 
  onClick?: () => void; 
  badge?: string; 
  isCollapsed?: boolean; 
  shortcut?: string; 
  tooltip?: string; 
  accent?: boolean; 
  dataTour?: string;
}) {
  if (isCollapsed) {
    const el = (
      <div 
        data-tour={dataTour}
        onClick={onClick}
        className={`w-9 h-9 mx-auto rounded-md flex items-center justify-center cursor-pointer transition-all relative group ${
          active 
            ? 'bg-primary/10 text-primary' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <span className={accent ? 'text-primary' : ''}>{icon}</span>
        {badge && (
          <span className="absolute -top-1 -right-1 min-w-[15px] h-4 px-1 flex items-center justify-center text-[9px] font-semibold rounded-full bg-primary text-primary-foreground ring-2 ring-[#FAFAFA]">
            {badge}
          </span>
        )}
        <SidebarTooltip label={tooltip || label} shortcut={shortcut} />
      </div>
    );
    if (href) return <Link href={href} className="block my-1">{el}</Link>;
    return <div className="my-1">{el}</div>;
  }

  const el = (
    <div 
      data-tour={dataTour}
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all relative group ${
        active 
          ? 'bg-primary/5 text-primary font-medium' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`shrink-0 transition-colors ${
          accent 
            ? 'text-primary' 
            : active 
              ? 'text-primary' 
              : 'text-muted-foreground group-hover:text-foreground'
        }`}>
          {icon}
        </span>
        <span className={`text-[13px] truncate ${active ? 'font-semibold text-primary' : 'font-medium'}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums ${
            active 
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {badge}
          </span>
        )}
        {shortcut && (
          <kbd
            className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground rounded bg-background border border-border"
          >
            {shortcut}
          </kbd>
        )}
      </div>
    </div>
  );

  if (href) return <Link href={href} className="block mb-0.5">{el}</Link>;
  return <div className="mb-0.5">{el}</div>;
}
