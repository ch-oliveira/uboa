'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  X, 
  User, 
  Wrench, 
  Trash2, 
  Save, 
  Send,
  Building2,
  AlertTriangle,
  ThumbsUp,
  Loader2,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Printer,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  PauseCircle,
  RotateCcw,
  Check,
  FileText,
  Camera,
  MapPin,
  MoreVertical,
  Info,
  Hourglass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { 
  COLUMNS, 
  PREDIOS, 
  TECNICOS, 
  type OrdemServico, 
  type Prioridade, 
  type StatusOS,
  type HistoricoItem 
} from './data';
import { getPriorityBadge } from '@/lib/badges';
import { UrbiTriageCard } from '@/components/triage/urbi-triage-card';
import { analyzeTriageUrbi } from '@/lib/triage-engine';

interface Props {
  order: OrdemServico | null;
  onClose: () => void;
  onUpdate: (updatedOrder: OrdemServico) => void | Promise<any>;
  onDelete: (orderId: string) => void | Promise<any>;
  onNextOrder?: () => void;
  hasNextOrder?: boolean;
  isPageMode?: boolean;
}

// Configuração visual dos passos do fluxo operacional
const STAGES_FLOW: { id: StatusOS; label: string; roleAction: string }[] = [
  { id: 'TRIAGEM',     label: '1. Triagem',     roleAction: 'Gestão de Zeladoria' },
  { id: 'AGENDADO',    label: '2. Agendado',    roleAction: 'Escala Técnica' },
  { id: 'EM_EXECUCAO', label: '3. Execução',    roleAction: 'Equipe em Campo' },
  { id: 'AGUARDANDO',  label: '4. Validação',   roleAction: 'Unidade / Solicitante' },
  { id: 'CONCLUIDO',   label: '5. Concluído',   roleAction: 'Formalizado' },
];

