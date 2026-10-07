'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  User, 
  Printer, 
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Send,
  Loader2,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { 
  type OrdemServico, 
  type Prioridade, 
  type StatusOS, 
  type HistoricoItem,
  TECNICOS 
} from '@/app/kanban/data';
import { getPriorityBadgeInfo, getStatusBadge } from '@/lib/badges';
import { UrbiTriageCard } from '@/components/triage/urbi-triage-card';

// Fluxo operacional sequencial de 5 fases (ABNT NBR 5674)
const STAGES_FLOW: { id: StatusOS; label: string; step: number; description: string }[] = [
  { id: 'TRIAGEM',     step: 1, label: 'Triagem',     description: 'Classificação e triagem técnica' },
  { id: 'AGENDADO',    step: 2, label: 'Agendado',    description: 'Técnico alocado na escala' },
  { id: 'EM_EXECUCAO', step: 3, label: 'Execução',    description: 'Equipe em campo no local' },
  { id: 'AGUARDANDO',  step: 4, label: 'Validação',   description: 'Inspeção e aceite da unidade' },
  { id: 'CONCLUIDO',   step: 5, label: 'Concluído',   description: 'Formalização e encerramento' },
];

export default function ChamadoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, updateOrder, deleteOrder, isLoadingData } = useOrders();
  const { user, role } = useAuth();

  const isSolicitante = role === 'SOLICITANTE';
  const isGestor = !isSolicitante;

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const orderId = String(params?.id || '');

  // Localiza o chamado correspondente na base por código formatado ou ID numérico
  const order = useMemo(() => {
    if (!orderId || !orders.length) return null;
    const cleanTarget = orderId.toLowerCase().replace(/^(os-|ch-)/, '');
    return (
      orders.find((o) => {
        const cleanO = o.id.toLowerCase().replace(/^(os-|ch-)/, '');
        return cleanO === cleanTarget || o.id.toLowerCase() === orderId.toLowerCase();
      }) || null
    );
  }, [orders, orderId]);

  // SLA estimado padrão com base na criticidade
  const defaultSla = useMemo(() => {
    if (!order) return '';
    switch (order.prioridade) {
      case 'URGENTE': return 'Atendimento emergencial em até 4 horas';
      case 'ALTA':    return 'Atendimento prioritário em até 24 horas';
      case 'MEDIA':   return 'Atendimento programado em até 3 dias úteis';
      case 'BAIXA':   return 'Atendimento de rotina em até 7 dias úteis';
      default:        return 'Em até 24 horas';
    }
  }, [order]);

  // Próximo status no fluxo operacional
  const nextStage = useMemo(() => {
    if (!order) return null;
    const currentIndex = STAGES_FLOW.findIndex((s) => s.id === order.status);
    if (currentIndex >= 0 && currentIndex < STAGES_FLOW.length - 1) {
      return STAGES_FLOW[currentIndex + 1];
    }
    return null;
  }, [order]);

  // Avançar estágio da OS
  async function handleAdvanceStatus() {
    if (!order || !nextStage) return;
    setIsAdvancing(true);

    const now = new Date();
    const timeStr = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const authorName = user?.nome || 'Gestor Operacional';

    const historyItem: HistoricoItem = {
      data: timeStr,
      descricao: `Status avançado de "${order.status}" para "${nextStage.id}" por ${authorName}.`,
      autor: authorName,
      tipo: 'STATUS',
    };

    const updated: OrdemServico = {
      ...order,
      status: nextStage.id,
      historico: [historyItem, ...(order.historico || [])],
    };

    await updateOrder(updated);
    setIsAdvancing(false);
  }

  // Adicionar comentário/apontamento na timeline
  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !order) return;

    setIsSubmittingComment(true);
    const now = new Date();
    const timeStr = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const authorName = user?.nome ? `${user.nome} (${isSolicitante ? 'Unidade' : 'Gestão'})` : 'Equipe Técnica';

    const item: HistoricoItem = {
      data: timeStr,
      descricao: newComment.trim(),
      autor: authorName,
      tipo: 'COMENTARIO',
    };

    const updated: OrdemServico = {
      ...order,
      historico: [item, ...(order.historico || [])],
    };

    await updateOrder(updated);
    setNewComment('');
    setIsSubmittingComment(false);
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 3000);
  }

  // Alteração de prioridade sincronizada com a IA
  async function handleChangePriority(newPri: Prioridade, justification?: string) {
    if (!order) return;

    const now = new Date();
    const timeStr = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const authorName = user?.nome || 'Gestor';

    const justificationText = justification ? ` (Justificativa: "${justification}")` : '';
    const item: HistoricoItem = {
      data: timeStr,
      descricao: `Prioridade alterada de "${order.prioridade}" para "${newPri}" por ${authorName}${justificationText}.`,
      autor: authorName,
      tipo: 'STATUS',
    };

    const updated: OrdemServico = {
      ...order,
      prioridade: newPri,
      historico: [item, ...(order.historico || [])],
    };

    await updateOrder(updated);
  }

  // Reatribuição rápida de técnico
  async function handleAssignTechnician(techName: string) {
    if (!order) return;
    const now = new Date();
    const timeStr = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const item: HistoricoItem = {
      data: timeStr,
      descricao: techName 
        ? `Técnico responsável alterado para ${techName}.` 
        : 'Técnico desvinculado da ordem de serviço.',
      autor: user?.nome || 'Gestor',
      tipo: 'STATUS',
    };

    const updated: OrdemServico = {
      ...order,
      tecnico: techName || undefined,
      historico: [item, ...(order.historico || [])],
    };

    await updateOrder(updated);
  }

  if (isLoadingData) {
    return (
      <div className="flex h-screen bg-[#F8FAFC]">
        <Sidebar currentRoute="/chamados" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#0A2540]" />
            <p className="text-xs font-semibold text-slate-500">Carregando dados da ocorrência...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen bg-[#F8FAFC]">
        <Sidebar currentRoute="/chamados" />
        <main className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border border-slate-200">
            <FileText size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Chamado não encontrado</h2>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            O registro &quot;{orderId}&quot; pode ter sido cancelado, concluído ou o código informado é inválido.
          </p>
          <Link href="/chamados">
            <Button className="bg-[#0A2540] hover:bg-[#07192C] text-white rounded-xl text-xs font-semibold px-5 h-10 flex items-center gap-2 cursor-pointer shadow-xs">
              <ArrowLeft size={14} />
              <span>Voltar para Lista de Chamados</span>
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const priorityInfo = getPriorityBadgeInfo(order.prioridade);
  const statusInfo = getStatusBadge(order.status);
  const currentStageIndex = STAGES_FLOW.findIndex((s) => s.id === order.status);

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar currentRoute="/chamados" />

      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* ======================================================== */}
        {/* 1. TOP BAR — Refactoring UI: Hierarquia Clara & Breadcrumbs */}
        {/* ======================================================== */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 sm:py-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link 
              href="/chamados"
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Voltar para Chamados"
            >
              <ArrowLeft size={16} />
            </Link>

            <nav className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/chamados" className="hover:text-slate-900 font-medium transition-colors">
                Chamados
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-mono font-semibold text-slate-900">{order.id}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="text-xs font-medium text-slate-700 border-slate-200 hover:bg-slate-50 rounded-lg h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer size={13} strokeWidth={1.8} />
              <span>Imprimir OS</span>
            </Button>

            {nextStage && isGestor && (
              <Button
                onClick={handleAdvanceStatus}
                disabled={isAdvancing}
                className="bg-[#0A2540] hover:bg-[#07192C] text-white text-xs font-semibold rounded-lg h-8 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
              >
                {isAdvancing ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <>
                    <span>Avançar para {nextStage.label}</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </Button>
            )}
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. CONTEÚDO PRINCIPAL — Grid Balanceada de 2 Colunas     */}
        {/* ======================================================== */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Header Card: Título, Prédio e Badges de Criticidade */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
                  {order.id}
                </span>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.style}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                  {statusInfo.label}
                </span>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityInfo.style}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotColor}`} />
                  {priorityInfo.label}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={13} />
                <span>Aberto em {order.dataAbertura || 'Recentemente'}</span>
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {order.titulo}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Building2 size={14} className="text-slate-400" />
                  <span className="font-semibold">{order.predio}</span>
                </div>
                {order.localizacao && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{order.localizacao}</span>
                  </div>
                )}
                {order.solicitante && (
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" />
                    <span>Solicitado por: <strong className="text-slate-700 font-semibold">{order.solicitante}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Stepper Operacional de 5 Etapas */}
            <div className="pt-4 border-t border-slate-100 overflow-x-auto pb-1">
              <div className="grid grid-cols-5 min-w-[320px] sm:min-w-0 gap-2 sm:gap-3">
                {STAGES_FLOW.map((stage, idx) => {
                  const isPassed = currentStageIndex > idx;
                  const isCurrent = currentStageIndex === idx;

                  return (
                    <div 
                      key={stage.id}
                      className={`flex flex-col gap-1 p-2 rounded-xl transition-all ${
                        isCurrent 
                          ? 'bg-blue-50/80 border border-blue-200/80' 
                          : isPassed 
                            ? 'bg-slate-50/80 border border-slate-200/60' 
                            : 'opacity-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isCurrent ? 'text-blue-900' : isPassed ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          Etapa {stage.step}
                        </span>
                        {isPassed && <CheckCircle2 size={12} className="text-emerald-600" />}
                      </div>
                      <span className={`text-xs font-semibold truncate ${
                        isCurrent ? 'text-slate-900' : isPassed ? 'text-slate-700' : 'text-slate-500'
                      }`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid Principal: 2 Colunas (Conteúdo Técnico + Metadados de Suporte) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* COLUNA ESQUERDA (2 spans): Triagem Urbi, Descrição e Timeline */}
            <div className="lg:col-span-2 space-y-6">

              {/* Card 1: Triagem Inteligente Urbi */}
              <UrbiTriageCard
                order={order}
                currentPriority={order.prioridade}
                isSolicitante={isSolicitante}
                onChangePriority={handleChangePriority}
              />

              {/* Card 2: Detalhamento Técnico da Ocorrência */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Descrição do Problema
                  </h3>
                  <span className="text-[11px] text-slate-400">Relato original da ocorrência</span>
                </div>

                <div className="text-sm text-slate-700 bg-slate-50/70 border border-slate-100 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                  {order.descricao || 'Nenhuma descrição complementar registrada para esta solicitação.'}
                </div>
              </div>

              {/* Card 3: Linha do Tempo e Apontamentos Técnicos */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Linha do Tempo & Apontamentos
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Histórico cronológico de tramitações e pareceres técnicos
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {(order.historico || []).length} registros
                  </span>
                </div>

                {/* Formulário para registrar novo parecer */}
                <form onSubmit={handleAddComment} className="space-y-2.5">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Registrar nota técnica, observação de visita ou parecer..."
                    rows={3}
                    className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                  />
                  <div className="flex items-center justify-between">
                    {commentSuccess ? (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        Nota registrada com sucesso!
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        O apontamento será anexado permanentemente à ordem de serviço.
                      </span>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="bg-[#0A2540] hover:bg-[#07192C] text-white text-xs font-semibold rounded-xl h-8 px-3.5 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingComment ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <>
                          <span>Adicionar Apontamento</span>
                          <Send size={12} />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Lista de Registros da Linha do Tempo */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  {(order.historico && order.historico.length > 0) ? (
                    order.historico.map((item, i) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100 text-xs"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                          {item.tipo === 'STATUS' ? (
                            <ArrowRight size={13} className="text-blue-700" />
                          ) : (
                            <FileText size={13} className="text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-800">{item.autor}</span>
                            <span className="text-slate-400">{item.data}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed font-normal">{item.descricao}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Nenhum apontamento adicional registrado até o momento.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* COLUNA DIREITA (1 span): Metadados Operacionais, SLA e Técnico */}
            <div className="space-y-6">

              {/* Card Lateral 1: Atribuição Técnica */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Equipe Responsável
                  </h3>
                  <Wrench size={14} className="text-slate-400" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-slate-500">
                    Técnico Encarregado
                  </label>
                  {isGestor ? (
                    <select
                      value={order.tecnico || ''}
                      onChange={(e) => handleAssignTechnician(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="">(Sem técnico designado)</option>
                      {TECNICOS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700">
                      {order.tecnico || 'Aguardando designação de equipe pela zeladoria'}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-500">Prazo Operacional (SLA)</span>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700">
                    <Clock size={14} className="text-blue-900" />
                    <span>{order.prazoEstimado || defaultSla}</span>
                  </div>
                </div>
              </div>

              {/* Card Lateral 2: Dados da Unidade */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Unidade Municipal
                  </h3>
                  <Building2 size={14} className="text-slate-400" />
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Equipamento Público</span>
                    <strong className="text-slate-800 text-sm font-bold">{order.predio}</strong>
                  </div>

                  {order.localizacao && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 block">Setor / Ponto Focal</span>
                      <span className="text-slate-700 font-medium">{order.localizacao}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 block">Solicitante da Abertura</span>
                    <span className="text-slate-700 font-medium">{order.solicitante || 'Direção da Unidade'}</span>
                  </div>
                </div>
              </div>

              {/* Card Lateral 3: Conformidade e Auditoria */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <ShieldAlert size={14} className="text-blue-900" />
                  <span>Conformidade ABNT NBR 5674</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Todas as alterações de status, prazos e pareceres são registradas em log de auditoria imutável com carimbo de tempo.
                </p>
              </div>

              {/* Ação Terciária Discreta: Exclusão (apenas Gestor em confirmação) */}
              {isGestor && (
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Deseja realmente remover o chamado ${order.id}? Esta ação não pode ser desfeita.`)) {
                        deleteOrder(order.id);
                        router.push('/chamados');
                      }
                    }}
                    className="text-[11px] text-rose-600 hover:text-rose-800 hover:underline cursor-pointer transition-colors"
                  >
                    Excluir registro deste chamado
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
