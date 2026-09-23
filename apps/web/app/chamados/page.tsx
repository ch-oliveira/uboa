'use client';

import React, { useState, useMemo } from 'react';
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
  LayoutGrid,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { Sidebar } from '@/components/sidebar';
import { useOrders } from '@/context/orders-context';
import { PREDIOS, TECNICOS, type OrdemServico, type Prioridade } from '../kanban/data';
import { NewOrderModal } from '../kanban/new-order-modal';
import { OrderDetailModal } from '../kanban/order-detail-modal';
import { ChamadosTableSkeleton, ChamadosGridSkeleton } from '@/components/skeletons';
import { getPriorityBadge, getStatusBadge } from '@/lib/badges';

type SortField = 'dataAbertura' | 'prioridade' | 'status' | 'predio' | 'titulo';
type SortOrder = 'asc' | 'desc';

export default function ChamadosPage() {
  const { 
    orders, 
    isLoadingData,
    addOrder, 
    updateOrder, 
    deleteOrder, 
    stats 
  } = useOrders();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [priorityFilter, setPriorityFilter] = useState<string>('TODAS');
  const [unitFilter, setUnitFilter] = useState<string>('TODAS');
  const [techFilter, setTechFilter] = useState<string>('TODOS');

  // View & Sort State
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<SortField>('dataAbertura');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modals & Feedback
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrdemServico | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'TODOS') count++;
    if (priorityFilter !== 'TODAS') count++;
    if (unitFilter !== 'TODAS') count++;
    if (techFilter !== 'TODOS') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [statusFilter, priorityFilter, unitFilter, techFilter, searchQuery]);

  function handleResetFilters() {
    setSearchQuery('');
    setStatusFilter('TODOS');
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

        // Status
        if (statusFilter !== 'TODOS' && order.status !== statusFilter) {
          return false;
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
          // Default: dataAbertura
          cmp = b.id.localeCompare(a.id);
        }
        return sortOrder === 'asc' ? -cmp : cmp;
      });
  }, [orders, searchQuery, statusFilter, priorityFilter, unitFilter, techFilter, sortField, sortOrder]);

  function handleToggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }

  function handleExportCSV() {
    const headers = ['ID', 'Titulo', 'Predio', 'Prioridade', 'Status', 'Solicitante', 'Tecnico', 'DataAbertura'];
    const rows = filteredOrders.map(o => [
      o.id,
      `"${o.titulo.replace(/"/g, '""')}"`,
      `"${o.predio.replace(/"/g, '""')}"`,
      o.prioridade,
      o.status,
      `"${o.solicitante || ''}"`,
      `"${o.tecnico || ''}"`,
      o.dataAbertura
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chamados_zelo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório CSV exportado com sucesso!');
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* Toast */}
      <Toast message={toastMessage} />

      {/* Sidebar */}
      <Sidebar currentRoute="/chamados" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/70 backdrop-blur-md border-b border-slate-100 shrink-0">
          <div className="text-sm text-slate-500 font-medium">
            Gestão municipal <span className="mx-2">/</span> <span className="text-slate-800 font-bold">Chamados</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar chamado, código, técnico..." 
                className="w-72 pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 focus:border-[#1D6FEB] transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <Button 
              onClick={() => setIsNewModalOpen(true)}
              className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white rounded-lg px-5 font-semibold shadow-sm h-10 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Novo chamado
            </Button>
          </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Top Title & Metrics bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Ordens de Serviço e Chamados
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Acompanhe o ciclo de vida completo de cada solicitação de manutenção nas unidades públicas.
              </p>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Total:</span>
                <span className="text-sm font-extrabold text-slate-900">{orders.length}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 shadow-xs flex items-center gap-2 text-red-700">
                <AlertTriangle size={14} />
                <span className="text-xs font-bold uppercase">Urgentes:</span>
                <span className="text-sm font-extrabold">{stats.urgentes}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 shadow-xs flex items-center gap-2 text-blue-700">
                <Wrench size={14} />
                <span className="text-xs font-bold uppercase">Em campo:</span>
                <span className="text-sm font-extrabold">{stats.emExecucao}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={14} />
                <span className="text-xs font-bold uppercase">Concluídos:</span>
                <span className="text-sm font-extrabold">{stats.concluidos}</span>
              </div>
            </div>
          </div>

          {/* Filter Controls Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            
            {/* Row 1: Status Chips */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'TODOS', label: 'Todos os Status', count: orders.length },
                  { id: 'TRIAGEM', label: 'Em Triagem', count: stats.triagem },
                  { id: 'AGENDADO', label: 'Agendados', count: orders.filter(o => o.status === 'AGENDADO').length },
                  { id: 'EM_EXECUCAO', label: 'Em Execução', count: stats.emExecucao },
                  { id: 'AGUARDANDO', label: 'Aguardando', count: stats.aguardando },
                  { id: 'CONCLUIDO', label: 'Concluídos', count: stats.concluidos },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === tab.id
                        ? 'bg-[#1D6FEB] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === tab.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* View Toggle & Export */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCSV}
                  className="rounded-lg text-xs font-semibold text-slate-700 h-9"
                >
                  <Download size={14} className="mr-1.5 text-slate-500" />
                  Exportar CSV
                </Button>

                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setViewMode('table')}
                    title="Visualização em tabela"
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LayoutList size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Visualização em grade"
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Secondary Select Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
              
              {/* Prioridade */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Prioridade:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20"
                >
                  <option value="TODAS">Todas as prioridades</option>
                  <option value="URGENTE">Urgente</option>
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Média</option>
                  <option value="BAIXA">Baixa</option>
                </select>
              </div>

              {/* Unidade */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Unidade:</span>
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 max-w-56 truncate"
                >
                  <option value="TODAS">Todas as unidades</option>
                  {PREDIOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Técnico */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Técnico:</span>
                <select
                  value={techFilter}
                  onChange={(e) => setTechFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20"
                >
                  <option value="TODOS">Todos os responsáveis</option>
                  <option value="COM_TECNICO">Com técnico designado</option>
                  <option value="SEM_TECNICO">Sem técnico (A designar)</option>
                  {TECNICOS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Reset button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 ml-auto"
                >
                  <X size={14} />
                  Limpar filtros ({activeFiltersCount})
                </button>
              )}
            </div>

          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Mostrando {filteredOrders.length} de {orders.length} chamados</span>
            <span>Clique em um chamado para ver o histórico e atualizar</span>
          </div>

          {/* TABLE VIEW OR SKELETON */}
          {isLoadingData ? (
            viewMode === 'table' ? (
              <ChamadosTableSkeleton />
            ) : (
              <ChamadosGridSkeleton />
            )
          ) : viewMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                    <tr>
                      <th 
                        onClick={() => handleToggleSort('dataAbertura')} 
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Código</span>
                          <ArrowUpDown size={12} className="text-slate-400" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleToggleSort('titulo')} 
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Título & Descrição</span>
                          <ArrowUpDown size={12} className="text-slate-400" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleToggleSort('predio')} 
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Unidade</span>
                          <ArrowUpDown size={12} className="text-slate-400" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleToggleSort('prioridade')} 
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Prioridade</span>
                          <ArrowUpDown size={12} className="text-slate-400" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleToggleSort('status')} 
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Status</span>
                          <ArrowUpDown size={12} className="text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4">Técnico</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <p className="text-sm font-semibold text-slate-700">Nenhum chamado encontrado</p>
                          <p className="text-xs text-slate-400 mt-1">Tente ajustar os filtros ou a busca.</p>
                          {activeFiltersCount > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleResetFilters}
                              className="mt-3 rounded-lg text-xs"
                            >
                              Limpar filtros
                            </Button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const statusInfo = getStatusBadge(order.status);
                        return (
                          <tr 
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                          >
                            <td className="py-4 px-4 font-mono font-bold text-xs text-slate-600">
                              {order.id}
                            </td>
                            <td className="py-4 px-4 max-w-xs">
                              <p className="font-bold text-slate-900 group-hover:text-[#1D6FEB] transition-colors truncate">
                                {order.titulo}
                              </p>
                              {order.descricao && (
                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                  {order.descricao}
                                </p>
                              )}
                              <p className="text-[11px] text-slate-400 mt-1">
                                Aberto por {order.solicitante} em {order.dataAbertura}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <Building2 size={14} className="text-slate-400 shrink-0" />
                                <span className="truncate">{order.predio}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getPriorityBadge(order.prioridade)}`}>
                                {order.prioridade}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${statusInfo.style}`}>
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {order.tecnico ? (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                                  <User size={13} className="text-slate-400" />
                                  <span>{order.tecnico}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">A designar</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                }}
                                className="text-xs font-semibold text-[#1D6FEB] hover:underline p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                              >
                                Ver detalhes
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700">Nenhum chamado encontrado</p>
                  <p className="text-xs text-slate-400 mt-1">Tente ajustar os filtros ou a busca.</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = getStatusBadge(order.status);
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#1D6FEB]/40 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono font-bold text-slate-400">{order.id}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(order.prioridade)}`}>
                              {order.prioridade}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusInfo.style}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1D6FEB] transition-colors">
                          {order.titulo}
                        </h3>

                        {/* Description */}
                        {order.descricao && (
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                            {order.descricao}
                          </p>
                        )}

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mt-4">
                          <Building2 size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">{order.predio}</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                        <span>{order.dataAbertura}</span>
                        <div className="flex items-center gap-1 text-[#1D6FEB] font-semibold group-hover:translate-x-0.5 transition-transform">
                          <span>Detalhes</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
          showToast(`Chamado ${newOrder.id} criado com sucesso!`);
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
