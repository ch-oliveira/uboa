'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Home, 
  ClipboardList, 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  BarChart2, 
  Settings, 
  ChevronsLeft, 
  ChevronsRight, 
  LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOrders } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';

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
}

export function Sidebar({ 
  currentRoute, 
  onOpenAgenda, 
  onOpenReports, 
  onOpenSettings 
}: SidebarProps) {
  const { stats, units, isSidebarCollapsed, toggleSidebar, settings } = useOrders();
  const { user, role, logout } = useAuth();

  const isGestor = role === 'GESTOR' || role === 'ADMIN';
  const isTecnico = role === 'TECNICO';
  const isSolicitante = role === 'SOLICITANTE';

  return (
    <aside 
      className={`${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      } bg-[#1e293b] text-white flex flex-col h-full shrink-0 select-none print:hidden transition-all duration-300 ease-in-out relative z-30 shadow-xl border-r border-slate-800/80`}
    >
      {/* Brand Header & Toggle */}
      <div className={`p-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} border-b border-slate-800/80 min-h-[68px]`}>
        {isSidebarCollapsed ? (
          <button
            type="button"
            onClick={toggleSidebar}
            title="Expandir barra lateral (Ctrl+B)"
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform group relative shadow-md"
          >
            <div className="w-5 h-5 bg-[#1e293b] rounded-xs transform rotate-45" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1D6FEB] text-white flex items-center justify-center shadow-xs text-[10px]">
              <ChevronsRight size={11} />
            </span>
          </button>
        ) : (
          <>
            <Link href="/" className="flex items-center gap-3 group min-w-0" title="zelo. Gestão Municipal">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <div className="w-5 h-5 bg-[#1e293b] rounded-xs transform rotate-45" />
              </div>
              <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
                <span className="text-xl font-black tracking-tight text-white leading-none">zelo.</span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                  {isGestor ? 'Gestão Municipal' : isTecnico ? 'Operações de Campo' : 'Painel de Unidade'}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={toggleSidebar}
              title="Recolher barra lateral (Ctrl+B)"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <ChevronsLeft size={18} />
            </button>
          </>
        )}
      </div>

      {/* Navigation Links baseados em RBAC */}
      <nav className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-3'} py-4 space-y-1.5 overflow-y-auto overflow-x-hidden`}>
        {/* Visão Geral (Todos os perfis) */}
        <SidebarNavItem 
          icon={<Home size={20} />} 
          label="Visão geral" 
          href="/" 
          active={currentRoute === '/'} 
          isCollapsed={isSidebarCollapsed}
        />

        {/* Chamados / Minhas Ordens */}
        <SidebarNavItem 
          icon={<ClipboardList size={20} />} 
          label={isGestor ? 'Chamados' : isTecnico ? 'Minhas Ordens' : 'Meus Chamados'} 
          href="/chamados" 
          active={currentRoute === '/chamados'} 
          badge={stats.totalOpen > 0 ? String(stats.totalOpen) : undefined}
          badgeColor={isTecnico ? 'bg-amber-600' : isSolicitante ? 'bg-emerald-600' : 'bg-[#1D6FEB]'}
          isCollapsed={isSidebarCollapsed}
        />

        {/* Kanban (Gestor e Técnico) */}
        {(isGestor || isTecnico) && (
          <SidebarNavItem 
            icon={<LayoutDashboard size={20} />} 
            label={isTecnico ? 'Kanban Execução' : 'Kanban'} 
            href="/kanban" 
            active={currentRoute === '/kanban'} 
            isCollapsed={isSidebarCollapsed}
          />
        )}

        {/* Unidades (Exclusivo Gestor) */}
        {isGestor && (
          <SidebarNavItem 
            icon={<Building2 size={20} />} 
            label="Unidades" 
            href="/unidades" 
            active={currentRoute === '/unidades'} 
            badge={units.length > 0 ? String(units.length) : undefined}
            badgeColor="bg-slate-700"
            isCollapsed={isSidebarCollapsed}
          />
        )}
        
        {/* Agenda (Gestor e Técnico) */}
        {(isGestor || isTecnico) && (
          <>
            <div className="pt-2 pb-1 px-2">
              <div className="h-px bg-slate-800/80" />
            </div>

            <SidebarNavItem 
              icon={<Calendar size={20} />} 
              label={isTecnico ? 'Minha Agenda' : 'Agenda'} 
              href="/agenda"
              active={currentRoute === '/agenda'}
              onClick={onOpenAgenda}
              isCollapsed={isSidebarCollapsed}
            />
          </>
        )}

        {/* Relatórios e Configurações (Exclusivo Gestor) */}
        {isGestor && (
          <>
            <SidebarNavItem 
              icon={<BarChart2 size={20} />} 
              label="Relatórios" 
              href="/relatorios"
              active={currentRoute === '/relatorios'}
              onClick={onOpenReports}
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarNavItem 
              icon={<Settings size={20} />} 
              label="Configurações" 
              href="/configuracoes"
              active={currentRoute === '/configuracoes'}
              onClick={onOpenSettings}
              isCollapsed={isSidebarCollapsed}
            />
          </>
        )}
      </nav>

      {/* Footer Profile & Logout */}
      <div className={`${isSidebarCollapsed ? 'p-2' : 'p-3'} border-t border-slate-800/80 space-y-2`}>
        {/* User Card */}
        {isSidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="group relative">
              <Avatar className="h-10 w-10 border-2 border-slate-600 shadow-xs">
                <AvatarImage src={user?.avatar || 'https://i.pravatar.cc/150?u=mariana'} />
                <AvatarFallback>{user?.nome ? user.nome.slice(0, 2).toUpperCase() : 'ZE'}</AvatarFallback>
              </Avatar>
              <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#1e293b] rounded-full ${
                isGestor ? 'bg-blue-500' : isTecnico ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />

              {/* Floating Tooltip for User */}
              <div className="pointer-events-none absolute left-full ml-3 bottom-1 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                <p className="font-bold text-white leading-tight">{user?.nome || 'Usuário Zelo'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{user?.cargo || (isGestor ? 'Gestão Municipal' : isTecnico ? 'Técnico' : 'Solicitante')}</p>
                {user?.predio && <p className="text-[10px] text-slate-400">{user.predio}</p>}
              </div>
            </div>

            {/* Logout button collapsed */}
            <button
              type="button"
              onClick={logout}
              title="Sair da sessão"
              className="w-10 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2.5 bg-slate-800/70 rounded-xl border border-slate-700/60 transition-all">
            <div className="relative shrink-0">
              <Avatar className="h-9 w-9 border-2 border-slate-600">
                <AvatarImage src={user?.avatar || 'https://i.pravatar.cc/150?u=mariana'} />
                <AvatarFallback>{user?.nome ? user.nome.slice(0, 2).toUpperCase() : 'ZE'}</AvatarFallback>
              </Avatar>
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-[#1e293b] rounded-full ${
                isGestor ? 'bg-blue-500' : isTecnico ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate leading-tight">
                {user?.nome || settings?.gestorNome || 'Mariana Alves'}
              </span>

              {/* Role Badge */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                  role === 'ADMIN'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : isGestor 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : isTecnico 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {role === 'ADMIN' ? 'ADMIN / DEV' : isGestor ? 'GESTORA' : isTecnico ? 'TÉCNICO' : 'SOLICITANTE'}
                </span>
                {isSolicitante && user?.predio && (
                  <span className="text-[10px] text-slate-400 truncate">
                    • {user.predio.replace('EMEF ', '').replace('UBS ', '')}
                  </span>
                )}
              </div>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={logout}
              title="Sair da sessão"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        {/* Keyboard shortcut hint and version when expanded */}
        {!isSidebarCollapsed && (
          <div className="space-y-1.5 px-2 pt-1 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Alternar barra</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[9px] text-slate-400 shadow-xs">
                Ctrl+B
              </kbd>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-semibold text-slate-400">v1.0.0</span>
              {role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('zelo:toggle-dev-drawer'))}
                  title="Abrir Painel do Desenvolvedor (Ctrl+Shift+D)"
                  className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer text-[10px]"
                >
                  DevTools
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function SidebarNavItem({ 
  icon, 
  label, 
  active = false, 
  href, 
  onClick,
  badge,
  badgeColor = 'bg-slate-700',
  isCollapsed = false,
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  href?: string; 
  onClick?: () => void;
  badge?: string;
  badgeColor?: string;
  isCollapsed?: boolean;
}) {
  if (isCollapsed) {
    const collapsedContent = (
      <div 
        onClick={onClick}
        className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center cursor-pointer transition-all relative group ${
          active 
            ? 'bg-[#1D6FEB] text-white shadow-md shadow-blue-500/30' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        {icon}

        {/* Small badge indicator on icon */}
        {badge && (
          <span className={`absolute top-2 right-2 min-w-[15px] h-3.5 px-1 flex items-center justify-center text-[9px] font-extrabold rounded-full text-white ${badgeColor} shadow-xs`}>
            {badge}
          </span>
        )}

        {/* Floating Tooltip */}
        <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 flex items-center gap-1.5">
          <span>{label}</span>
          {badge && (
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
    );

    if (href) {
      return <Link href={href} className="block my-1">{collapsedContent}</Link>;
    }
    return <div className="my-1">{collapsedContent}</div>;
  }

  // Expanded layout
  const expandedContent = (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
        active 
          ? 'bg-[#1D6FEB] text-white font-semibold shadow-md shadow-blue-500/20' 
          : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0">{icon}</span>
        <span className="text-sm truncate">{label}</span>
      </div>
      {badge && (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white shrink-0 ${active ? 'bg-white/20' : badgeColor}`}>
          {badge}
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{expandedContent}</Link>;
  }

  return expandedContent;
}
