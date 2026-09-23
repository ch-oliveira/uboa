'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  X, 
  MapPin, 
  User, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  Activity, 
  Trees, 
  Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { Sidebar } from '@/components/sidebar';
import { useOrders, type TipoUnidade } from '@/context/orders-context';
import { type OrdemServico } from '../kanban/data';
import { NewUnitModal } from './new-unit-modal';
import { UnitModal } from '../unit-modal';
import { NewOrderModal } from '../kanban/new-order-modal';
import { OrderDetailModal } from '../kanban/order-detail-modal';
import { UnitCardSkeleton } from '@/components/skeletons';

type CategoryFilter = 'ALL' | 'ESCOLA' | 'SAUDE' | 'ADMINISTRATIVO' | 'PRACA';
type HealthFilter = 'ALL' | 'CRITICO' | 'ATENCAO' | 'REGULAR';

export default function UnidadesPage() {
  const { 
    unitsWithStats, 
    isLoadingData,
    addUnit, 
    orders, 
    addOrder, 
    updateOrder, 
    deleteOrder 
  } = useOrders();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('ALL');

  // Modals
  const [isNewUnitModalOpen, setIsNewUnitModalOpen] = useState(false);
  const [selectedUnitName, setSelectedUnitName] = useState<string | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrdemServico | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = unitsWithStats.length;
    const criticas = unitsWithStats.filter((u) => u.statusHealth === 'CRITICO').length;
    const atencao = unitsWithStats.filter((u) => u.statusHealth === 'ATENCAO').length;
    const regulares = unitsWithStats.filter((u) => u.statusHealth === 'REGULAR').length;
    return { total, criticas, atencao, regulares };
  }, [unitsWithStats]);

  // Filtered units
  const filteredUnits = useMemo(() => {
    return unitsWithStats.filter((unit) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          unit.nome.toLowerCase().includes(q) ||
          unit.endereco.toLowerCase().includes(q) ||
          unit.gestor.toLowerCase().includes(q) ||
          unit.telefone.includes(q);
        if (!matches) return false;
      }

      // Category
      if (categoryFilter === 'ESCOLA' && unit.tipo !== 'ESCOLA') return false;
      if (categoryFilter === 'SAUDE' && unit.tipo !== 'UBS' && unit.tipo !== 'HOSPITAL') return false;
      if (categoryFilter === 'ADMINISTRATIVO' && unit.tipo !== 'ADMINISTRATIVO') return false;
      if (categoryFilter === 'PRACA' && unit.tipo !== 'PRACA') return false;

      // Health
      if (healthFilter !== 'ALL' && unit.statusHealth !== healthFilter) return false;

      return true;
    });
  }, [unitsWithStats, searchQuery, categoryFilter, healthFilter]);

  const getUnitIcon = (tipo: TipoUnidade) => {
    switch (tipo) {
      case 'ESCOLA':
        return <GraduationCap size={20} className="text-[#1D6FEB]" />;
      case 'UBS':
      case 'HOSPITAL':
        return <Activity size={20} className="text-red-500" />;
      case 'PRACA':
        return <Trees size={20} className="text-emerald-600" />;
      default:
        return <Landmark size={20} className="text-purple-600" />;
    }
  };

  const getTypeLabel = (tipo: TipoUnidade) => {
    switch (tipo) {
      case 'ESCOLA': return 'Educação';
      case 'UBS': return 'Saúde (UBS)';
      case 'HOSPITAL': return 'Hospital';
      case 'PRACA': return 'Parque / Praça';
      default: return 'Administrativo';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* Toast */}
      <Toast message={toastMessage} />

      {/* Sidebar */}
      <Sidebar currentRoute="/unidades" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/70 backdrop-blur-md border-b border-slate-100 shrink-0">
          <div className="text-sm text-slate-500 font-medium">
            Gestão municipal <span className="mx-2">/</span> <span className="text-slate-800 font-bold">Unidades e Prédios Públicos</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar escola, posto, endereço..." 
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
              onClick={() => setIsNewUnitModalOpen(true)}
              className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white rounded-lg px-5 font-semibold shadow-sm h-10 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Nova Unidade
            </Button>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Title & Description */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Rede de Prédios e Equipamentos Públicos
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Monitore a infraestrutura predial das escolas, postos de saúde e secretarias da cidade.
              </p>
            </div>

            <Button 
              onClick={() => setIsNewOrderModalOpen(true)}
              variant="outline"
              className="rounded-lg text-xs font-semibold h-10"
            >
              <Plus size={14} className="mr-1.5 text-[#1D6FEB]" />
              Abrir chamado em unidade
            </Button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div 
              onClick={() => { setHealthFilter('ALL'); setCategoryFilter('ALL'); }}
              className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-xs ${
                healthFilter === 'ALL' && categoryFilter === 'ALL'
                  ? 'border-[#1D6FEB] ring-2 ring-[#1D6FEB]/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Total de Unidades</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D6FEB] flex items-center justify-center">
                  <Building2 size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">{metrics.total}</div>
              <p className="text-xs text-slate-400 mt-1 font-medium">Equipamentos públicos mapeados</p>
            </div>

            <div 
              onClick={() => setHealthFilter('CRITICO')}
              className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-xs ${
                healthFilter === 'CRITICO'
                  ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-600 uppercase">Atenção Crítica</span>
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-red-700 mt-2">{metrics.criticas}</div>
              <p className="text-xs text-slate-400 mt-1 font-medium">Com chamados urgentes ativos</p>
            </div>

            <div 
              onClick={() => setHealthFilter('ATENCAO')}
              className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-xs ${
                healthFilter === 'ATENCAO'
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 uppercase">Com Pendências</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-amber-700 mt-2">{metrics.atencao}</div>
              <p className="text-xs text-slate-400 mt-1 font-medium">Em triagem ou execução</p>
            </div>

            <div 
              onClick={() => setHealthFilter('REGULAR')}
              className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-xs ${
                healthFilter === 'REGULAR'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 uppercase">Em Dia</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-2">{metrics.regulares}</div>
              <p className="text-xs text-slate-400 mt-1 font-medium">Sem ordens pendentes</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'Todas as Unidades' },
                { id: 'ESCOLA', label: 'Educação' },
                { id: 'SAUDE', label: 'Saúde' },
                { id: 'ADMINISTRATIVO', label: 'Administrativo' },
                { id: 'PRACA', label: 'Praças e Parques' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-[#1D6FEB] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Health status filter pill */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Status predial:</span>
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value as HealthFilter)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20"
              >
                <option value="ALL">Todos os status</option>
                <option value="CRITICO">Apenas Críticas</option>
                <option value="ATENCAO">Apenas com Pendências</option>
                <option value="REGULAR">Apenas em Dia</option>
              </select>
            </div>

          </div>

          {/* Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoadingData ? (
              Array.from({ length: 6 }).map((_, i) => (
                <UnitCardSkeleton key={i} />
              ))
            ) : filteredUnits.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-700">Nenhuma unidade encontrada</p>
                <p className="text-xs text-slate-400 mt-1">Tente remover filtros ou ajustar a busca.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => { setSearchQuery(''); setCategoryFilter('ALL'); setHealthFilter('ALL'); }}
                  className="mt-3 rounded-lg text-xs"
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              filteredUnits.map((unit) => {
                const totalTickets = unit.openCount + unit.completedCount;
                const resolutionRate = totalTickets > 0 ? Math.round((unit.completedCount / totalTickets) * 100) : 100;

                return (
                  <div
                    key={unit.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-[#1D6FEB]/40 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Bar: Type + Health */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            {getUnitIcon(unit.tipo)}
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {getTypeLabel(unit.tipo)}
                          </span>
                        </div>

                        {unit.statusHealth === 'CRITICO' ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                            Crítico ({unit.urgentCount} urgentes)
                          </span>
                        ) : unit.statusHealth === 'ATENCAO' ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            {unit.openCount} pendência(s)
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Em dia
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1D6FEB] transition-colors">
                        {unit.nome}
                      </h3>

                      {/* Address & Manager */}
                      <div className="space-y-1.5 mt-3 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">{unit.endereco}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">Gestor: {unit.gestor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-400 shrink-0" />
                          <span>{unit.telefone}</span>
                        </div>
                      </div>

                      {/* Resolution Progress Bar */}
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                          <span className="text-slate-500">Taxa de Resolução</span>
                          <span className="text-slate-800 font-bold">{resolutionRate}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              unit.statusHealth === 'CRITICO' ? 'bg-red-500' :
                              unit.statusHealth === 'ATENCAO' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${resolutionRate}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                          <span>{unit.openCount} abertos</span>
                          <span>{unit.completedCount} concluídos</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                      <Button
                        onClick={() => setSelectedUnitName(unit.nome)}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold h-9"
                      >
                        Ver ocorrências
                      </Button>
                      <Button
                        onClick={() => {
                          setIsNewOrderModalOpen(true);
                        }}
                        variant="outline"
                        title="Abrir novo chamado para este prédio"
                        className="rounded-lg text-xs font-semibold h-9 px-3"
                      >
                        <Plus size={14} className="text-[#1D6FEB]" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </main>

      {/* MODALS */}
      <NewUnitModal 
        isOpen={isNewUnitModalOpen}
        onClose={() => setIsNewUnitModalOpen(false)}
        onCreate={(newUnit) => {
          addUnit(newUnit);
          showToast(`Unidade "${newUnit.nome}" cadastrada com sucesso!`);
        }}
      />

      <UnitModal 
        unitName={selectedUnitName}
        isOpen={!!selectedUnitName}
        onClose={() => setSelectedUnitName(null)}
        orders={orders}
        onSelectOrder={(order) => setSelectedOrder(order)}
      />

      <NewOrderModal 
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
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
