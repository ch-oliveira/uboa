'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  Landmark,
  ArrowRight
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
import { TopHeader } from '@/components/top-header';
import { UnitCardSkeleton } from '@/components/skeletons';

type CategoryFilter = 'ALL' | 'ESCOLA' | 'SAUDE' | 'ADMINISTRATIVO' | 'PRACA';
type PendingFilter = 'ALL' | 'URGENTES' | 'SEM_CHAMADOS';

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
  const [pendingFilter, setPendingFilter] = useState<PendingFilter>('ALL');

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
    const withUrgencies = unitsWithStats.filter((u) => u.urgentCount > 0).length;
    const withoutActive = unitsWithStats.filter((u) => u.openCount === 0).length;
    return { total, withUrgencies, withoutActive };
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

      // Pending
      if (pendingFilter === 'URGENTES' && unit.urgentCount === 0) return false;
      if (pendingFilter === 'SEM_CHAMADOS' && unit.openCount > 0) return false;

      return true;
    });
  }, [unitsWithStats, searchQuery, categoryFilter, pendingFilter]);

  const getUnitIcon = (tipo: TipoUnidade) => {
    switch (tipo) {
      case 'ESCOLA':
        return <GraduationCap size={16} className="text-primary" />;
      case 'UBS':
      case 'HOSPITAL':
        return <Activity size={16} className="text-primary" />;
      case 'PRACA':
        return <Trees size={16} className="text-primary" />;
      default:
        return <Landmark size={16} className="text-primary" />;
    }
  };

  const getTypeLabel = (tipo: TipoUnidade) => {
    switch (tipo) {
      case 'ESCOLA': return 'Educação';
      case 'UBS': return 'Saúde';
      case 'HOSPITAL': return 'Saúde';
      case 'PRACA': return 'Praças e parques';
      default: return 'Administrativo';
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* Toast */}
      <Toast message={toastMessage} />

      {/* Sidebar */}
      <Sidebar currentRoute="/unidades" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header Global */}
        <TopHeader 
          titleOverride="Unidades e Instalações"
          breadcrumbs={[
            { label: 'Gestão municipal', href: '/' },
            { label: 'Unidades e Instalações' },
          ]}
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
                Unidades e Instalações
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitore a saúde e as pendências de cada local da cidade.
              </p>
            </div>
            <div className="flex items-center shrink-0">
              <Button 
                onClick={() => setIsNewUnitModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-2 font-semibold text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova unidade
              </Button>
            </div>
          </div>

          {/* Subtitle Stats (Image 4) */}
          <div className="pt-1 text-sm font-medium text-foreground">
            <span>{metrics.total} unidades</span>
            <span className="mx-2 text-muted-foreground/30">·</span>
            <span className="text-destructive font-semibold">{metrics.withUrgencies} com urgências</span>
            <span className="mx-2 text-muted-foreground/30">·</span>
            <span className="text-muted-foreground">{metrics.withoutActive} sem chamados ativos</span>
          </div>

          {/* Filters Row (Image 4) */}
          <div className="bg-card border border-border rounded-xl p-4 mb-4 max-w-4xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Buscar unidade */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Buscar unidade
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nome ou endereço"
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

            {/* 2. Categoria */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Categoria
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer shadow-sm"
              >
                <option value="ALL">Todas</option>
                <option value="SAUDE">Saúde</option>
                <option value="ESCOLA">Educação</option>
                <option value="PRACA">Praças e parques</option>
                <option value="ADMINISTRATIVO">Administrativo</option>
              </select>
            </div>

            {/* 3. Pendências */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Pendências
              </label>
              <select
                value={pendingFilter}
                onChange={(e) => setPendingFilter(e.target.value as PendingFilter)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer shadow-sm"
              >
                <option value="ALL">Todas as unidades</option>
                <option value="URGENTES">Com urgências</option>
                <option value="SEM_CHAMADOS">Sem chamados ativos</option>
              </select>
            </div>
          </div>
          </div>

          {/* UNIT CARDS GRID (Image 4) */}
          {isLoadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <UnitCardSkeleton />
              <UnitCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {filteredUnits.length === 0 ? (
                <div className="col-span-full py-16 text-center text-muted-foreground ds-card border-border">
                  <p className="text-sm font-semibold text-foreground">Nenhuma unidade encontrada</p>
                  <p className="text-xs text-muted-foreground mt-1">Tente ajustar a busca ou os filtros.</p>
                </div>
              ) : (
              filteredUnits.map((unit) => {
                // Cálculo da pendência real e próximo passo a partir dos chamados ativos
                const unitOrders = orders.filter((o) => o.predio.toLowerCase() === unit.nome.toLowerCase());
                const triagemOrders = unitOrders.filter((o) => o.status === 'TRIAGEM');
                const validacaoOrders = unitOrders.filter((o) => o.status === 'AGUARDANDO');
                const execucaoOrders = unitOrders.filter((o) => o.status === 'EM_EXECUCAO');
                const agendadoOrders = unitOrders.filter((o) => o.status === 'AGENDADO');

                let pendenciaReal = 'Sem chamados pendentes · Vistorias preventivas em dia';
                let pendenciaColor = 'text-emerald-600';

                if (triagemOrders.length > 0) {
                  const urgentes = triagemOrders.filter(o => o.prioridade === 'URGENTE').length;
                  pendenciaReal = urgentes > 0 
                    ? `Pendência crítica: ${triagemOrders.length} chamado(s) em triagem (${urgentes} urgente)`
                    : `Pendência: ${triagemOrders.length} chamado(s) aguardando triagem operacional`;
                  pendenciaColor = urgentes > 0 ? 'text-destructive font-bold' : 'text-amber-600 font-semibold';
                } else if (validacaoOrders.length > 0) {
                  pendenciaReal = `Aguardando validação: ${validacaoOrders.length} serviço(s) para ateste da gestora`;
                  pendenciaColor = 'text-primary font-semibold';
                } else if (execucaoOrders.length > 0) {
                  const tec = execucaoOrders[0]?.tecnico || 'Equipe designada';
                  pendenciaReal = `Em execução: ${execucaoOrders.length} serviço(s) em campo por ${tec}`;
                  pendenciaColor = 'text-primary font-semibold';
                } else if (agendadoOrders.length > 0) {
                  pendenciaReal = `Planejamento: ${agendadoOrders.length} chamado(s) agendados com visita programada`;
                  pendenciaColor = 'text-muted-foreground font-medium';
                }

                return (
                  <div
                    key={unit.id}
                    className="bg-card border border-border rounded-lg shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      {/* Category tag */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                        {getUnitIcon(unit.tipo)}
                        <span>{getTypeLabel(unit.tipo)}</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-bold text-foreground mt-2">
                        {unit.nome}
                      </h2>

                      {/* Address */}
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {unit.endereco}
                      </p>

                      {/* Counts badges */}
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-xs font-bold text-foreground">
                          {unit.openCount} ativos
                        </span>
                        {unit.urgentCount > 0 && (
                          <span className="bg-destructive/10 text-destructive font-semibold text-xs px-2 py-0.5 rounded-lg">
                            {unit.urgentCount} urgente{unit.urgentCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Real Pending Status Note */}
                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider mb-1">
                          Próximo passo operacional
                        </p>
                        <p className={`text-xs ${pendenciaColor}`}>
                          {pendenciaReal}
                        </p>
                      </div>
                    </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setSelectedUnitName(unit.nome)}
                          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                          Ver unidade
                        </button>

                        <Link
                          href={`/chamados?unidade=${encodeURIComponent(unit.nome)}`}
                          className="hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold px-3 py-1.5 rounded-md transition-all flex items-center gap-1"
                        >
                          <span>Chamados</span>
                          <ArrowRight size={13} />
                        </Link>
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
      <NewUnitModal 
        isOpen={isNewUnitModalOpen}
        onClose={() => setIsNewUnitModalOpen(false)}
        onCreate={(newUnit) => {
          addUnit(newUnit);
          showToast(`Unidade ${newUnit.nome} cadastrada com sucesso!`);
        }}
      />

      <UnitModal 
        isOpen={!!selectedUnitName}
        unitName={selectedUnitName}
        orders={orders}
        onClose={() => setSelectedUnitName(null)}
        onSelectOrder={(ord) => setSelectedOrder(ord)}
        onNewOrder={(name) => {
          setSelectedUnitName(name);
          setIsNewOrderModalOpen(true);
        }}
      />

      <NewOrderModal 
        isOpen={isNewOrderModalOpen}
        defaultPredio={selectedUnitName || undefined}
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
