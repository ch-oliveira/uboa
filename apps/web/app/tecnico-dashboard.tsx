'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  ChevronRight, 
  AlertTriangle, 
  Check, 
  User, 
  ArrowRight, 
  PauseCircle, 
  ShieldAlert, 
  Camera, 
  Search, 
  Calendar, 
  Layers, 
  Package, 
  ExternalLink,
  Hourglass,
  Sparkles,
  MapPin,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders, type AgendaEvent } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { type OrdemServico, type StatusOS } from './kanban/data';
import { getPriorityBadge } from '@/lib/badges';

type TecnicoTab = 'EM_EXECUCAO' | 'AGENDADOS' | 'AGUARDANDO_ACEITE' | 'TODOS';

interface TecnicoDashboardProps {
  onOpenReportAnomalia: () => void;
  onSelectOrder: (order: OrdemServico) => void;
  onSelectUnit?: (unitName: string) => void;
  onSelectAgendaEvent?: (evt: AgendaEvent) => void;
  showToast: (msg: string) => void;
}

export function TecnicoDashboard({
  onOpenReportAnomalia,
  onSelectOrder,
  onSelectUnit,
  onSelectAgendaEvent,
  showToast,
}: TecnicoDashboardProps) {
  const { orders, agenda, updateOrder, toggleAgendaItem } = useOrders();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TecnicoTab>('EM_EXECUCAO');
  const [searchQuery, setSearchQuery] = useState('');

  // Identificação do técnico logado
  const tecnicoNome = user?.nome || 'Carlos Silva';

  // Filtra apenas ordens atribuídas ao técnico (ou gerais de campo se não atribuídas)
  const myOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!o.tecnico) return false;
      const t = o.tecnico.toLowerCase().trim();
      const me = tecnicoNome.toLowerCase().trim();
      return t === me || t.includes(me) || me.includes(t);
    });
  }, [orders, tecnicoNome]);

  // Estatísticas operacionais exclusivas do técnico
  const techStats = useMemo(() => {
    const emExecucao = myOrders.filter((o) => o.status === 'EM_EXECUCAO');
    const pausados = myOrders.filter((o) => o.impedimento?.ativo || o.motivoPausa);
    const aguardandoAceite = myOrders.filter((o) => o.status === 'AGUARDANDO');
    const agendados = myOrders.filter((o) => o.status === 'AGENDADO');
    const urgentes = myOrders.filter((o) => o.prioridade === 'URGENTE' || o.slaViolado);
    const concluidos = myOrders.filter((o) => o.status === 'CONCLUIDO');

    return {
      emExecucaoCount: emExecucao.length,
      pausadosCount: pausados.length,
      aguardandoAceiteCount: aguardandoAceite.length,
      agendadosCount: agendados.length,
      urgentesCount: urgentes.length,
      concluidosCount: concluidos.length,
      totalAtribuidos: myOrders.length,
    };
  }, [myOrders]);

  // Agenda exclusiva do técnico para hoje
  const myAgenda = useMemo(() => {
    return agenda.filter((ev) => {
      if (!ev.tecnico) return true;
      const t = ev.tecnico.toLowerCase().trim();
      const me = tecnicoNome.toLowerCase().trim();
      return t === me || t.includes(me) || me.includes(t);
    });
  }, [agenda, tecnicoNome]);

  const upcomingCommitments = myAgenda.filter((item) => !item.completed);
  const completedCommitments = myAgenda.filter((item) => item.completed);
  const nextCommitment = upcomingCommitments[0] || null;

  // Unidades onde o técnico tem ordens ativas
  const myUnits = useMemo(() => {
    const unitsMap = new Map<string, number>();
    myOrders.forEach((o) => {
      if (o.status !== 'CONCLUIDO' && o.status !== 'CANCELADO') {
        unitsMap.set(o.predio, (unitsMap.get(o.predio) || 0) + 1);
      }
    });
    return Array.from(unitsMap.entries()).map(([name, count]) => ({ name, count }));
  }, [myOrders]);

  // Ordens filtradas para a pauta
  const displayedOrders = useMemo(() => {
    return myOrders.filter((order) => {
      // Busca por título, código ou prédio
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          order.titulo.toLowerCase().includes(q) ||
          order.predio.toLowerCase().includes(q) ||
          order.id.toLowerCase().includes(q) ||
          (order.categoria && order.categoria.toLowerCase().includes(q));
        if (!matches) return false;
      }

      switch (activeTab) {
        case 'EM_EXECUCAO':
          return order.status === 'EM_EXECUCAO';
        case 'AGENDADOS':
          return order.status === 'AGENDADO' || order.status === 'TRIAGEM';
        case 'AGUARDANDO_ACEITE':
          return order.status === 'AGUARDANDO';
        case 'TODOS':
        default:
          return order.status !== 'CONCLUIDO';
      }
    });
  }, [myOrders, activeTab, searchQuery]);

  // Iniciar atendimento em campo
  function handleStartExecution(order: OrdemServico, e: React.MouseEvent) {
    e.stopPropagation();
    const updated: OrdemServico = {
      ...order,
      status: 'EM_EXECUCAO',
      iniciadoEm: new Date().toISOString(),
      historico: [
        {
          data: `Hoje, ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          descricao: `Atendimento técnico iniciado no local por ${tecnicoNome}.`,
          autor: tecnicoNome,
          tipo: 'STATUS',
        },
        ...(order.historico || []),
      ],
    };
    updateOrder(updated);
    showToast(`Atendimento iniciado para o chamado #${order.id.replace(/^(os-|OS-)/i, '')}`);
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* ─── 1. CABEÇALHO OPERACIONAL DO TÉCNICO ─── */}
      <div data-tour="tecnico-header" className="bg-muted/50 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
              <Wrench size={11} />
              Operação de Campo
            </span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              {user?.cargo || 'Técnico Especialista em Manutenção'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Painel Operacional — {tecnicoNome}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Sua rota, ordens em andamento e vistorias programadas para hoje.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            data-tour="tecnico-reportar"
            onClick={onOpenReportAnomalia}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl px-4 py-2 flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Camera size={15} />
            <span>+ Reportar Anomalia no Local</span>
          </Button>
        </div>
      </div>

      {/* ─── 2. CARDS MÉTRICOS OPERACIONAIS (FOCO NO TÉCNICO) ─── */}
      <div data-tour="tecnico-kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Em Execução / No Local */}
        <div 
          onClick={() => setActiveTab('EM_EXECUCAO')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'EM_EXECUCAO' 
              ? 'bg-card border-primary ring-2 ring-primary/20 shadow-sm' 
              : 'bg-card border-border hover:border-foreground/20 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wrench size={18} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              No local
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              {techStats.emExecucaoCount}
            </div>
            <p className="text-xs font-bold text-foreground mt-0.5">Minhas OS em andamento</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Equipe ativa prestando serviço</p>
          </div>
        </div>

        {/* Card 2: Pausados / Falta de Peça */}
        <div 
          onClick={() => setActiveTab('TODOS')}
          className="p-5 rounded-2xl border bg-card border-border hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PauseCircle size={18} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              SLA congelado
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              {techStats.pausadosCount}
            </div>
            <p className="text-xs font-bold text-foreground mt-0.5">Aguardando peças / Pausados</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Prazo congelado por impedimento</p>
          </div>
        </div>

        {/* Card 3: Aguardando Aceite da Escola */}
        <div 
          onClick={() => setActiveTab('AGUARDANDO_ACEITE')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'AGUARDANDO_ACEITE' 
              ? 'bg-card border-primary ring-2 ring-primary/20 shadow-sm' 
              : 'bg-card border-border hover:border-foreground/20 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
              Pendente aceite
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              {techStats.aguardandoAceiteCount}
            </div>
            <p className="text-xs font-bold text-foreground mt-0.5">Aguardando aceite da unidade</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Concluídos aguardando validação</p>
          </div>
        </div>

        {/* Card 4: Minhas Urgências Hoje */}
        <div 
          onClick={() => setActiveTab('TODOS')}
          className="p-5 rounded-2xl border bg-card border-border hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              Prioridade
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-foreground tracking-tight">
              {techStats.urgentesCount}
            </div>
            <p className="text-xs font-bold text-foreground mt-0.5">Minhas urgências hoje</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Chamados com SLA crítico atribuídos</p>
          </div>
        </div>

      </div>

      {/* ─── 3. GRID PRINCIPAL: PAUTA DO DIA (ESQ) & AGENDA / APOIO (DIR) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: MINHA PAUTA DE TRABALHO */}
        <div className="lg:col-span-8 space-y-6">
          
          <div data-tour="tecnico-pauta" className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-5">
            
            {/* Header da Pauta & Abas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ClipboardList size={18} className="text-primary" />
                  <span>Minha Pauta de Ordens de Serviço</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chamados vinculados diretamente a você para execução e registro
                </p>
              </div>

              <Link
                href="/chamados"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Ver meu Kanban completo</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Filtros por Abas & Busca */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl overflow-x-auto text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('EM_EXECUCAO')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'EM_EXECUCAO' 
                      ? 'bg-card text-foreground shadow-2xs' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Em Execução ({techStats.emExecucaoCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('AGENDADOS')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'AGENDADOS' 
                      ? 'bg-card text-foreground shadow-2xs' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Para Iniciar ({techStats.agendadosCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('AGUARDANDO_ACEITE')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'AGUARDANDO_ACEITE' 
                      ? 'bg-card text-foreground shadow-2xs' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Aguardando Aceite ({techStats.aguardandoAceiteCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('TODOS')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'TODOS' 
                      ? 'bg-card text-foreground shadow-2xs' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Todos ({techStats.totalAtribuidos})
                </button>
              </div>

              <div className="relative w-full sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar na pauta..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-muted/60 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>
            </div>

            {/* Lista das Ordens de Serviço */}
            <div className="divide-y divide-border -mx-5 px-5">
              {displayedOrders.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <Wrench size={28} className="mx-auto text-muted-foreground/40" />
                  <p className="text-sm font-semibold text-foreground">
                    Nenhum chamado nesta etapa para você
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {activeTab === 'EM_EXECUCAO'
                      ? 'Você não possui ordens em execução ativa no momento. Inicie uma ordem agendada da sua rota.'
                      : activeTab === 'AGUARDANDO_ACEITE'
                      ? 'Nenhum chamado seu aguardando conferência da diretoria das unidades.'
                      : 'Tudo em dia com a sua pauta técnica.'}
                  </p>
                </div>
              ) : (
                displayedOrders.map((order) => {
                  const isUrgente = order.prioridade === 'URGENTE';
                  const isAlta = order.prioridade === 'ALTA';
                  const isMedia = order.prioridade === 'MEDIA';
                  const cleanId = order.id.replace(/^(os-|OS-)/i, '');

                  return (
                    <div
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="py-4 hover:bg-muted/40 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-muted-foreground">
                            #{cleanId}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isUrgente
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : isAlta
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : isMedia
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {order.prioridade}
                          </span>

                          {order.impedimento?.ativo && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              <PauseCircle size={10} />
                              SLA Congelado (Falta Peça)
                            </span>
                          )}

                          {order.fotos && order.fotos.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                              <Camera size={10} />
                              {order.fotos.length} fotos
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {order.titulo}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Building2 size={12} className="text-muted-foreground" />
                            {order.predio}
                          </span>
                          {order.localizacao && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {order.localizacao}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Prazo: Hoje até 18:00
                          </span>
                        </div>
                      </div>

                      {/* Ações Específicas do Perfil Técnico */}
                      <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {order.status === 'EM_EXECUCAO' && (
                          <Button
                            onClick={() => onSelectOrder(order)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl px-3.5 py-1.5 h-9 flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Camera size={13} />
                            <span>Registrar Execução / Fotos</span>
                            <ArrowRight size={13} />
                          </Button>
                        )}

                        {order.status === 'AGENDADO' && (
                          <Button
                            onClick={(e) => handleStartExecution(order, e)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl px-3.5 py-1.5 h-9 flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Wrench size={13} />
                            <span>Iniciar Atendimento</span>
                          </Button>
                        )}

                        {order.status === 'AGUARDANDO' && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300 px-3 py-1.5 rounded-xl border border-purple-200/80 flex items-center gap-1.5">
                              <Hourglass size={13} />
                              Aguardando aceite da escola
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSelectOrder(order)}
                              className="text-xs font-medium rounded-xl h-8 px-2.5 cursor-pointer"
                            >
                              Ver notas
                            </Button>
                          </div>
                        )}

                        {order.status === 'CONCLUIDO' && (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={14} />
                            Aceito & Finalizado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

        {/* COLUNA DIREITA: AGENDA DO DIA & APOIO TÉCNICO */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. Minha Agenda de Hoje */}
          <div data-tour="tecnico-agenda" className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span>Agenda de Hoje</span>
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Vistorias técnicas programadas</p>
              </div>

              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                {completedCommitments.length}/{myAgenda.length} concluídas
              </span>
            </div>

            {/* Próximo Compromisso em Destaque */}
            {nextCommitment ? (
              <div className="rounded-xl p-4 border border-primary/20 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Próximo compromisso
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {nextCommitment.time}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-foreground leading-snug">
                    {nextCommitment.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Building2 size={11} className="shrink-0" />
                    <span>{nextCommitment.subtitle}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-primary/15 text-xs">
                  <span className="text-[11px] text-muted-foreground">
                    Atribuído a {nextCommitment.tecnico || tecnicoNome}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      toggleAgendaItem(nextCommitment.id);
                      showToast(`Vistoria "${nextCommitment.title}" marcada como concluída.`);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Check size={12} />
                    <span>Concluir Vistoria</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-border bg-muted/30 text-center space-y-1">
                <CheckCircle2 size={20} className="mx-auto text-emerald-600" />
                <p className="text-xs font-bold text-foreground">Vistorias de hoje concluídas</p>
                <p className="text-[11px] text-muted-foreground">
                  Todas as vistorias da sua rota de hoje foram finalizadas.
                </p>
              </div>
            )}

            {/* Próximos da semana */}
            {upcomingCommitments.length > 1 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Compromissos seguintes ({upcomingCommitments.length - 1})
                </span>
                {upcomingCommitments.slice(1).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectAgendaEvent?.(item)}
                    className="p-2.5 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-foreground truncate">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-muted-foreground shrink-0">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/agenda"
                className="w-full text-center py-2 text-xs font-bold text-primary hover:underline block"
              >
                Ver minha agenda semanal completa →
              </Link>
            </div>
          </div>

          {/* 2. Unidades com Atendimento Hoje (Diagnóstico Pré-Campo) */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Building2 size={16} className="text-primary" />
                  <span>Unidades da Minha Rota</span>
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Consulte o histórico predial antes de sair da base
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {myUnits.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nenhuma unidade com chamados pendentes para você hoje.
                </p>
              ) : (
                myUnits.map(({ name, count }) => (
                  <div
                    key={name}
                    onClick={() => onSelectUnit?.(name)}
                    className="p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {count} chamado(s) atribuído(s) a você
                      </p>
                    </div>
                    <span className="text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                      <ChevronRight size={14} />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Orientações de Conformidade Técnica & Auditoria */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-3 border border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-blue-300 shrink-0" />
              <h4 className="font-bold text-xs">Padrão Operacional & TCE</h4>
            </div>
            <ul className="text-[11px] text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Evidências obrigatórias:</strong> fotografe o quadro ou disjuntor antes e depois da intervenção.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Consumo de peças:</strong> registre os materiais do almoxarifado utilizados para compor a medição.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Falta de material:</strong> aponte impedimento imediatamente para congelar o prazo de SLA.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
