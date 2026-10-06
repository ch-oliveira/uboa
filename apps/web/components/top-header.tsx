'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, X, ChevronRight, ArrowLeft, Compass } from 'lucide-react';
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
  const { orders, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useOrders();
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
    <header className="h-16 flex items-center justify-between px-8 bg-card/80 backdrop-blur-md border-b border-border shrink-0 relative z-30">
      <div className="flex items-center text-xs font-semibold text-muted-foreground min-w-0">
        {(showBackButton || backHref) && (
          <div className="flex items-center mr-3 pr-3 border-r border-border shrink-0">
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
            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className="text-muted-foreground/40 select-none shrink-0">/</span>
                )}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground hover:underline transition-colors truncate max-w-[180px] md:max-w-none font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={`truncate ${isLast ? 'text-foreground font-bold' : ''}`}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-5">
        {actions && (
          <div className="flex items-center gap-3 border-r border-border pr-5 mr-1">
            {actions}
          </div>
        )}
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar chamado ou unidade..."
            className="w-72 pl-9 pr-8 py-2 bg-input border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X size={14} />
            </button>
          )}

          {/* Quick search popup */}
          {searchQuery.trim() && searchQuickResults.length > 0 && (
            <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-40 animate-in fade-in slide-in-from-top-2">
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
          className="relative text-muted-foreground hover:text-[#2563EB] p-2 rounded-xl hover:bg-blue-50/70 transition-colors cursor-pointer"
          title="Iniciar Tour Guiado da Plataforma"
          aria-label="Iniciar Tour Guiado da Plataforma"
        >
          <Compass size={19} />
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            data-tour="notifications-bell"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
            title="Alertas e Notificações"
          >
            <Bell size={19} />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-84 bg-card rounded-2xl shadow-popover border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
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
                          const found = orders.find((o) => o.id === n.orderId);
                          if (found) onSelectOrder(found);
                        }
                        setIsNotificationsOpen(false);
                      }}
                      className={`p-3.5 hover:bg-[#F8FAFC] cursor-pointer transition-colors flex items-start gap-3 ${
                        n.unread ? 'bg-[#0A2540]/5' : ''
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.unread ? 'bg-[#0A2540]' : 'bg-transparent'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#0F172A]">{n.title}</p>
                        <p className="text-[11px] text-[#475569] mt-0.5 truncate">{n.message}</p>
                        <p className="text-[10px] text-[#94A3B8] mt-1">{n.time}</p>
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
