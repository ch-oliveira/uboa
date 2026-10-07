'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, X, ChevronRight, ArrowLeft, Compass, Menu } from 'lucide-react';
import { useOrders } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { useOnboarding } from '@/context/onboarding-context';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function TopHeader({
  titleOverride,
  breadcrumbs,
  showBackButton,
  backHref,
  searchQuery,
  setSearchQuery,
  onSelectOrder,
  actions
}: {
  titleOverride?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  backHref?: string;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onSelectOrder: (order: any) => void;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  const { user, role } = useAuth();
  const isSolicitante = role === 'SOLICITANTE';
  const { orders, notifications, markNotificationAsRead, markAllNotificationsAsRead, toggleMobileNav } = useOrders();
  const { startTour } = useOnboarding();

  const effectiveBreadcrumbs: BreadcrumbItem[] = useMemo(() => {
    if (breadcrumbs && breadcrumbs.length > 0) {
      return breadcrumbs;
    }
    if (isSolicitante) {
      return [
        { label: user?.predio || 'Painel da Unidade', href: '/' },
        { label: titleOverride || 'Acompanhamento' }
      ];
    }
    return [
      { label: 'Gestão municipal', href: '/' },
      { label: titleOverride || 'Visão geral' }
    ];
  }, [breadcrumbs, isSolicitante, user?.predio, titleOverride]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter((n) => n.unread).length;
  }, [notifications]);

  const searchQuickResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return orders.filter(
      (o) =>
        o.titulo.toLowerCase().includes(q) ||
        o.predio.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [orders, searchQuery]);

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 md:px-8 bg-card/80 backdrop-blur-md border-b border-border shrink-0 relative z-30">
      <div className="flex items-center text-xs font-semibold text-muted-foreground min-w-0 mr-2 sm:mr-4">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={toggleMobileNav}
          className="md:hidden -ml-1 mr-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
          aria-label="Abrir menu de navegação"
          title="Abrir menu"
        >
          <Menu size={18} />
        </button>

        {(showBackButton || backHref) && (
          <div className="flex items-center mr-2 sm:mr-3 pr-2 sm:pr-3 border-r border-border shrink-0">
            {backHref ? (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                title="Voltar para a página anterior"
              >
                <ArrowLeft size={13} className="shrink-0" />
                <span className="hidden sm:inline">Voltar</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                title="Voltar para a página anterior"
              >
                <ArrowLeft size={13} className="shrink-0" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}
          </div>
        )}

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-hidden">
          {effectiveBreadcrumbs.map((crumb, idx) => {
            const isLast = idx === effectiveBreadcrumbs.length - 1;
            const isFirst = idx === 0;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className={`text-muted-foreground/40 select-none shrink-0 ${!isLast && !isFirst ? 'hidden sm:inline' : ''}`}>/</span>
                )}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground hover:underline transition-colors truncate max-w-[90px] xs:max-w-[130px] md:max-w-none font-medium hidden sm:inline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={`truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none ${isLast ? 'text-foreground font-bold' : 'hidden sm:inline'}`}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
        {actions && (
          <div className="hidden sm:flex items-center gap-2 border-r border-border pr-3 mr-1">
            {actions}
          </div>
        )}
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar chamado..."
            className="w-28 xs:w-36 sm:w-56 md:w-72 pl-8 sm:pl-9 pr-6 sm:pr-8 py-1.5 sm:py-2 bg-input border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X size={13} />
            </button>
          )}

          {/* Quick search popup */}
          {searchQuery.trim() && searchQuickResults.length > 0 && (
            <div className="absolute top-full mt-2 right-0 sm:left-0 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-40 animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] font-bold uppercase text-[#475569] tracking-wider px-3 py-1">
                Resultados instantâneos ({searchQuickResults.length})
              </div>
              {searchQuickResults.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    onSelectOrder(r);
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 rounded-xl hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-[#0F172A] truncate">{r.titulo}</p>
                    <p className="text-[11px] text-[#475569] truncate">{r.predio} • #{r.id.replace(/^(os-|OS-)/i, '')}</p>
                  </div>
                  <ChevronRight size={14} className="text-[#94A3B8] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Tour e Guia Interativo */}
        <button
          onClick={startTour}
          className="relative text-muted-foreground hover:text-[#2563EB] p-1.5 sm:p-2 rounded-xl hover:bg-blue-50/70 transition-colors cursor-pointer"
          title="Iniciar Tour Guiado da Plataforma"
          aria-label="Iniciar Tour Guiado da Plataforma"
        >
          <Compass size={18} />
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            data-tour="notifications-bell"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative text-muted-foreground hover:text-foreground p-1.5 sm:p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
            title="Alertas e Notificações"
          >
            <Bell size={18} />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-84 max-w-sm bg-card rounded-2xl shadow-popover border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-border flex items-center justify-between bg-input">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0F172A]">Alertas e Notificações</span>
                  {unreadNotifsCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FEECEB] text-[#DC2626]">
                      {unreadNotifsCount} novo(s)
                    </span>
                  )}
                </div>
                {unreadNotifsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-[#0A2540] hover:underline font-semibold cursor-pointer"
                  >
                    Ler todas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#475569]">
                    Nenhuma notificação no momento.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.orderId) {
                          const ord = orders.find((o) => o.id === n.orderId);
                          if (ord) onSelectOrder(ord);
                        }
                        setIsNotificationsOpen(false);
                      }}
                      className={`p-3.5 hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
                        n.unread ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`text-xs font-bold text-[#0F172A] truncate ${n.unread ? 'text-[#0A2540]' : ''}`}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-[#475569] mt-0.5 leading-snug line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                        <span className="text-[10px] text-[#94A3B8] shrink-0 font-medium">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