export function OrderDetailModal({ 
  order, 
  onClose, 
  onUpdate, 
  onDelete,
  onNextOrder,
  hasNextOrder = false,
  isPageMode = false,
}: Props) {
  const { user, role } = useAuth();
  const isSolicitante = role === 'SOLICITANTE';
  const isGestor = !isSolicitante;

  // Form Fields
  const [titulo, setTitulo] = useState('');
  const [predio, setPredio] = useState('');
  const [prioridade, setPrioridade] = useState<Prioridade>('MEDIA');
  const [status, setStatus] = useState<StatusOS>('TRIAGEM');
  const [tecnico, setTecnico] = useState('');
  const [descricao, setDescricao] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [prazoEstimado, setPrazoEstimado] = useState('');
  
  // Apontamentos & Linha do Tempo
  const [newComment, setNewComment] = useState('');
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Estados de Interface e Exceções
  const [isSaving, setIsSaving] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showImpedimentModal, setShowImpedimentModal] = useState(false);
  const [impedimentMotivo, setImpedimentMotivo] = useState('Falta de material / peça de reposição');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'historico'>('geral');

  // Inicialização e sincronização com o chamado recebido
  useEffect(() => {
    if (order) {
      setTitulo(order.titulo || '');
      setPredio(order.predio || '');
      setPrioridade(order.prioridade || 'MEDIA');
      setStatus(order.status || 'TRIAGEM');
      setTecnico(order.tecnico || '');
      setDescricao(order.descricao || '');
      setLocalizacao(order.localizacao || 'Prédio Principal - Áreas de Acesso');
      setPrazoEstimado(order.prazoEstimado || calculateDefaultSla(order.prioridade));

      // Garante que o histórico sempre começa com a abertura oficial do chamado
      const baseHistory: HistoricoItem[] = (order.historico && order.historico.length > 0)
        ? order.historico
        : [
            {
              data: order.dataAbertura || 'Hoje',
              descricao: `Chamado registrado por ${order.solicitante || 'Unidade'}. Aguardando triagem operacional.`,
              autor: order.solicitante || 'Unidade',
              tipo: 'SISTEMA',
            },
          ];

      setHistorico(baseHistory);
      setIsSaving(false);
      setIsAdvancing(false);
      setShowMenu(false);
      setShowImpedimentModal(false);
      setShowDeleteConfirm(false);
      setShowPrintModal(false);
    }
  }, [order]);

  // Cálculo automático do SLA padrão com base na prioridade
  function calculateDefaultSla(pri: Prioridade) {
    switch (pri) {
      case 'URGENTE': return 'Hoje até 14:00 (SLA 4h)';
      case 'ALTA':    return 'Hoje até 18:00 (SLA 24h)';
      case 'MEDIA':   return 'Em até 3 dias úteis';
      case 'BAIXA':   return 'Em até 7 dias úteis';
      default:        return 'Hoje até 18:00';
    }
  }

  // Verifica se o formulário tem alterações pendentes em relação ao original
  const isDirty = useMemo(() => {
    if (!order) return false;
    return (
      titulo !== order.titulo ||
      predio !== order.predio ||
      prioridade !== order.prioridade ||
      status !== order.status ||
      (tecnico || '') !== (order.tecnico || '') ||
      (descricao || '') !== (order.descricao || '')
    );
  }, [order, titulo, predio, prioridade, status, tecnico, descricao]);

  // Se nada foi selecionado, não renderiza o modal
  if (!order) return null;

  // Formatação de data/hora atual
  function getCurrentTimeString() {
    const now = new Date();
    const day = now.getDate();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const month = months[now.getMonth()];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `Hoje, ${hours}:${minutes}`;
  }

  // Grava nota técnica ou apontamento imediatamente na timeline e sincroniza
  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !order) return;

    const formattedTime = getCurrentTimeString();
    const authorName = user?.nome ? `${user.nome} (${isSolicitante ? 'Unidade' : 'Gestão'})` : 'Mariana Alves (Gestão)';

    const item: HistoricoItem = {
      data: formattedTime,
      descricao: newComment.trim(),
      autor: authorName,
      tipo: 'COMENTARIO',
    };

    const newHist = [item, ...historico];
    setHistorico(newHist);
    setNewComment('');
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 3000);

    // Salva imediatamente a nota na ordem de serviço
    const updated: OrdemServico = {
      ...order,
      historico: newHist,
    };
    await onUpdate(updated);
  }

  // Transição orientada a Ação ("A Bola da Vez")
  async function handleAdvanceWorkflow(targetStatus: StatusOS, actionDescription: string) {
    if (!order) return;
    setIsAdvancing(true);

    const formattedTime = getCurrentTimeString();
    const actor = user?.nome ? `${user.nome}` : 'Mariana Alves';

    const transitionItem: HistoricoItem = {
      data: formattedTime,
      descricao: actionDescription,
      autor: `${actor} (${isSolicitante ? 'Unidade' : 'Gestão'})`,
      tipo: 'STATUS',
    };

    // Se estiver encaminhando da triagem e técnico não estiver selecionado, atribui um padrão
    const designatedTech = tecnico || (targetStatus === 'AGENDADO' ? 'Carlos T.' : undefined);

    const updated: OrdemServico = {
      ...order,
      titulo,
      predio,
      prioridade,
      status: targetStatus,
      tecnico: designatedTech,
      descricao,
      prazoEstimado: prazoEstimado || calculateDefaultSla(prioridade),
      historico: [transitionItem, ...historico],
      impedimento: targetStatus === 'CONCLUIDO' ? undefined : order.impedimento,
    };

    try {
      setStatus(targetStatus);
      if (designatedTech) setTecnico(designatedTech);
      setHistorico([transitionItem, ...historico]);
      await onUpdate(updated);
      onClose();
    } finally {
      setIsAdvancing(false);
    }
  }

  // Sinalização de Impedimento (Exceções: falta de material, prédio fechado)
  async function handleApplyImpediment() {
    if (!order) return;
    const formattedTime = getCurrentTimeString();
    const actor = user?.nome || 'Mariana Alves';

    const impedimentItem: HistoricoItem = {
      data: formattedTime,
      descricao: `⚠️ ATENDIMENTO PAUSADO: ${impedimentMotivo}. Prazo de execução congelado temporariamente.`,
      autor: `${actor} (Operação)`,
      tipo: 'EXCECAO',
    };

    const updated: OrdemServico = {
      ...order,
      impedimento: {
        ativo: true,
        motivo: impedimentMotivo,
        data: formattedTime,
      },
      historico: [impedimentItem, ...historico],
    };

    setHistorico([impedimentItem, ...historico]);
    setShowImpedimentModal(false);
    await onUpdate(updated);
  }

  // Retomada de Impedimento
  async function handleResolveImpediment() {
    if (!order) return;
    const formattedTime = getCurrentTimeString();
    const actor = user?.nome || 'Mariana Alves';

    const resolveItem: HistoricoItem = {
      data: formattedTime,
      descricao: `✓ Impedimento operacional superado. Atendimento e contagem de prazo retomados.`,
      autor: `${actor} (Operação)`,
      tipo: 'EXCECAO',
    };

    const updated: OrdemServico = {
      ...order,
      impedimento: undefined,
      historico: [resolveItem, ...historico],
    };

    setHistorico([resolveItem, ...historico]);
    await onUpdate(updated);
  }

  // Salva edições gerais nos campos do formulário
  async function handleSaveGeneralChanges() {
    if (!order) return;
    setIsSaving(true);
    
    // Se a prioridade foi alterada, registra rastro na timeline
    let newHist = [...historico];
    if (prioridade !== order.prioridade) {
      newHist = [
        {
          data: getCurrentTimeString(),
          descricao: `Prioridade alterada de ${order.prioridade} para ${prioridade} por ${user?.nome || 'Mariana Alves'}.`,
          autor: `${user?.nome || 'Mariana Alves'} (Gestão)`,
          tipo: 'STATUS',
        },
        ...newHist,
      ];
      setHistorico(newHist);
    }

    const updated: OrdemServico = {
      ...order,
      titulo,
      predio,
      prioridade,
      status,
      tecnico: tecnico || undefined,
      descricao: descricao || undefined,
      prazoEstimado: prazoEstimado || calculateDefaultSla(prioridade),
      historico: newHist,
    };

    try {
      await onUpdate(updated);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  // Código limpo e exibição visual do chamado e da OS
  const cleanId = order.id.replace(/^(os-|OS-|ch-|CH-)/i, '');
  const displayCode = `CH-${cleanId}`;
  const displayOsCode = `OS-${cleanId}`;

  // Localização do chamado na esteira de etapas
  const currentStageIndex = STAGES_FLOW.findIndex((s) => s.id === status);

  return (
    <div className={isPageMode ? "w-full flex justify-center pb-8" : "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-5 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-200"}>
      <div 
        className={`ds-card w-full max-w-4xl overflow-hidden flex flex-col ${isPageMode ? 'shadow-xs border-transparent' : 'shadow-popover h-[96vh] sm:h-[90vh]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* 1. CABEÇALHO COM IDENTIFICAÇÃO E AÇÕES RÁPIDAS           */}
        {/* ======================================================== */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex items-center justify-between bg-muted/80">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-black px-2.5 py-1 bg-primary/10 text-primary rounded-lg tracking-wider font-mono">
              {displayCode}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-muted text-muted-foreground rounded-md font-mono">
              {displayOsCode}
            </span>
            <span className="text-muted-foreground/30">·</span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock size={13} className="text-muted-foreground" />
              <span>Aberto em {order.dataAbertura}</span>
            </div>
            <span className="text-muted-foreground/30">·</span>
            <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
              <Building2 size={13} className="text-primary" />
              <span>{order.predio}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Botão de Próximo Chamado para Triagem Fluida */}
            {hasNextOrder && onNextOrder && (
              <button
                type="button"
                onClick={onNextOrder}
                className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Avançar para o próximo chamado pendente na fila"
              >
                <span>Próximo</span>
                <ChevronRight size={13} />
              </button>
            )}

            {/* Link para visualização dedicada em página completa (apenas quando em modal) */}
            {!isPageMode && (
              <Link
                href={`/chamados/${order.id}`}
                onClick={onClose}
                title="Abrir em página dedicada de tela cheia"
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <span>Tela cheia</span>
                <ExternalLink size={13} />
              </Link>
            )}

            {/* Menu de Ações (⋮) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 hover:bg-muted transition-colors"
                title="Mais opções"
              >
                <MoreVertical size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-56 ds-card shadow-popover py-1.5 z-30 text-xs font-medium text-foreground animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowPrintModal(true);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-muted/50 flex items-center gap-2 cursor-pointer"
                  >
                    <Printer size={14} className="text-muted-foreground" />
                    <span>Imprimir Ordem de Serviço (A4)</span>
                  </button>

                  {isGestor && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowImpedimentModal(true);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-amber-900 flex items-center gap-2 cursor-pointer"
                    >
                      <PauseCircle size={14} className="text-amber-600" />
                      <span>Sinalizar Falta de Material</span>
                    </button>
                  )}

                  {isGestor && (
                    <div className="my-1 border-t border-border" />
                  )}

                  {isGestor && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <Trash2 size={14} className="text-red-500" />
                      <span>Cancelar / Excluir Registro</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Botão de Fechar */}
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 hover:bg-muted transition-colors ml-1 cursor-pointer"
              title="Fechar janela"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NAVEGAÇÃO INTERNA (TABS)                                 */}
        {/* ======================================================== */}
        <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 border-b border-border bg-muted/10 shrink-0 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('geral')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'geral' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Visão Geral e Gestão
          </button>
          <button 
            onClick={() => setActiveTab('historico')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'historico' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Auditoria & Apontamentos
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
              activeTab === 'historico' ? 'bg-primary/10 text-primary' : 'bg-border/60 text-muted-foreground'
            }`}>
              {historico.length} reg.
            </span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* CORPO DO MODAL (CONTEÚDO DAS TABS)                       */}
        {/* ======================================================== */}
        <div className="flex flex-col flex-1 overflow-hidden bg-background">
          
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'geral' && (
            <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar animate-in fade-in duration-200">

          {/* TÍTULO PRINCIPAL DO CHAMADO */}
          <div>
            {isSolicitante ? (
              <h1 className="text-xl sm:text-2xl font-black text-foreground leading-tight">
                {order.titulo}
              </h1>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Título da Ocorrência
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full text-lg sm:text-xl font-bold text-foreground border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors py-0.5"
                  placeholder="Título claro da manutenção..."
                />
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* STEPPER DE FLUXO (ESTEIRA SEM CORTES DE TEXTO)           */}
          {/* ======================================================== */}
          <div className="bg-muted/30 p-2 sm:p-3 rounded-lg border border-border overflow-x-auto">
            <div className="grid grid-cols-5 min-w-[330px] sm:min-w-0 gap-1.5 sm:gap-2">
              {STAGES_FLOW.map((stg, idx) => {
                const isActive = status === stg.id;
                const isPassed = currentStageIndex > idx;

                return (
                  <button
                    key={stg.id}
                    type="button"
                    disabled={isSolicitante}
                    onClick={() => {
                      if (isGestor && status !== stg.id) {
                        setStatus(stg.id);
                      }
                    }}
                    className={`py-2 px-2 rounded-md text-center flex flex-col items-center justify-center transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-black shadow-sm ring-2 ring-primary/20'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                        : 'bg-background text-muted-foreground border border-border hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      {isPassed ? (
                        <Check size={12} className="text-emerald-600 stroke-[3]" />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-background' : 'bg-muted-foreground/30'}`} />
                      )}
                      <span className="text-[11px] sm:text-xs truncate">{stg.label}</span>
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider hidden sm:block w-full truncate px-1 ${
                      isActive ? 'text-primary-foreground/70' : isPassed ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'
                    }`}>
                      {stg.roleAction}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* A BOLA DA VEZ: QUEM AGE AGORA, PRAZO E PRÓXIMA AÇÃO      */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-r from-primary/5 via-primary/5 to-muted/30 border border-primary/15 rounded-lg p-4 sm:p-5">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              
              {/* Esquerda do Banner: Responsável Atual e Prazo */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary text-primary-foreground">
                    A Bola da Vez
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {status === 'TRIAGEM' && 'Gestão de Zeladoria (Triagem e Encaminhamento)'}
                    {status === 'AGENDADO' && `Equipe Técnica (${tecnico || 'Carlos T.'})`}
                    {status === 'EM_EXECUCAO' && `Técnico em Campo (${tecnico || 'Equipe Despachada'})`}
                    {status === 'AGUARDANDO' && `Responsável da Unidade (${order.solicitante})`}
                    {status === 'CONCLUIDO' && 'Chamado Finalizado & Auditado'}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {status === 'TRIAGEM' && 'Avalie o impacto predial, valide a prioridade e despache a equipe técnica adequada.'}
                  {status === 'AGENDADO' && 'Intervenção programada. Equipe aguarda horário para se deslocar à unidade.'}
                  {status === 'EM_EXECUCAO' && 'A equipe está executando os reparos. Ao término, submeta para validação da diretoria.'}
                  {status === 'AGUARDANDO' && 'O técnico finalizou o serviço. A diretoria da unidade deve vistoriar e dar o aceite formal.'}
                  {status === 'CONCLUIDO' && 'Serviço executado e aceito formalmente sem pendências em aberto.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1 text-foreground font-bold">
                    <Clock size={13} className="text-primary" />
                    <span>Prazo SLA: {order.dataLimiteSla ? new Date(order.dataLimiteSla).toLocaleString('pt-BR') : (prazoEstimado || calculateDefaultSla(prioridade))}</span>
                  </span>
                  <span>·</span>
                  {order.slaViolado || (order.dataLimiteSla && new Date(order.dataLimiteSla).getTime() < Date.now() && status !== 'CONCLUIDO' && status !== 'CANCELADO') ? (
                    <span className="text-rose-700 font-bold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                      <AlertTriangle size={12} className="text-rose-600" />
                      SLA Estourado / Não Conforme (Auditoria TCE)
                    </span>
                  ) : status === 'AGUARDANDO' ? (
                    <span className="text-amber-700 font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                      <Hourglass size={12} className="text-amber-600" />
                      Relógio de SLA Congelado ({order.tempoPausaMinutos ? `${order.tempoPausaMinutos} min acumulados` : 'Em pausa'})
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                      SLA no Prazo
                    </span>
                  )}
                </div>
              </div>

              {/* Direita do Banner: Ação Primária Acionável */}
              <div className="shrink-0 flex flex-wrap items-center gap-2">
                {status === 'TRIAGEM' && (
                  <Button
                    type="button"
                    disabled={isAdvancing}
                    onClick={() => handleAdvanceWorkflow(
                      'AGENDADO', 
                      `Triagem concluída por ${user?.nome || 'Mariana Alves'}. Ordem encaminhada para execução com ${tecnico || 'Carlos T.'}.`
                    )}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-md h-10 px-5 shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    {isAdvancing ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        <span>Concluir Triagem & Encaminhar</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </Button>
                )}

                {status === 'AGENDADO' && (
                  <Button
                    type="button"
                    disabled={isAdvancing}
                    onClick={() => handleAdvanceWorkflow(
                      'EM_EXECUCAO', 
                      `Equipe técnica iniciou atendimento e serviços no local da unidade.`
                    )}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-md h-10 px-5 shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    {isAdvancing ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        <Wrench size={15} />
                        <span>Iniciar Atendimento em Campo</span>
                      </>
                    )}
                  </Button>
                )}

                {status === 'EM_EXECUCAO' && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowImpedimentModal(true)}
                      className="border-amber-300 text-amber-800 hover:bg-amber-50 font-bold text-[11px] rounded-md h-9 px-3 cursor-pointer"
                    >
                      <PauseCircle size={15} className="mr-1 text-amber-600" />
                      <span>Falta de Peça</span>
                    </Button>
                    <Button
                      type="button"
                      disabled={isAdvancing}
                      onClick={() => handleAdvanceWorkflow(
                        'AGUARDANDO', 
                        `Reparo finalizado pelo técnico. Aguardando conferência e aceite formal da unidade.`
                      )}
                      className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] rounded-md h-9 px-4 shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      {isAdvancing ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          <span>Finalizar & Enviar p/ Validação</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {status === 'AGUARDANDO' && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAdvanceWorkflow(
                        'EM_EXECUCAO', 
                        `Reparo reprovado na validação da unidade. Reaberto para novos ajustes pelo técnico.`
                      )}
                      className="border-border text-foreground hover:bg-muted font-bold text-[11px] rounded-md h-9 px-3 cursor-pointer"
                    >
                      <RotateCcw size={14} className="mr-1 text-muted-foreground" />
                      <span>Apontar Pendência</span>
                    </Button>
                    <Button
                      type="button"
                      disabled={isAdvancing}
                      onClick={() => handleAdvanceWorkflow(
                        'CONCLUIDO', 
                        `Serviço validado e aceito com sucesso pela diretoria da unidade.`
                      )}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-md h-9 px-4 shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      {isAdvancing ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <>
                          <ThumbsUp size={15} />
                          <span>Confirmar e Dar Aceite Formal</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {status === 'CONCLUIDO' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAdvanceWorkflow(
                      'TRIAGEM', 
                      `Chamado reaberto sob garantia técnica para reavaliação de falha recorrente.`
                    )}
                    className="border-border text-foreground hover:bg-muted font-bold text-[11px] rounded-md h-9 px-4 cursor-pointer"
                  >
                    <RotateCcw size={14} className="mr-1.5 text-muted-foreground" />
                    <span>Reabrir Chamado (Garantia)</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BANNER DE EXCEÇÃO (CASO HAJA IMPEDIMENTO ATIVO)          */}
          {/* ======================================================== */}
          {order.impedimento?.ativo && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      Atendimento Pausado por Impedimento
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium">({order.impedimento.data})</span>
                  </div>
                  <p className="text-xs text-amber-800 font-medium mt-0.5">
                    {order.impedimento.motivo} — O SLA de atendimento técnico permanece congelado.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleResolveImpediment}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl h-9 px-4 shrink-0 shadow-xs cursor-pointer"
              >
                Retomar Atendimento
              </Button>
            </div>
          )}

          {/* ======================================================== */}
          {/* CORPO EM 2 COLUNAS: ESQUERDA (OCORRÊNCIA) / DIR (GESTÃO) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* --- COLUNA 1: OCORRÊNCIA E EVIDÊNCIAS --- */}
            <div className="bg-background border border-border/70 rounded-2xl shadow-xs flex flex-col overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-border/50 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText size={15} className="text-primary" />
                  Ocorrência e Local
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">Relato Original</span>
              </div>

              <div className="p-5 sm:p-6 space-y-7">
                
                {/* Unidade e Local */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Unidade Pública Atendida
                  </span>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-foreground">{predio}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <MapPin size={13} />
                    <span>{localizacao}</span>
                  </div>
                </div>

                {/* Descrição do Problema */}
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Descrição da Falta / Defeito
                  </label>
                  {isSolicitante ? (
                    <p className="text-xs font-medium text-foreground leading-relaxed">
                      {descricao || 'Nenhuma observação detalhada informada pelo solicitante.'}
                    </p>
                  ) : (
                    <textarea
                      rows={5}
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Instruções de manutenção, pontos de risco ou observações do chamado..."
                      className="w-full min-h-[120px] p-4 bg-muted/20 border border-border/50 rounded-xl text-xs font-medium text-foreground focus:bg-background focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all resize-none shadow-sm leading-relaxed"
                    />
                  )}
                </div>

                {/* Solicitante Oficial */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Solicitante Oficial
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-[11px] font-bold border border-border/50 shadow-sm">
                      {order.solicitante.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-foreground">{order.solicitante}</span>
                    <span className="text-[9px] font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md ml-auto">
                      Equipamento Público
                    </span>
                  </div>
                </div>

                {/* Evidências Fotográficas */}
                <div className="pt-5 border-t border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Camera size={13} />
                      Evidências Fotográficas
                    </span>
                    <span className="text-[10px] font-bold text-primary cursor-pointer hover:underline">
                      + Adicionar Foto
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="aspect-4/3 rounded-xl bg-muted/40 border border-dashed border-border flex flex-col items-center justify-center p-2 text-center text-muted-foreground hover:bg-muted/60 transition-colors cursor-pointer group">
                      <Camera size={18} className="text-muted-foreground group-hover:text-primary mb-1" />
                      <span className="text-[10px] font-bold">Foto do Local</span>
                    </div>
                    <div className="aspect-4/3 rounded-xl bg-muted border border-border p-2 flex flex-col justify-end text-[10px] font-bold text-muted-foreground relative overflow-hidden bg-cover bg-center shadow-sm" style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
                      <span className="text-white relative z-10">Antes do Reparo</span>
                    </div>
                    <div className="aspect-4/3 rounded-xl bg-muted/20 border border-dashed border-border flex flex-col items-center justify-center p-2 text-center text-muted-foreground">
                      <span className="text-[10px] font-medium">Após Conclusão</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* --- COLUNA 2: GESTÃO OPERACIONAL E DESPACHO --- */}
            <div className="bg-background border border-border/70 rounded-2xl shadow-xs flex flex-col overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-border/50 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Wrench size={15} className="text-primary" />
                  Gestão & Despacho
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">Atribuições</span>
              </div>

              <div className="p-5 sm:p-6 space-y-7">
                
                {/* Bloco Unificado: Classificação de Prioridade & Apoio à Triagem Urbi */}
                <div>
                  <UrbiTriageCard
                    order={order}
                    currentPriority={prioridade}
                    isSolicitante={isSolicitante}
                    onChangePriority={(pri, justification) => {
                      if (pri === prioridade) return;
                      
                      const prevPri = prioridade;
                      setPrioridade(pri);
                      setPrazoEstimado(calculateDefaultSla(pri));
                      const actor = user?.nome || 'Mariana Alves';
                      const suggestedPri = analyzeTriageUrbi(order).suggestedPriority;
                      const isSuggested = pri === suggestedPri;
                      const desc = justification
                        ? `Prioridade reclassificada de ${prevPri} para ${pri} por ${actor}. Justificativa técnica: "${justification}".`
                        : isSuggested
                        ? `Triagem confirmada: Prioridade ${pri} aplicada com base na recomendação do Urbi IA por ${actor}.`
                        : `Prioridade ajustada de ${prevPri} para ${pri} por ${actor}.`;
                      const auditItem: HistoricoItem = {
                        data: getCurrentTimeString(),
                        descricao: desc,
                        autor: `${actor} (Gestão)`,
                        tipo: 'STATUS',
                      };
                      setHistorico((prev) => [auditItem, ...prev]);
                    }}
                  />
                </div>

                {/* Técnico Responsável */}
                <div className="pt-5 border-t border-border/50">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Técnico / Equipe Designada
                  </label>
                  {isSolicitante ? (
                    <div className="text-xs font-bold text-foreground">
                      {tecnico || 'Aguardando escala pela prefeitura'}
                    </div>
                  ) : (
                    <select
                      value={tecnico}
                      onChange={(e) => setTecnico(e.target.value)}
                      className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                    >
                      <option value="">Pendente de Atribuição</option>
                      {Array.from(new Set([...TECNICOS, tecnico].filter(Boolean))).map((t) => (
                        <option key={t} value={t}>{t} (Manutenção Predial)</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Vínculo formal de Ordem de Serviço */}
                <div className="pt-5 border-t border-border/50 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                      OS Vinculada
                    </span>
                    <span className="font-mono font-extrabold text-primary text-[11px]">{displayOsCode}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPrintModal(true)}
                    className="text-[10px] font-bold text-muted-foreground hover:text-primary h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer bg-muted/30 hover:bg-muted/60"
                  >
                    <Printer size={13} />
                    <span>Visualizar OS</span>
                  </Button>
                </div>

              </div>
            </div>

          </div>

            </div>
          )}

          {/* TAB 2: AUDITORIA E HISTÓRICO */}
          {activeTab === 'historico' && (
            <div className="flex flex-col flex-1 bg-background animate-in fade-in duration-200">
              
              {/* Event Stream (Scrollável) */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar relative">
                <div className="space-y-4 border-l-2 border-border pl-5 ml-1">
                  {historico.map((h, i) => {
                    const isSystem = h.tipo === 'SISTEMA' || h.tipo === 'STATUS';
                    const isExcecao = h.tipo === 'EXCECAO';

                    if (isSystem) {
                      return (
                        <div key={i} className="relative group flex items-start">
                          <div className="absolute -left-[23px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 ring-4 ring-background" />
                          <div className="text-[11px] text-muted-foreground leading-tight">
                            {h.descricao}{' '}
                            <span className="text-slate-400 font-medium">· {h.data}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={i} className="relative group">
                        <div className={`absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-sm ring-4 ring-background ${
                          isExcecao ? 'bg-amber-500' : 'bg-slate-700'
                        }`} />

                        <div className="flex flex-col text-[11px] mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-foreground">{h.autor}</span>
                            {isExcecao && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded-sm">
                                Alerta
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">{h.data}</span>
                        </div>

                        <p className={`text-xs p-3 rounded-lg border leading-relaxed ${
                          isExcecao
                            ? 'bg-amber-50/70 border-amber-200 text-amber-950 font-semibold'
                            : 'bg-white border-border text-foreground shadow-sm'
                        }`}>
                          {h.descricao}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Input de Novo Apontamento */}
              <div className="p-5 sm:px-6 bg-muted/20 border-t border-border">
                {commentSuccess && (
                  <div className="mb-3 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 flex items-center gap-1.5 animate-in fade-in">
                    <Check size={14} />
                    <span>Apontamento gravado com sucesso!</span>
                  </div>
                )}
                <form onSubmit={handleAddComment} className="flex gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      rows={2}
                      placeholder={isSolicitante ? 'Observação sobre o local ou atendimento...' : 'Nota técnica, laudo ou observação operacional...'}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-sm font-medium"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!newComment.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 px-6 text-xs font-bold shadow-sm cursor-pointer shrink-0 mt-auto"
                  >
                    <Send size={14} className="mr-2" />
                    Registrar
                  </Button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* RODAPÉ COM AÇÕES CLARAS (SEM CONFUSÃO DE SALVAMENTO)     */}
        {/* ======================================================== */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/80 shrink-0">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 shadow-sm animate-in fade-in">
                <AlertCircle size={13} />
                <span className="text-[11px]">Existem alterações pendentes</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-muted-foreground font-medium animate-in fade-in">
                <CheckCircle2 size={12} className="text-primary/60" />
                <span className="text-[10px]"><strong>NBR 5674:</strong> Alterações operacionais geram registro auditável.</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-md border-border text-foreground text-xs font-bold px-4 h-9 cursor-pointer"
            >
              {isDirty ? 'Descartar alterações' : 'Fechar'}
            </Button>

            {isGestor && (
              <Button
                onClick={handleSaveGeneralChanges}
                disabled={isSaving || !isDirty}
                className={`rounded-xl font-bold text-xs h-9 px-5 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isDirty
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL DE IMPEDIMENTO (FALTA DE MATERIAL / PEÇA)          */}
      {/* ======================================================== */}
      {showImpedimentModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-2xs">
          <div className="bg-background rounded-xl p-6 max-w-md w-full border border-border shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <PauseCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Sinalizar Impedimento Operacional</h3>
                <p className="text-xs text-muted-foreground">Pausa temporária de atendimento com justificativa</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted-foreground">Motivo do Impedimento:</label>
              <select
                value={impedimentMotivo}
                onChange={(e) => setImpedimentMotivo(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground"
              >
                <option value="Falta de material / peça de reposição">Falta de material / peça no almoxarifado</option>
                <option value="Prédio público fechado / sem chaveiro">Prédio público fechado / sem acesso às instalações</option>
                <option value="Condições climáticas desfavoráveis (Chuva)">Condições climáticas desfavoráveis para telhado/elétrica externa</option>
                <option value="Aguardando laudo estrutural especializado">Aguardando laudo técnico especializado</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowImpedimentModal(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button 
                size="sm" 
                onClick={handleApplyImpediment}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl"
              >
                Confirmar Pausa
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO SEGURA                  */}
      {/* ======================================================== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-2xs">
          <div className="bg-background rounded-xl p-6 max-w-md w-full border border-border shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Excluir Registro Oficial?</h3>
                <p className="text-xs text-muted-foreground">Atenção às regras de auditoria pública</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Deseja realmente remover o chamado <strong>{order.id}</strong> ({order.titulo})? 
              Essa ação cancela os agendamentos técnicos e remove o histórico da esteira.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl text-xs"
              >
                Voltar
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  onDelete(order.id);
                  onClose();
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
              >
                Sim, Cancelar e Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE PRÉVIA DE IMPRESSÃO A4                          */}
      {/* ======================================================== */}
      {showPrintModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-xs">
          <div className="bg-background rounded-xl p-6 max-w-2xl w-full border border-border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-primary" />
                <span className="font-bold text-foreground text-sm">Dossiê da Ordem de Serviço A4</span>
              </div>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 bg-muted/30 border border-border rounded-lg space-y-4 font-mono text-xs text-foreground">
              <div className="text-center pb-3 border-b border-border">
                <span className="font-black text-sm block">PREFEITURA MUNICIPAL — ZELADORIA PREDIAL</span>
                <span className="text-[10px] text-muted-foreground">Dossiê Técnico Conforme ABNT NBR 5674</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground text-[10px] block">CÓDIGO DA ORDEM:</span>
                  <span className="font-bold">{displayOsCode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">DATA DE EMISSÃO:</span>
                  <span className="font-bold">{order.dataAbertura}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">UNIDADE PÚBLICA:</span>
                  <span className="font-bold">{predio}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">PRIORIDADE / SLA:</span>
                  <span className="font-bold">{prioridade} ({prazoEstimado})</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground text-[10px] block">DESCRIÇÃO DA INTERVENÇÃO:</span>
                <p className="mt-1 font-sans text-xs bg-background p-2.5 rounded border border-border">
                  {titulo}: {descricao || 'Reparo e manutenção técnica de infraestrutura.'}
                </p>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-6 text-center">
                <div className="border-t border-border pt-2">
                  <span className="block text-[10px] font-bold">ASSINATURA DO TÉCNICO</span>
                  <span className="text-[10px] text-muted-foreground">{tecnico || 'Técnico Responsável'}</span>
                </div>
                <div className="border-t border-border pt-2">
                  <span className="block text-[10px] font-bold">ACEITE DA UNIDADE PÚBLICA</span>
                  <span className="text-[10px] text-muted-foreground">{order.solicitante}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPrintModal(false)}
                className="rounded-xl"
              >
                Fechar
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  window.print();
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Imprimir Documento</span>
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
