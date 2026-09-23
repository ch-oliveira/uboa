'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { COLUMNS, type OrdemServico, type StatusOS } from './data';
import { KanbanColumnComponent } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { NewOrderModal } from './new-order-modal';
import { OrderDetailModal } from './order-detail-modal';
import { KanbanFilterPopover, type FilterState } from './kanban-filter-popover';
import { 
  LayoutDashboard, 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { useOrders } from '@/context/orders-context';
import { Sidebar } from '@/components/sidebar';
import { KanbanBoardSkeleton } from '@/components/skeletons';

export default function KanbanPage() {
  const { orders, setOrders, addOrder, updateOrder, deleteOrder, isLoadingData } = useOrders();
  const [isMounted, setIsMounted] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrdemServico | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrdemServico | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const [filters, setFilters] = useState<FilterState>({
    prioridade: 'TODAS',
    predio: 'TODOS',
    tecnico: 'TODOS',
  });

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
    if (filters.prioridade !== 'TODAS') count++;
    if (filters.predio !== 'TODOS') count++;
    if (filters.tecnico !== 'TODOS') count++;
    return count;
  }, [filters]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          o.titulo.toLowerCase().includes(q) ||
          o.predio.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          (o.solicitante && o.solicitante.toLowerCase().includes(q)) ||
          (o.tecnico && o.tecnico.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Priority
      if (filters.prioridade !== 'TODAS' && o.prioridade !== filters.prioridade) {
        return false;
      }

      // Building
      if (filters.predio !== 'TODOS' && o.predio !== filters.predio) {
        return false;
      }

      // Technician
      if (filters.tecnico === 'SEM_TECNICO' && o.tecnico) return false;
      if (filters.tecnico === 'COM_TECNICO' && !o.tecnico) return false;
      if (filters.tecnico !== 'TODOS' && filters.tecnico !== 'SEM_TECNICO' && filters.tecnico !== 'COM_TECNICO') {
        if (o.tecnico !== filters.tecnico) return false;
      }

      return true;
    });
  }, [orders, searchQuery, filters]);

  // Quick stats
  const urgentCount = useMemo(() => orders.filter(o => o.prioridade === 'URGENTE').length, [orders]);
  const inFieldCount = useMemo(() => orders.filter(o => o.status === 'EM_EXECUCAO').length, [orders]);

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

    const isOverColumn = COLUMNS.some((c) => c.id === overId);
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
      const isOverColumn = COLUMNS.some((c) => c.id === overId);
      const overOrder = orders.find((o) => o.id === overId);
      const targetStatus: StatusOS | undefined = isOverColumn 
        ? (overId as StatusOS) 
        : (overOrder?.status ?? currentOrder?.status);

      if (targetStatus && currentOrder) {
        updateOrder({ ...currentOrder, status: targetStatus });
        const col = COLUMNS.find((c) => c.id === targetStatus);
        showToast(`${activeId} posicionado em "${col?.title}"`);
      }
    } else if (currentOrder && activeOrder && currentOrder.status !== activeOrder.status) {
      updateOrder(currentOrder);
      const col = COLUMNS.find((c) => c.id === currentOrder.status);
      showToast(`${activeId} posicionado em "${col?.title}"`);
    }
    setActiveOrder(null);
  }

  // Quick Move
  function handleQuickMove(orderId: string, targetStatus: StatusOS) {
    const orderToUpdate = orders.find((o) => o.id === orderId);
    if (orderToUpdate) {
      updateOrder({ ...orderToUpdate, status: targetStatus });
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: targetStatus } : o))
      );
    }
    const col = COLUMNS.find(c => c.id === targetStatus);
    showToast(`${orderId} movido para "${col?.title}"`);
  }

  // Create Order
  function handleCreateOrder(newOrder: OrdemServico) {
    addOrder(newOrder);
    showToast(`Chamado ${newOrder.id} criado com sucesso!`);
  }

  // Update Order
  function handleUpdateOrder(updated: OrdemServico) {
    updateOrder(updated);
    showToast(`Chamado ${updated.id} atualizado.`);
  }

  // Delete Order
  function handleDeleteOrder(orderId: string) {
    deleteOrder(orderId);
    showToast(`Chamado ${orderId} removido.`);
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden" onClick={() => setIsFilterOpen(false)}>
      
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Sidebar */}
      <Sidebar currentRoute="/kanban" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1D6FEB]/10 flex items-center justify-center text-[#1D6FEB]">
                <LayoutDashboard size={18} />
              </div>
              <h1 className="text-lg font-bold text-slate-900">Quadro de Ocorrências (Kanban)</h1>
            </div>

            {/* Quick indicators in header */}
            <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 pl-4 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {filteredOrders.length} filtrados
              </span>
              {urgentCount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {urgentCount} urgentes
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                <Wrench size={12} />
                {inFieldCount} em campo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar chamado, prédio ou OS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 focus:border-[#1D6FEB] focus:bg-white transition-all"
              />
            </div>

            {/* Filters */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`rounded-xl text-xs font-bold border transition-all h-9 px-3 ${
                  activeFiltersCount > 0 
                    ? 'border-[#1D6FEB] bg-blue-50 text-[#1D6FEB]' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={14} className="mr-1.5" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="ml-1.5 w-4 h-4 bg-[#1D6FEB] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              <KanbanFilterPopover
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters({ prioridade: 'TODAS', predio: 'TODOS', tecnico: 'TODOS' })}
              />
            </div>

            {/* New Order Button */}
            <Button 
              onClick={() => setIsNewModalOpen(true)}
              className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white rounded-xl font-bold shadow-sm h-9 px-4 text-xs"
            >
              <Plus size={16} className="mr-1.5" />
              Novo chamado
            </Button>
          </div>
        </header>

        {/* Board Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          {isLoadingData ? (
            <KanbanBoardSkeleton />
          ) : isMounted ? (
            <DndContext
              id="kanban-dnd-board"
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-5 h-full min-w-max pb-2">
                {COLUMNS.map((column) => {
                  const columnOrders = filteredOrders.filter((o) => o.status === column.id);
                  return (
                    <KanbanColumnComponent key={column.id} column={column} count={columnOrders.length}>
                      <SortableContext items={columnOrders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
                        {columnOrders.map((order) => (
                          <KanbanCard 
                            key={order.id} 
                            order={order} 
                            onSelect={setSelectedOrder}
                            onMove={handleQuickMove}
                            onDelete={handleDeleteOrder}
                          />
                        ))}
                      </SortableContext>
                    </KanbanColumnComponent>
                  );
                })}
              </div>

              <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
                {activeOrder ? <KanbanCard order={activeOrder} isDragging /> : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="flex gap-5 h-full min-w-max pb-2">
              {COLUMNS.map((column) => {
                const columnOrders = filteredOrders.filter((o) => o.status === column.id);
                return (
                  <div key={column.id} className="w-[320px] flex flex-col h-full rounded-2xl bg-transparent">
                    <div className="flex items-center justify-between px-4 py-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
                        <h3 className="font-bold text-slate-800 text-sm">{column.title}</h3>
                      </div>
                      <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] bg-slate-200 text-slate-600 text-xs font-bold rounded-full px-1.5">
                        {columnOrders.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal: New Order */}
      <NewOrderModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={handleCreateOrder}
      />

      {/* Modal: Order Detail / Edit */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdate={handleUpdateOrder}
        onDelete={handleDeleteOrder}
      />
    </div>
  );
}
