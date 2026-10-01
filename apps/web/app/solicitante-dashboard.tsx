'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  ChevronRight, 
  Search, 
  X, 
  User, 
  Phone, 
  ShieldCheck, 
  Sparkles,
  School,
  Activity,
  Calendar,
  FileCheck,
  ThumbsUp,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { type OrdemServico, type StatusOS } from './kanban/data';
import { SolicitanteDashboardSkeleton } from '@/components/skeletons';
import { getPriorityBadge } from '@/lib/badges';

type SolicitanteTab = 'TODOS' | 'EM_ANDAMENTO' | 'AGUARDANDO_ACEITE' | 'CONCLUIDOS';

interface SolicitanteDashboardProps {
  onOpenNewOrder: () => void;
  onSelectOrder: (order: OrdemServico) => void;
  showToast: (msg: string) => void;
}

const STAGES: { key: StatusOS; label: string; desc: string }[] = [
  { key: 'TRIAGEM', label: 'Triagem', desc: 'Em avaliação técnica' },
  { key: 'AGENDADO', label: 'Agendado', desc: 'Visita técnica marcada' },
  { key: 'EM_EXECUCAO', label: 'Em Campo', desc: 'Reparo em execução' },
  { key: 'AGUARDANDO', label: 'Aceite', desc: 'Aguardando validação' },
  { key: 'CONCLUIDO', label: 'Concluído', desc: 'Serviço finalizado' },
];

function getStageIndex(status: StatusOS): number {
  switch (status) {
    case 'TRIAGEM': return 0;
    case 'AGENDADO': return 1;
    case 'EM_EXECUCAO': return 2;
    case 'AGUARDANDO': return 3;
    case 'CONCLUIDO': return 4;
    default: return 0;
  }
}

