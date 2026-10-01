'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Search, 
  Plus, 
  X, 
  ChevronRight, 
  ArrowUpDown, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  User, 
  LayoutList, 
  Columns,
  Clock,
  Calendar,
  Users,
  Flag,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { Sidebar } from '@/components/sidebar';
import { useOrders } from '@/context/orders-context';
import { PREDIOS, TECNICOS, type OrdemServico, type Prioridade, type StatusOS } from '../kanban/data';
import { NewOrderModal } from '../kanban/new-order-modal';
import { OrderDetailModal } from '../kanban/order-detail-modal';
import { TopHeader } from '@/components/top-header';
import { ChamadosTableSkeleton, ChamadosGridSkeleton } from '@/components/skeletons';

type SortField = 'dataAbertura' | 'prioridade' | 'status' | 'predio' | 'titulo';
type SortOrder = 'asc' | 'desc';

// Droppable Column Component
function KanbanColumnDroppable({
  colId,
  title,
  subtitle,
  count,
  isCollapsed = false,
  onToggleCollapse,
  children,
}: {
  colId: StatusOS;
  title: string;
  subtitle: string;
  count: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: colId });

  if (isCollapsed) {
    return (
      <div
        ref={setNodeRef}
        onClick={onToggleCollapse}
        title={`Expandir coluna "${title}" (${count} chamados)`}
        className={`w-14 rounded-2xl p-3 border border-border bg-card/70 hover:bg-card transition-all min-h-[460px] flex flex-col items-center justify-between cursor-pointer group shadow-2xs ${
          isOver ? 'bg-muted ring-2 ring-primary/30' : ''
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-muted text-foreground text-xs font-bold flex items-center justify-center">
            {count}
          </span>
          <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        <span className="[writing-mode:vertical-lr] rotate-180 text-xs font-bold text-muted-foreground group-hover:text-foreground tracking-wider uppercase py-4">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground font-bold">Vazio</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 rounded-xl transition-all p-2.5 min-h-[480px] flex flex-col flex-1 ${
        isOver ? 'bg-muted/80 ring-2 ring-primary/30' : 'bg-muted/40 border border-transparent'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-1 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">
              {title}
            </h2>
            <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              {count}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {title === 'Triagem' ? 'Novos chamados' : subtitle}
          </p>
        </div>
        {onToggleCollapse && count === 0 && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Recolher coluna vazia"
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-lg hover:bg-muted transition-colors"
          >
            Recolher
          </button>
        )}
      </div>

      {/* Cards inside column */}
      <div className="space-y-3 flex-1 min-h-[300px] flex flex-col">
        {children}
      </div>
    </div>
  );
}

// Sortable Kanban Card Component
function SortableKanbanCard({
  order,
  colId,
  onSelect,
  onMove,
}: {
  order: OrdemServico;
  colId: StatusOS;
  onSelect: (order: OrdemServico) => void;
  onMove?: (orderId: string, targetStatus: StatusOS) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isUrgente = order.prioridade === 'URGENTE';
  const isAlta = order.prioridade === 'ALTA';
  const cleanId = order.id.replace(/^(os-|OS-)/i, '');

  // Next status in continuous journey:
  // Triagem -> Planejamento (AGENDADO) -> Em Execução -> Aguardando Validação -> Concluído
  const nextStage: StatusOS | null = 
    colId === 'TRIAGEM' ? 'AGENDADO' :
    colId === 'AGENDADO' ? 'EM_EXECUCAO' :
    colId === 'EM_EXECUCAO' ? 'AGUARDANDO' :
    colId === 'AGUARDANDO' ? 'CONCLUIDO' : null;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-36 rounded-2xl border-2 border-dashed border-primary/30 bg-input/80"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(order)}
      className="bg-card border border-border rounded-lg shadow-sm p-4 hover:border-primary/40 hover:shadow-md cursor-grab active:cursor-grabbing transition-all flex flex-col justify-between group select-none touch-none"
    >
      <div>
        {/* Header row: Tag and Code */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5 flex-wrap pr-2">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md ${
              isUrgente 
                ? 'bg-destructive/10 text-destructive' 
                : isAlta 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {isUrgente ? <AlertTriangle size={11} className="shrink-0" /> : <Flag size={11} className="shrink-0" />}
              {isUrgente ? 'Urgente' : isAlta ? 'Alta' : 'Média'}
            </span>
            
            {order.impedimento?.ativo && (
              <span title={order.impedimento.motivo} className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 uppercase tracking-wider">
                <AlertTriangle size={10} className="shrink-0" />
                Pausado
              </span>
            )}
          </div>

          <span className="text-xs font-mono text-muted-foreground mt-0.5">
            #{cleanId}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-foreground leading-snug">
          {order.titulo}
        </h3>

        {/* Unit */}
        <p className="text-[11px] font-semibold text-muted-foreground mt-1 mb-2">
          {order.predio}
        </p>

        {/* Description */}
        {order.descricao && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {order.descricao}
          </p>
        )}

        {/* Metadata Rows */}
        <div className="mt-4 pt-3 border-t border-border space-y-1.5 text-[11px] font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users size={13} className="text-muted-foreground shrink-0" />
            <span className="truncate">
              {order.tecnico 
                ? order.tecnico 
                : order.status === 'EM_EXECUCAO'
                ? 'Equipe Operacional Civil'
                : 'Equipe a definir'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-muted-foreground shrink-0" />
            <span>Aberto: {order.dataAbertura} · Prazo: Hoje até 18:00</span>
          </div>
        </div>
      </div>

      {/* Próximo Passo Row across all Kanban stages */}
      <div 
        onClick={(e) => {
          if (nextStage && onMove) {
            e.stopPropagation();
            if (nextStage === 'EM_EXECUCAO' && !order.tecnico) {
              onSelect(order);
              return;
            }
            onMove(order.id, nextStage);
          }
        }}
        className="mt-3 pt-2.5 border-t border-border flex items-center justify-between cursor-pointer hover:bg-muted/50 -mx-1 px-1 py-1 rounded-lg transition-colors group/step"
      >
        <span className="text-xs font-semibold text-foreground group-hover/step:underline">
          {colId === 'TRIAGEM' && 'Triar chamado'}
          {colId === 'AGENDADO' && (order.tecnico ? 'Iniciar execução' : 'Definir equipe')}
          {colId === 'EM_EXECUCAO' && 'Registrar execução'}
          {colId === 'AGUARDANDO' && 'Validar conclusão'}
          {colId === 'CONCLUIDO' && 'Ver histórico'}
        </span>
        <ArrowRight size={13} className="text-foreground transition-transform group-hover/step:translate-x-0.5" />
      </div>
    </div>
  );
}

export default function ChamadosPage() {
  return (
    <Suspense fallback={<div className="flex h-screen bg-background items-center justify-center text-sm font-semibold text-muted-foreground">Carregando chamados...</div>}>
      <ChamadosContent />
    </Suspense>
  );
}

function ChamadosContent() {
  const searchParams = useSearchParams();
  const { 
    orders, 
    setOrders,
    isLoadingData, 
    addOrder, 
    updateOrder, 
    deleteOrder, 
    stats 
  } = useOrders();

  // Search & Filter State initialized from query params if present
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ATIVOS');
  const [priorityFilter, setPriorityFilter] = useState<string>('TODAS');
  const [unitFilter, setUnitFilter] = useState<string>('TODAS');
  const [techFilter, setTechFilter] = useState<string>('TODOS');

  // Read URL params when mounted or changed
  useEffect(() => {
    const qEtapa = searchParams.get('etapa') || searchParams.get('status');
    const qPrioridade = searchParams.get('prioridade');
    const qUnidade = searchParams.get('unidade');
    const qView = searchParams.get('view');

    if (qEtapa) setStageFilter(qEtapa);
    if (qPrioridade) setPriorityFilter(qPrioridade);
    if (qUnidade) setUnitFilter(qUnidade);
    if (qView === 'lista' || qView === 'quadro') setViewMode(qView);
  }, [searchParams]);

  // Contextual origin detection (e.g. ?from=relatorios)
  const fromParam = searchParams.get('from');

  const breadcrumbs = useMemo(() => {
    const items: { label: string; href?: string }[] = [{ label: 'Gestão municipal', href: '/' }];
    if (fromParam === 'relatorios' || fromParam === '/relatorios') {
      items.push({ label: 'Relatórios e Indicadores', href: '/relatorios' });
    } else if (fromParam === 'agenda' || fromParam === '/agenda') {
      items.push({ label: 'Agenda', href: '/agenda' });
    } else if (fromParam === 'unidades' || fromParam === '/unidades') {
      items.push({ label: 'Unidades', href: '/unidades' });
    } else if (fromParam === 'hoje' || fromParam === '/') {
      items.push({ label: 'Hoje', href: '/' });
    }
    items.push({ label: 'Chamados' });
    return items;
  }, [fromParam]);

  const backHref = useMemo(() => {
    if (!fromParam) return undefined;
    if (fromParam === 'relatorios' || fromParam === '/relatorios') return '/relatorios';
    if (fromParam === 'agenda' || fromParam === '/agenda') return '/agenda';
    if (fromParam === 'unidades' || fromParam === '/unidades') return '/unidades';
    if (fromParam === 'hoje' || fromParam === '/') return '/';
    return fromParam.startsWith('/') ? fromParam : undefined;
  }, [fromParam]);

  // View & Sort State ('quadro' matches image 2)
  const [viewMode, setViewMode] = useState<'quadro' | 'lista'>('quadro');
  const [sortField, setSortField] = useState<SortField>('dataAbertura');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Drag and Drop active order state
  const [activeOrder, setActiveOrder] = useState<OrdemServico | null>(null);

  // Modals & Feedback
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrdemServico | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (stageFilter !== 'ATIVOS') count++;
    if (priorityFilter !== 'TODAS') count++;
    if (unitFilter !== 'TODAS') count++;
    if (techFilter !== 'TODOS') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [stageFilter, priorityFilter, unitFilter, techFilter, searchQuery]);

  function handleResetFilters() {
    setSearchQuery('');
    setStageFilter('ATIVOS');
    setPriorityFilter('TODAS');
    setUnitFilter('TODAS');
    setTechFilter('TODOS');
  }

  // Priority weight for sorting
  const priorityWeight: Record<Prioridade, number> = {
    URGENTE: 4,
    ALTA: 3,
    MEDIA: 2,
    BAIXA: 1,
  };

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            order.titulo.toLowerCase().includes(q) ||
            order.predio.toLowerCase().includes(q) ||
            order.id.toLowerCase().includes(q) ||
            (order.descricao && order.descricao.toLowerCase().includes(q)) ||
            (order.tecnico && order.tecnico.toLowerCase().includes(q)) ||
            (order.solicitante && order.solicitante.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Stage (Etapa)
        if (stageFilter === 'ATIVOS') {
          if (order.status === 'CONCLUIDO') return false;
        } else if (stageFilter === 'TRIAGEM') {
          if (order.status !== 'TRIAGEM') return false;
        } else if (stageFilter === 'AGENDADO') {
          if (order.status !== 'AGENDADO') return false;
        } else if (stageFilter === 'EM_EXECUCAO') {
          if (order.status !== 'EM_EXECUCAO') return false;
        } else if (stageFilter === 'AGUARDANDO') {
          if (order.status !== 'AGUARDANDO') return false;
        } else if (stageFilter === 'CONCLUIDO') {
          if (order.status !== 'CONCLUIDO') return false;
        }

        // Priority
        if (priorityFilter !== 'TODAS' && order.prioridade !== priorityFilter) {
          return false;
        }

        // Unit
        if (unitFilter !== 'TODAS' && order.predio !== unitFilter) {
          return false;
        }

        // Tech
        if (techFilter === 'SEM_TECNICO' && order.tecnico) return false;
        if (techFilter === 'COM_TECNICO' && !order.tecnico) return false;
        if (techFilter !== 'TODOS' && techFilter !== 'SEM_TECNICO' && techFilter !== 'COM_TECNICO') {
          if (order.tecnico !== techFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'prioridade') {
          cmp = priorityWeight[b.prioridade] - priorityWeight[a.prioridade];
        } else if (sortField === 'status') {
          cmp = a.status.localeCompare(b.status);
        } else if (sortField === 'predio') {
          cmp = a.predio.localeCompare(b.predio);
        } else if (sortField === 'titulo') {
          cmp = a.titulo.localeCompare(b.titulo);
        } else {
          cmp = b.id.localeCompare(a.id);
        }
        return sortOrder === 'asc' ? -cmp : cmp;
      });
  }, [orders, searchQuery, stageFilter, priorityFilter, unitFilter, techFilter, sortField, sortOrder]);

  function handleToggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }

  // Kanban Columns configuration
  const kanbanColumns = useMemo(() => {
    const cols = [
      {
        id: 'TRIAGEM' as StatusOS,
        title: 'Triagem',
        subtitle: 'Avaliar e encaminhar',
        orders: filteredOrders.filter((o) => o.status === 'TRIAGEM'),
      },
      {
        id: 'AGENDADO' as StatusOS,
        title: 'Agendado',
        subtitle: 'Intervenções planejadas',
        orders: filteredOrders.filter((o) => o.status === 'AGENDADO'),
      },
      {
        id: 'EM_EXECUCAO' as StatusOS,
        title: 'Em execução',
        subtitle: 'Equipes em campo',
        orders: filteredOrders.filter((o) => o.status === 'EM_EXECUCAO'),
      },
      {
        id: 'AGUARDANDO' as StatusOS,
        title: 'Aguardando validação',
        subtitle: 'Validar com a unidade',
        orders: filteredOrders.filter((o) => o.status === 'AGUARDANDO'),
      },
    ];

    // Ocultar coluna Concluído quando filtro é ATIVOS para evitar a confusão "Concluído 0"
    if (stageFilter !== 'ATIVOS') {
      cols.push({
        id: 'CONCLUIDO' as StatusOS,
        title: 'Concluído',
        subtitle: 'Serviços finalizados',
        orders: filteredOrders.filter((o) => o.status === 'CONCLUIDO'),
      });
    }

    return cols;
  }, [filteredOrders, stageFilter]);

  // Drag and Drop handlers
  function handleDragStart(event: DragStartEvent) {
    const order = orders.find((o) => o.id === event.active.id);
    if (order) setActiveOrder(order);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeOrder = orders.find((o) => o.id === activeId);
    if (!activeOrder) return;

    const isOverColumn = kanbanColumns.some((c) => c.id === overId);
    const overOrder = orders.find((o) => o.id === overId);
    const newStatus: StatusOS | undefined = isOverColumn
      ? (overId as StatusOS)
      : overOrder?.status;

    if (newStatus && activeOrder.status !== newStatus) {
      setOrders((prev) =>
        prev.map((o) => (o.id === activeId ? { ...o, status: newStatus } : o))
      );
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const activeId = active?.id as string;
    const currentOrder = orders.find((o) => o.id === activeId);

    if (active && over) {
      const overId = over.id as string;
      const isOverColumn = kanbanColumns.some((c) => c.id === overId);
      const overOrder = orders.find((o) => o.id === overId);
      const targetStatus: StatusOS | undefined = isOverColumn 
        ? (overId as StatusOS) 
        : (overOrder?.status ?? currentOrder?.status);

      if (targetStatus && currentOrder) {
        // Regra de Integridade: Não permitir mover para EM_EXECUCAO sem equipe definida
        if (targetStatus === 'EM_EXECUCAO' && !currentOrder.tecnico) {
          showToast('Defina uma equipe técnica antes de iniciar a execução em campo.');
          setSelectedOrder(currentOrder);
          setActiveOrder(null);
          return;
        }

        if (targetStatus === 'CONCLUIDO' && stageFilter === 'ATIVOS') {
          setStageFilter('TODOS');
        }

        const updated = { ...currentOrder, status: targetStatus };
        setOrders((prev) => prev.map((o) => (o.id === activeId ? updated : o)));
        updateOrder(updated);
        const col = kanbanColumns.find((c) => c.id === targetStatus);
        const cleanId = activeId.replace(/^(os-|OS-)/i, '');
        showToast(`Chamado #${cleanId} posicionado em "${col?.title || targetStatus}"`);
      }
    } else if (currentOrder && activeOrder && currentOrder.status !== activeOrder.status) {
      if (currentOrder.status === 'EM_EXECUCAO' && !currentOrder.tecnico) {
        showToast('Defina uma equipe técnica antes de iniciar a execução em campo.');
        setSelectedOrder(currentOrder);
      } else {
        updateOrder(currentOrder);
        const col = kanbanColumns.find((c) => c.id === currentOrder.status);
        const cleanId = activeId.replace(/^(os-|OS-)/i, '');
        showToast(`Chamado #${cleanId} posicionado em "${col?.title || currentOrder.status}"`);
      }
    }

    setActiveOrder(null);
  }

  function handleQuickMove(orderId: string, targetStatus: StatusOS) {
    const currentOrder = orders.find((o) => o.id === orderId);
    if (!currentOrder) return;

    // Regra de Integridade: Não permitir mover para EM_EXECUCAO sem equipe definida
    if (targetStatus === 'EM_EXECUCAO' && !currentOrder.tecnico) {
      showToast('Defina a equipe responsável antes de avançar para execução.');
      setSelectedOrder(currentOrder);
      return;
    }

    if (targetStatus === 'CONCLUIDO' && stageFilter === 'ATIVOS') {
      setStageFilter('TODOS');
    }

    const updated = { ...currentOrder, status: targetStatus };
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    updateOrder(updated);
    const col = kanbanColumns.find((c) => c.id === targetStatus);
    const cleanId = orderId.replace(/^(os-|OS-)/i, '');
    showToast(`Chamado #${cleanId} avançado para "${col?.title || targetStatus}"`);
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* Toast */}
      <Toast message={toastMessage} />

      {/* Sidebar */}
      <Sidebar currentRoute="/chamados" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header Global */}
        <TopHeader 
          titleOverride="Chamados"
          breadcrumbs={breadcrumbs}
          showBackButton={!!fromParam}
          backHref={backHref}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectOrder={setSelectedOrder}
        />

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* CABEÇALHO DA PÁGINA (Padrão Ouro UI/UX) */}
          <div className="bg-muted/50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Chamados
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Da triagem à solução, acompanhe cada etapa do atendimento.
              </p>
            </div>
            <div className="flex items-center shrink-0">
              <Button 
                onClick={() => setIsNewModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-2 font-semibold text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo chamado
              </Button>
            </div>
          </div>

          {/* Banner de navegação contextual quando o usuário veio de Relatórios ou outra tela */}
          {fromParam === 'relatorios' && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">
                    Navegando a partir de <strong>Relatórios e Indicadores</strong>.
                  </span>
                  {stageFilter !== 'ATIVOS' && stageFilter !== 'TODOS' && (
                    <span className="text-muted-foreground ml-1.5">
                      (Filtro ativo: <strong>{stageFilter === 'EM_EXECUCAO' ? 'Em execução (Em campo)' : stageFilter === 'TRIAGEM' ? 'Triagem' : stageFilter === 'AGUARDANDO' ? 'Aguardando validação' : stageFilter}</strong>)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {stageFilter !== 'ATIVOS' && (
                  <button
                    type="button"
                    onClick={() => setStageFilter('ATIVOS')}
                    className="px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors cursor-pointer"
                  >
                    Exibir todo o quadro
                  </button>
                )}
                <Link
                  href="/relatorios"
                  className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ArrowLeft size={13} />
                  <span>Voltar para Relatórios</span>
                </Link>
              </div>
            </div>
          )}

          {/* Subtitle Stats & View Switcher (Image 2) */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-sm font-medium text-foreground">
              <span>{stats.totalOpen} ativos</span>
              <span className="mx-2 text-muted-foreground">·</span>
              <span className="text-destructive font-semibold">{stats.urgentes} urgentes ativos</span>
              <span className="mx-2 text-muted-foreground">·</span>
              <span className="text-muted-foreground">{stats.concluidos} concluídos</span>
            </div>

            {/* Segmented View Switcher: Lista / Quadro */}
            <div className="bg-muted p-1 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('lista')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'lista'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutList size={15} />
                <span>Lista</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('quadro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'quadro'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Columns size={15} />
                <span>Quadro</span>
              </button>
            </div>
          </div>

          {/* Filters Row (Image 2) */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Buscar chamado */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Buscar chamado
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Título, unidade ou código"
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Etapa */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Etapa
                </label>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer shadow-sm"
                >
                  <option value="ATIVOS">Ativos</option>
                  <option value="TODOS">Todas as etapas</option>
                  <option value="TRIAGEM">Triagem</option>
                  <option value="AGENDADO">Agendado</option>
                  <option value="EM_EXECUCAO">Em execução</option>
                  <option value="AGUARDANDO">Aguardando validação</option>
                  <option value="CONCLUIDO">Concluído</option>
                </select>
              </div>

              {/* 3. Unidade */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Unidade
                </label>
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer shadow-sm"
                >
                  <option value="TODAS">Todas as unidades</option>
                  {PREDIOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* 4. Prioridade */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Prioridade
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer shadow-sm"
                >
                  <option value="TODAS">Todas</option>
                  <option value="URGENTE">Urgente</option>
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Média</option>
                  <option value="BAIXA">Baixa</option>
                </select>
              </div>
            </div>

            {/* Filter count & reset link */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs">
              <span className="text-muted-foreground">
                {filteredOrders.length} de {orders.length} chamados {stageFilter === 'ATIVOS' && '· somente ativos'}
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* Banner informativo quando filtro Ativos oculta coluna Concluído */}
          {stageFilter === 'ATIVOS' && viewMode === 'quadro' && (
            <div className="bg-muted/30 border border-border rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>
                  Coluna <strong>Concluído</strong> está oculta pelo filtro <strong>Ativos</strong> ({stats.concluidos} chamados finalizados).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStageFilter('TODOS')}
                className="text-primary hover:underline font-bold text-xs cursor-pointer"
              >
                Exibir concluídos no quadro
              </button>
            </div>
          )}

          {/* MAIN VIEW: QUADRO (KANBAN) OR LISTA */}
          {isLoadingData ? (
            viewMode === 'quadro' ? (
              <ChamadosGridSkeleton />
            ) : (
              <ChamadosTableSkeleton />
            )
          ) : viewMode === 'quadro' ? (
            /* QUADRO (KANBAN) VIEW - WITH FULL DND-KIT DRAG & DROP */
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className={`grid gap-5 items-start ${
                kanbanColumns.length === 4
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
                  : kanbanColumns.length === 5
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                  : kanbanColumns.length === 3
                  ? 'grid-cols-1 md:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
              }`}>
                {kanbanColumns.map((col) => (
                  <KanbanColumnDroppable
                    key={col.id}
                    colId={col.id}
                    title={col.title}
                    subtitle={col.subtitle}
                    count={col.orders.length}
                  >
                    <SortableContext
                      items={col.orders.map((o) => o.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {col.orders.length === 0 ? (
                        <div className="p-6 text-center text-xs font-medium text-muted-foreground/70 min-h-[160px] flex items-center justify-center flex-1">
                          Nenhum chamado nesta etapa
                        </div>
                      ) : (
                        col.orders.map((order) => (
                          <SortableKanbanCard
                            key={order.id}
                            order={order}
                            colId={col.id}
                            onSelect={(ord) => setSelectedOrder(ord)}
                            onMove={handleQuickMove}
                          />
                        ))
                      )}
                    </SortableContext>
                  </KanbanColumnDroppable>
                ))}
              </div>

              {/* Drag Overlay for smooth card movement preview */}
              <DragOverlay>
                {activeOrder ? (
                  <div className="bg-background rounded-2xl p-4 border-2 border-primary shadow-2xl rotate-2 scale-105 opacity-95 flex flex-col justify-between w-[280px] pointer-events-none">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          activeOrder.prioridade === 'URGENTE' 
                            ? 'bg-destructive/10 text-destructive' 
                            : activeOrder.prioridade === 'ALTA'
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {activeOrder.prioridade === 'URGENTE' ? <AlertTriangle size={13} /> : <Flag size={13} />}
                          {activeOrder.prioridade === 'URGENTE' ? 'Urgente' : activeOrder.prioridade === 'ALTA' ? 'Alta' : 'Média'}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          #{activeOrder.id.replace(/^(os-|OS-)/i, '')}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground line-clamp-2">{activeOrder.titulo}</h3>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">{activeOrder.predio}</p>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            /* LISTA VIEW */
            <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted border-b border-border text-[10px] font-bold text-foreground/80 uppercase tracking-wider select-none">
                    <tr>
                      <th 
                        onClick={() => handleToggleSort('dataAbertura')} 
                        className="py-3.5 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Código</span>
                          <ArrowUpDown size={12} className="text-muted-foreground" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleToggleSort('titulo')} 
                        className="py-3.5 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Título</span>
                          <ArrowUpDown size={12} className="text-muted-foreground" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleToggleSort('predio')} 
                        className="py-3.5 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Unidade</span>
                          <ArrowUpDown size={12} className="text-muted-foreground" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleToggleSort('prioridade')} 
                        className="py-3.5 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Prioridade</span>
                          <ArrowUpDown size={12} className="text-muted-foreground" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleToggleSort('status')} 
                        className="py-3.5 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Etapa</span>
                          <ArrowUpDown size={12} className="text-muted-foreground" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4">Responsável</th>
                      <th className="py-3.5 px-4">Prazo</th>
                      <th className="py-3.5 px-4 text-right">Próximo passo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                          <p className="text-sm font-semibold text-foreground">Nenhum chamado encontrado</p>
                          <p className="text-xs text-muted-foreground mt-1">Tente ajustar os filtros ou a busca.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const isUrgente = order.prioridade === 'URGENTE';
                        const isAlta = order.prioridade === 'ALTA';
                        return (
                          <tr 
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="hover:bg-muted/30 cursor-pointer transition-colors group"
                          >
                            <td className="py-4 px-4 font-mono font-bold text-xs text-muted-foreground">
                              #{order.id.replace('os-', '')}
                            </td>
                            <td className="py-4 px-4 font-bold text-xs text-foreground group-hover:text-foreground">
                              {order.titulo}
                            </td>
                            <td className="py-4 px-4 text-xs text-muted-foreground">
                              {order.predio}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-lg ${
                                isUrgente 
                                  ? 'bg-destructive/10 text-destructive' 
                                  : isAlta 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {isUrgente ? 'Urgente' : isAlta ? 'Alta' : 'Média'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs font-medium text-foreground">
                              {order.status === 'TRIAGEM' && 'Triagem'}
                              {order.status === 'AGENDADO' && 'Planejamento'}
                              {order.status === 'EM_EXECUCAO' && 'Em execução'}
                              {order.status === 'CONCLUIDO' && 'Concluído'}
                              {order.status === 'AGUARDANDO' && 'Aguardando validação'}
                            </td>
                            <td className="py-4 px-4 text-xs text-muted-foreground">
                              {order.tecnico || (
                                order.status === 'TRIAGEM' 
                                  ? 'Definir na triagem' 
                                  : order.status === 'AGENDADO' 
                                  ? 'Definir no planejamento' 
                                  : 'Equipe Operacional Civil'
                              )}
                            </td>
                            <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                              <span className="text-muted-foreground">Aberto:</span> <span className="font-semibold text-foreground">{order.dataAbertura}</span> <span className="px-1 text-muted-foreground/30">|</span> <span className="text-muted-foreground">SLA:</span> <span className="font-semibold text-foreground">18:00</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {order.status === 'TRIAGEM' ? (
                                <span className="inline-flex items-center gap-1.5 text-primary hover:bg-primary/10 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer">
                                  <span>Triar chamado</span>
                                  <ArrowRight size={11} />
                                </span>
                              ) : order.status === 'AGENDADO' ? (
                                <span className="inline-flex items-center gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer">
                                  <span>{order.tecnico ? 'Agendar' : 'Definir equipe'}</span>
                                  <ArrowRight size={11} />
                                </span>
                              ) : order.status === 'EM_EXECUCAO' ? (
                                <span className="inline-flex items-center gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer">
                                  <span>Registrar execução</span>
                                  <ArrowRight size={11} />
                                </span>
                              ) : order.status === 'AGUARDANDO' ? (
                                <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors shadow-sm">
                                  <CheckCircle2 size={11} />
                                  <span>Validar serviço</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 hover:bg-muted text-muted-foreground px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer">
                                  <span>Ver histórico</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODALS */}
      <NewOrderModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={(newOrder) => {
          addOrder(newOrder);
          showToast(`Chamado #${newOrder.id.replace(/^(os-|OS-)/i, '')} criado com sucesso!`);
        }}
        onOpenOrder={(ord) => {
          setSelectedOrder(ord);
        }}
        onStartTriage={(ord) => {
          setSelectedOrder(ord);
        }}
      />

      <OrderDetailModal 
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdate={(updated) => {
          updateOrder(updated);
          showToast(`Chamado ${updated.id} atualizado.`);
        }}
        onDelete={(orderId) => {
          deleteOrder(orderId);
          showToast(`Chamado ${orderId} removido.`);
        }}
      />

    </div>
  );
}