export function SolicitanteDashboard({
  onOpenNewOrder,
  onSelectOrder,
  showToast,
}: SolicitanteDashboardProps) {
  const { orders, agenda, updateOrder, isLoadingData } = useOrders();
  const { user } = useAuth();

  if (isLoadingData) {
    return <SolicitanteDashboardSkeleton />;
  }

  const [activeTab, setActiveTab] = useState<SolicitanteTab>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Unidade do solicitante
  const unitName = user?.predio || 'EMEF Paulo Freire';
  const isSchool = unitName.startsWith('EMEF') || unitName.startsWith('EMEI') || unitName.includes('Escola');

  // Filtra apenas chamados pertencentes à unidade do solicitante
  const unitOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!o.predio) return true;
      const oPredio = o.predio.toLowerCase().trim();
      const uPredio = unitName.toLowerCase().trim();
      return oPredio === uPredio || oPredio.includes(uPredio) || uPredio.includes(oPredio);
    });
  }, [orders, unitName]);

  // Estatísticas calculadas exclusivamente para a unidade
  const unitStats = useMemo(() => {
    const openOrders = unitOrders.filter((o) => o.status !== 'CONCLUIDO');
    const inProgress = unitOrders.filter((o) => o.status === 'EM_EXECUCAO' || o.status === 'AGENDADO' || o.status === 'TRIAGEM');
    const awaitingAcceptance = unitOrders.filter((o) => o.status === 'AGUARDANDO');
    const completed = unitOrders.filter((o) => o.status === 'CONCLUIDO');

    return {
      totalOpen: openOrders.length,
      inProgress: inProgress.length,
      awaitingAcceptance: awaitingAcceptance.length,
      completed: completed.length,
    };
  }, [unitOrders]);

  // Chamados filtrados pela aba e busca
  const displayedOrders = useMemo(() => {
    return unitOrders.filter((o) => {
      // Busca
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          o.titulo.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          (o.descricao && o.descricao.toLowerCase().includes(q)) ||
          (o.tecnico && o.tecnico.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Aba
      switch (activeTab) {
        case 'EM_ANDAMENTO':
          return o.status === 'TRIAGEM' || o.status === 'AGENDADO' || o.status === 'EM_EXECUCAO';
        case 'AGUARDANDO_ACEITE':
          return o.status === 'AGUARDANDO';
        case 'CONCLUIDOS':
          return o.status === 'CONCLUIDO';
        case 'TODOS':
        default:
          return true;
      }
    });
  }, [unitOrders, activeTab, searchQuery]);

  // Agenda filtrada apenas para a unidade do solicitante
  const unitAgenda = useMemo(() => {
    return agenda.filter((item) => {
      const loc = item.subtitle.toLowerCase().trim();
      const uPredio = unitName.toLowerCase().trim();
      return loc.includes(uPredio) || uPredio.includes(loc);
    });
  }, [agenda, unitName]);

  // Ação de validação / aceite do serviço pelo Solicitante
  function handleConfirmAcceptance(order: OrdemServico, e: React.MouseEvent) {
    e.stopPropagation();
    const updated: OrdemServico = {
      ...order,
      status: 'CONCLUIDO',
      historico: [
        ...(order.historico || []),
        {
          data: `Hoje, ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          descricao: `Serviço validado e aceito com sucesso pela unidade por ${user?.nome || 'Diretora'}.`,
          autor: user?.nome || 'Solicitante',
        },
      ],
    };

    updateOrder(updated);
    showToast(`Chamado ${order.id} validado com sucesso! Reparo dado como concluído.`);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-background">
      
      {/* Top Banner de Boas-Vindas & Identidade da Unidade */}
      <div className="ds-card p-6 lg:p-8 relative overflow-hidden">
        {/* Background decorative gradient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50/70 text-blue-900 border border-blue-900/20">
                {isSchool ? <School size={14} /> : <Activity size={14} />}
                {unitName}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                • {user?.cargo || 'Responsável da Unidade'}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Olá, {user?.nome || 'Profª Maria Clara'}! 👋
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-xl">
              Aqui você acompanha em tempo real o andamento das solicitações de reparo e manutenção da sua unidade.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 bg-input border border-border rounded-xl text-xs font-semibold text-foreground select-none">
              <Calendar size={15} className="text-muted-foreground" />
              <span>23 set 2026</span>
            </div>

            <Button
              onClick={onOpenNewOrder}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 py-2.5 font-bold shadow-sm h-11 transition-all hover:shadow cursor-pointer flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Novo chamado</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Cards de Andamento Geral da Unidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total em Aberto */}
        <div 
          onClick={() => setActiveTab('TODOS')}
          className={`ds-card p-5 transition-all cursor-pointer select-none ${
            activeTab === 'TODOS' 
              ? 'border-primary ring-2 ring-primary/20 shadow-xs' 
              : 'hover:border-primary/30 hover:shadow-card-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Chamados Abertos</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50/70 text-blue-900 flex items-center justify-center">
              <Building2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900">{unitStats.totalOpen}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Registrados na sua unidade</p>
          </div>
        </div>

        {/* Em Atendimento / Campo */}
        <div 
          onClick={() => setActiveTab('EM_ANDAMENTO')}
          className={`ds-card p-5 transition-all cursor-pointer select-none ${
            activeTab === 'EM_ANDAMENTO' 
              ? 'border-primary ring-2 ring-primary/20 shadow-xs' 
              : 'hover:border-primary/30 hover:shadow-card-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Em Atendimento</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900">{unitStats.inProgress}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Equipes em campo ou agendadas</p>
          </div>
        </div>

        {/* Aguardam sua Validação */}
        <div 
          onClick={() => setActiveTab('AGUARDANDO_ACEITE')}
          className={`ds-card p-5 transition-all cursor-pointer select-none ${
            activeTab === 'AGUARDANDO_ACEITE' 
              ? 'border-primary ring-2 ring-primary/20 shadow-xs' 
              : 'hover:border-primary/30 hover:shadow-card-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Aguardam Validação</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center relative">
              <FileCheck size={18} />
              {unitStats.awaitingAcceptance > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-600 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900">{unitStats.awaitingAcceptance}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Serviços prontos para seu aceite</p>
          </div>
        </div>

        {/* Concluídos */}
        <div 
          onClick={() => setActiveTab('CONCLUIDOS')}
          className={`ds-card p-5 transition-all cursor-pointer select-none ${
            activeTab === 'CONCLUIDOS' 
              ? 'border-primary ring-2 ring-primary/20 shadow-xs' 
              : 'hover:border-primary/30 hover:shadow-card-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resolvidos</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900">{unitStats.completed}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Finalizados e aprovados</p>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Colunas (Andamento das Solicitações) e 1 Coluna (Visitas & Contatos) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Lista de Chamados com Esteira de Progresso Visual */}
        <div className="lg:col-span-2 space-y-6">
          <div className="ds-card overflow-hidden flex flex-col">
            
            {/* Header com Filtros e Busca */}
            <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="ds-section-title">Andamento das Manutenções</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Acompanhe cada etapa dos chamados da sua unidade
                </p>
              </div>

              {/* Tabs de Filtro */}
              <div className="flex items-center bg-muted p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('TODOS')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'TODOS'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Todos ({unitOrders.length})
                </button>
                <button
                  onClick={() => setActiveTab('EM_ANDAMENTO')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'EM_ANDAMENTO'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Em Andamento ({unitStats.inProgress})
                </button>
                <button
                  onClick={() => setActiveTab('AGUARDANDO_ACEITE')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'AGUARDANDO_ACEITE'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Validar
                  {unitStats.awaitingAcceptance > 0 && (
                    <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {unitStats.awaitingAcceptance}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Barra de busca de chamados na unidade */}
            <div className="px-6 py-3 bg-muted/50 border-b border-border flex items-center gap-3">
              <Search size={15} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por problema, código ou técnico..."
                className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Lista dos Chamados da Unidade com Stepper */}
            <div className="divide-y divide-slate-100">
              {displayedOrders.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Nenhum chamado encontrado</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {searchQuery 
                      ? 'Nenhuma solicitação corresponde ao termo pesquisado.' 
                      : 'Sua unidade não possui pendências nesta categoria no momento.'}
                  </p>
                  <Button
                    onClick={onOpenNewOrder}
                    variant="outline"
                    className="mt-2 rounded-xl text-xs font-semibold"
                  >
                    + Abrir novo chamado
                  </Button>
                </div>
              ) : (
                displayedOrders.map((order) => {
                  const currentStageIdx = getStageIndex(order.status);
                  const isAwaitingAcceptance = order.status === 'AGUARDANDO';

                  return (
                    <div 
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="p-6 hover:bg-slate-50/80 transition-all cursor-pointer group space-y-4"
                    >
                      {/* Linha Superior: Título, ID, Prioridade e Ação */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-slate-400">
                              {order.id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getPriorityBadge(order.prioridade)}`}>
                              {order.prioridade}
                            </span>

                            {order.tecnico && (
                              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <User size={12} className="text-slate-400" />
                                {order.tecnico}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {order.titulo}
                          </h3>

                          {order.descricao && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {order.descricao}
                            </p>
                          )}
                        </div>

                        {/* Botão de Validação Rápida ou Ver Detalhes */}
                        <div className="shrink-0 flex items-center gap-2">
                          {isAwaitingAcceptance ? (
                            <Button
                              onClick={(e) => handleConfirmAcceptance(order, e)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-3.5 py-1.5 h-9 shadow-xs flex items-center gap-1.5"
                            >
                              <ThumbsUp size={14} />
                              <span>Validar Reparo</span>
                            </Button>
                          ) : (
                            <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center">
                              Detalhes <ChevronRight size={15} className="ml-0.5" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Banner de Validação se estiver aguardando aceite */}
                      {isAwaitingAcceptance && (
                        <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-center justify-between text-xs text-purple-900 gap-3">
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-600 shrink-0" />
                            <span>
                              <strong>O técnico concluiu a intervenção.</strong> Por favor, verifique se o reparo foi realizado a contento e clique em <em>Validar Reparo</em>.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Esteira de Progresso Visual (Stepper) */}
                      <div className="pt-2">
                        <div className="relative">
                          {/* Linha de fundo conectora */}
                          <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
                          
                          {/* Linha de progresso preenchida */}
                          <div 
                            className="absolute top-3 left-4 h-0.5 bg-blue-900 transition-all duration-500 -z-0"
                            style={{ 
                              width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%` 
                            }} 
                          />

                          {/* Etapas */}
                          <div className="flex items-center justify-between relative z-10">
                            {STAGES.map((stage, idx) => {
                              const isCompleted = idx < currentStageIdx;
                              const isCurrent = idx === currentStageIdx;

                              return (
                                <div key={stage.key} className="flex flex-col items-center">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-xs ${
                                    isCompleted 
                                      ? 'bg-blue-900 text-white ring-2 ring-blue-900/20' 
                                      : isCurrent 
                                      ? 'bg-white border-2 border-blue-900 text-blue-900 ring-4 ring-blue-900/10 animate-pulse' 
                                      : 'bg-slate-200 text-slate-500 border border-slate-300'
                                  }`}>
                                    {isCompleted ? <CheckCircle2 size={13} /> : idx + 1}
                                  </div>
                                  <span className={`text-[11px] mt-1.5 font-bold ${
                                    isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground/80'
                                  }`}>
                                    {stage.label}
                                  </span>
                                  <span className="text-[9px] text-slate-400 hidden sm:inline">
                                    {stage.desc}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Rodapé do Card: Data de Abertura */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Aberto em: {order.dataAbertura}</span>
                        {order.historico && order.historico.length > 0 && (
                          <span className="text-slate-500 font-medium">
                            Última atualização: {order.historico[order.historico.length - 1]?.descricao}
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

        {/* Coluna Direita: Próximas Visitas na SUA Unidade & Contatos Úteis */}
        <div className="space-y-6">
          
          {/* Próximas Visitas Técnicas na SUA Unidade */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Próximas Visitas</h2>
                <p className="text-xs text-slate-400">Técnicos escalados para {unitName}</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-blue-50/70 text-blue-900 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>

            {unitAgenda.length === 0 ? (
              <div className="p-6 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                <CheckCircle size={24} className="text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Nenhuma visita agendada hoje</p>
                <p className="text-[11px] text-slate-400">
                  Sua unidade está em funcionamento regular e sem vistorias de campo programadas no momento.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unitAgenda.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                        <Clock size={13} /> {item.time}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        Confirmado
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">{item.title}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <User size={12} className="text-slate-400" />
                      Técnico: {item.tecnico || 'Equipe de Manutenção'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Central de Suporte e Contato com a Gestão Predial */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Phone size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Plantão de Zeladoria</h2>
                <p className="text-xs text-slate-400">Suporte direto com a gestão municipal</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gestora Responsável</span>
                <p className="font-bold text-slate-800">Mariana Alves</p>
                <p className="text-[11px] text-slate-500">Secretaria de Infraestrutura e Zeladoria</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Telefone / Emergência</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Phone size={13} className="text-blue-900" />
                  (11) 3241-8900
                </p>
                <p className="text-[10px] text-slate-400">Disponível de Seg a Sex, das 07h às 19h</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prazo Médio de Triagem</span>
                <p className="font-bold text-slate-800">Até 4 horas para urgências</p>
                <p className="text-[10px] text-slate-400">Vistorias elétricas e hidráulicas prioritárias</p>
              </div>
            </div>
          </div>

          {/* Dica / Orientações para a Escola/UBS */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-6 text-white space-y-3 shadow-md border border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-300" />
              <h3 className="font-bold text-sm">Urboa nas Unidades</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ao identificar infiltrações, falhas elétricas ou problemas na estrutura da escola, registre imediatamente com fotos para agilizar a triagem técnica.
            </p>
            <Button
              onClick={onOpenNewOrder}
              className="w-full bg-white text-blue-950 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs h-9 cursor-pointer"
            >
              + Relatar Nova Ocorrência
            </Button>
          </div>

        </div>

      </div>

    </div>
  );
}
