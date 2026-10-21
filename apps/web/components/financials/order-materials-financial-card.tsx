'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Package, 
  Building, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Edit3, 
  X, 
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Coins,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import type { OrdemServico, MaterialItem, ItemConsumoOS, ContratoItem } from '@/app/kanban/data';
import { NewContractModal } from '@/components/financials/new-contract-modal';

interface OrderMaterialsFinancialCardProps {
  order: OrdemServico;
  isGestor: boolean;
  onOrderUpdated: (updated: OrdemServico) => void;
}

export function OrderMaterialsFinancialCard({
  order,
  isGestor,
  onOrderUpdated,
}: OrderMaterialsFinancialCardProps) {
  const [catalogMaterials, setCatalogMaterials] = useState<MaterialItem[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [contracts, setContracts] = useState<ContratoItem[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);

  // Modals / forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditFinancialsOpen, setIsEditFinancialsOpen] = useState(false);
  const [isNewContractModalOpen, setIsNewContractModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Add Material
  const [isCustomItem, setIsCustomItem] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [customDescricao, setCustomDescricao] = useState('');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [unidadeMedida, setUnidadeMedida] = useState('UN');
  const [precoUnitario, setPrecoUnitario] = useState<number>(0);

  // Form Edit Financials
  const [editMaoDeObra, setEditMaoDeObra] = useState<number>(order.custoMaoDeObra || 0);
  const [editTerceirizada, setEditTerceirizada] = useState(order.empresaTerceirizada || '');
  const [editEmpenho, setEditEmpenho] = useState(order.numeroEmpenho || '');
  const [editContratoId, setEditContratoId] = useState(order.contratoId || '');

  // Sincroniza estado de edição quando a ordem muda
  useEffect(() => {
    setEditMaoDeObra(order.custoMaoDeObra || 0);
    setEditTerceirizada(order.empresaTerceirizada || '');
    setEditEmpenho(order.numeroEmpenho || '');
    setEditContratoId(order.contratoId || '');
  }, [order.custoMaoDeObra, order.empresaTerceirizada, order.numeroEmpenho, order.contratoId]);

  // Carrega catálogo de materiais e contratos públicos
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingMaterials(true);
      setIsLoadingContracts(true);
      try {
        const [matRes, contRes] = await Promise.allSettled([
          apiClient.getMaterials(),
          apiClient.getContracts(),
        ]);

        if (isMounted && matRes.status === 'fulfilled' && matRes.value.success && Array.isArray(matRes.value.materials)) {
          setCatalogMaterials(matRes.value.materials);
        }
        if (isMounted && contRes.status === 'fulfilled' && contRes.value.success && Array.isArray(contRes.value.contracts)) {
          setContracts(contRes.value.contracts);
        }
      } catch {
        // Ignora caso API indisponível
      } finally {
        if (isMounted) {
          setIsLoadingMaterials(false);
          setIsLoadingContracts(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  function formatBRL(val?: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  }

  function handleSelectCatalogMaterial(materialId: string) {
    setSelectedMaterialId(materialId);
    const found = catalogMaterials.find((m) => m.id === materialId);
    if (found) {
      setCustomDescricao(found.nome);
      setUnidadeMedida(found.unidadeMedida || 'UN');
      setPrecoUnitario(found.precoUnitario || 0);
    }
  }

  async function handleAddMaterialSubmit(e: React.FormEvent) {
    e.preventDefault();
    const desc = isCustomItem ? customDescricao.trim() : (catalogMaterials.find(m => m.id === selectedMaterialId)?.nome || customDescricao.trim());
    if (!desc || quantidade <= 0 || precoUnitario < 0) {
      setFeedbackMsg({ type: 'error', text: 'Informe a descrição, quantidade válida e valor unitário.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await apiClient.addWorkOrderMaterial(order.id, {
        materialId: isCustomItem ? undefined : (selectedMaterialId || undefined),
        descricao: desc,
        quantidade: Number(quantidade),
        unidadeMedida,
        precoUnitario: Number(precoUnitario),
      });

      if (res.success && res.data) {
        const novoItem: ItemConsumoOS = {
          id: res.data.id || `item-${Date.now()}`,
          materialId: res.data.material_id || res.data.materialId || selectedMaterialId || undefined,
          descricao: res.data.descricao || desc,
          quantidade: Number(res.data.quantidade || quantidade),
          unidadeMedida: res.data.unidade_medida || res.data.unidadeMedida || unidadeMedida,
          precoUnitario: Number(res.data.preco_unitario || res.data.precoUnitario || precoUnitario),
          precoTotal: Number(res.data.preco_total || res.data.precoTotal || (quantidade * precoUnitario)),
          criadoEm: res.data.criado_em || new Date().toISOString(),
        };

        const novosItens = [...(order.materiaisConsumidos || []), novoItem];
        const novoCustoMateriais = novosItens.reduce((acc, curr) => acc + (curr.precoTotal || 0), 0);
        const novoCustoTotal = novoCustoMateriais + (order.custoMaoDeObra || 0);

        const updated: OrdemServico = {
          ...order,
          materiaisConsumidos: novosItens,
          custoMateriais: novoCustoMateriais,
          custoTotal: novoCustoTotal,
        };

        onOrderUpdated(updated);
        setIsAddModalOpen(false);
        // Reset form
        setSelectedMaterialId('');
        setCustomDescricao('');
        setQuantidade(1);
        setPrecoUnitario(0);
        setIsCustomItem(false);
        setFeedbackMsg({ type: 'success', text: 'Peça adicionada e estoque atualizado com sucesso!' });
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Erro ao registrar material.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Falha de comunicação ao adicionar material.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveMaterial(itemId: string) {
    if (!window.confirm('Deseja realmente estornar este item da medição? O saldo de estoque será devolvido ao almoxarifado.')) {
      return;
    }

    try {
      const res = await apiClient.removeWorkOrderMaterial(order.id, itemId);
      if (res.success) {
        const novosItens = (order.materiaisConsumidos || []).filter(item => item.id !== itemId);
        const novoCustoMateriais = novosItens.reduce((acc, curr) => acc + (curr.precoTotal || 0), 0);
        const novoCustoTotal = novoCustoMateriais + (order.custoMaoDeObra || 0);

        const updated: OrdemServico = {
          ...order,
          materiaisConsumidos: novosItens,
          custoMateriais: novoCustoMateriais,
          custoTotal: novoCustoTotal,
        };

        onOrderUpdated(updated);
        setFeedbackMsg({ type: 'success', text: 'Item estornado e estoque recomposto!' });
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Não foi possível estornar o item.' });
    }
  }

  function handleSelectContract(contratoId: string) {
    setEditContratoId(contratoId);
    if (contratoId) {
      const found = contracts.find(c => c.id === contratoId);
      if (found) {
        setEditTerceirizada(found.empresaContratada);
        setEditEmpenho(found.numeroEmpenho || found.numeroContrato);
      }
    }
  }

  function handleContractCreated(newContract: ContratoItem) {
    setContracts((prev) => [newContract, ...prev]);
    setEditContratoId(newContract.id);
    setEditTerceirizada(newContract.empresaContratada);
    setEditEmpenho(newContract.numeroEmpenho || newContract.numeroContrato);
    setIsNewContractModalOpen(false);
    setFeedbackMsg({ type: 'success', text: `Contrato ${newContract.numeroContrato} cadastrado e vinculado!` });
    setTimeout(() => setFeedbackMsg(null), 3500);
  }

  async function handleSaveFinancialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await apiClient.updateWorkOrderFinancials(order.id, {
        custoMaoDeObra: Number(editMaoDeObra || 0),
        empresaTerceirizada: editTerceirizada.trim() || undefined,
        numeroEmpenho: editEmpenho.trim() || undefined,
        contratoId: editContratoId || undefined,
      });

      if (res.success) {
        const maoDeObra = Number(editMaoDeObra || 0);
        const custoMateriais = Number(order.custoMateriais || 0);
        const custoTotal = custoMateriais + maoDeObra;

        const updated: OrdemServico = {
          ...order,
          custoMaoDeObra: maoDeObra,
          custoTotal,
          empresaTerceirizada: editTerceirizada.trim() || undefined,
          numeroEmpenho: editEmpenho.trim() || undefined,
          contratoId: editContratoId || undefined,
        };

        onOrderUpdated(updated);
        setIsEditFinancialsOpen(false);
        setFeedbackMsg({ type: 'success', text: 'Dados financeiros e contrato municipal atualizados!' });
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Erro ao atualizar dados financeiros.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Falha ao salvar dados contratuais.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const custoMateriais = order.custoMateriais || 0;
  const custoMaoDeObra = order.custoMaoDeObra || 0;
  const custoTotal = order.custoTotal !== undefined ? order.custoTotal : (custoMateriais + custoMaoDeObra);
  const items = order.materiaisConsumidos || [];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      
      {/* 1. Header do Bloco com Badges de Governança */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
            <Coins size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Medição Financeira & Peças Consumidas
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                <ShieldCheck size={11} />
                Auditoria TCE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Apuração de custos, baixa no almoxarifado municipal e liquidação de despesa (Lei 14.133/21)
            </p>
          </div>
        </div>

        {isGestor && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditFinancialsOpen(true)}
              className="text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit3 size={13} />
              <span>Contrato / Empenho</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#0A2540] hover:bg-[#07192C] text-white text-xs font-semibold rounded-xl h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={13} />
              <span>Lançar Peça</span>
            </Button>
          </div>
        )}
      </div>

      {feedbackMsg && (
        <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 2. Grid de Resumo Financeiro da OS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Materiais */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Peças & Insumos</span>
            <Package size={14} className="text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono">
            {formatBRL(custoMateriais)}
          </p>
          <span className="text-[10px] text-slate-400 block truncate">
            {items.length} {items.length === 1 ? 'item lançado' : 'itens lançados'}
          </span>
        </div>

        {/* Card 2: Mão de Obra */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Mão de Obra</span>
            <DollarSign size={14} className="text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono">
            {formatBRL(custoMaoDeObra)}
          </p>
          <span className="text-[10px] text-slate-400 block truncate">
            {order.empresaTerceirizada ? order.empresaTerceirizada : 'Própria / Não discriminada'}
          </span>
        </div>

        {/* Card 3: Custo Total Destaque */}
        <div className="p-3.5 rounded-xl bg-blue-900 text-white border border-blue-950 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-200">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Valor Total da OS</span>
            <Coins size={14} className="text-blue-300" />
          </div>
          <p className="text-xl font-bold font-mono tracking-tight text-white">
            {formatBRL(custoTotal)}
          </p>
          <span className="text-[10px] text-blue-200 block truncate">
            Materiais + Mão de Obra
          </span>
        </div>

        {/* Card 4: Dados do Contrato / Empenho */}
        {(() => {
          const matchedContract = contracts.find(c => c.id === order.contratoId);
          return (
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Contrato & Empenho</span>
                <Briefcase size={14} className="text-slate-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-slate-800 font-mono truncate">
                  {matchedContract ? `Contrato ${matchedContract.numeroContrato}` : (order.numeroEmpenho || 'Sem contrato')}
                </p>
                {matchedContract && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                    Ativo
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 block truncate" title={matchedContract?.empresaContratada || order.empresaTerceirizada}>
                {matchedContract 
                  ? `Contratada: ${matchedContract.empresaContratada}` 
                  : (order.empresaTerceirizada ? `Contratada: ${order.empresaTerceirizada}` : 'Equipe direta da prefeitura')}
              </span>
              {matchedContract && (
                <div className="pt-1 mt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Saldo Empenho:</span>
                  <span className="font-mono font-bold text-emerald-700">{formatBRL(matchedContract.saldoRestante)}</span>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* 3. Tabela de Peças & Materiais Consumidos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <Package size={14} className="text-slate-400" />
            <span>Itens e Peças Utilizados no Atendimento</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Valores unitários vinculados ao catálogo de compras
          </span>
        </div>

        {items.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Item / Descrição</th>
                  <th className="py-2.5 px-3 text-center">Unidade</th>
                  <th className="py-2.5 px-3 text-right">Qtd</th>
                  <th className="py-2.5 px-3 text-right">Preço Unit.</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  {isGestor && <th className="py-2.5 px-3 text-center w-12">Ação</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{item.descricao}</div>
                      {item.materialId && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Almoxarifado Municipal
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {item.unidadeMedida || 'UN'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                      {item.quantidade}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {formatBRL(item.precoUnitario)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatBRL(item.precoTotal)}
                    </td>
                    {isGestor && (
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(item.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Estornar peça da OS"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80 font-semibold text-slate-800 border-t border-slate-200">
                <tr>
                  <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-[10px] text-slate-500">
                    Total em Peças & Materiais:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatBRL(custoMateriais)}
                  </td>
                  {isGestor && <td></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="py-8 px-4 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/50 space-y-2">
            <Package size={24} className="text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Nenhum insumo ou peça baixado nesta ordem de serviço</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Ao lançar peças utilizadas, o saldo de estoque do almoxarifado municipal é deduzido automaticamente e a medição do chamado é atualizada.
            </p>
            {isGestor && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-100 rounded-xl h-8 px-3 mt-2 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>Adicionar Primeiro Item</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: Lançar Peça / Consumo de Material                */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                  <Package size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Lançar Material ou Peça</h3>
                  <p className="text-[11px] text-slate-400">Baixa no Almoxarifado Central</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddMaterialSubmit} className="p-5 space-y-4">
              
              {/* Opção Catálogo vs Personalizado */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700">Origem da Peça:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomItem(false)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      !isCustomItem 
                        ? 'bg-blue-900 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Almoxarifado
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomItem(true);
                      setSelectedMaterialId('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isCustomItem 
                        ? 'bg-blue-900 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Compra Avulsa / Direta
                  </button>
                </div>
              </div>

              {!isCustomItem ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Selecione o Insumo do Catálogo Municipal:
                  </label>
                  {isLoadingMaterials ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                      <Loader2 size={13} className="animate-spin text-blue-900" />
                      <span>Carregando itens do estoque...</span>
                    </div>
                  ) : (
                    <select
                      value={selectedMaterialId}
                      onChange={(e) => handleSelectCatalogMaterial(e.target.value)}
                      className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
                      required
                    >
                      <option value="">Selecione um item do estoque...</option>
                      {catalogMaterials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome} ({m.unidadeMedida}) — R$ {m.precoUnitario.toFixed(2)} (Saldo: {m.estoqueAtual})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Descrição da Peça ou Material:
                  </label>
                  <input
                    type="text"
                    value={customDescricao}
                    onChange={(e) => setCustomDescricao(e.target.value)}
                    placeholder="Ex: Disjuntor Bipolar 40A Siemens"
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Qtd:</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Unidade:</label>
                  <input
                    type="text"
                    value={unidadeMedida}
                    onChange={(e) => setUnidadeMedida(e.target.value)}
                    placeholder="UN, M, L"
                    disabled={!isCustomItem}
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all uppercase disabled:opacity-60"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Preço Unit. (R$):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={precoUnitario}
                    onChange={(e) => setPrecoUnitario(parseFloat(e.target.value) || 0)}
                    disabled={!isCustomItem}
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-mono disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              {/* Subtotal estimado */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Subtotal Desta Peça:</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatBRL(quantidade * precoUnitario)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs rounded-xl h-9 px-4 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0A2540] hover:bg-[#07192C] text-white text-xs font-semibold rounded-xl h-9 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Salvar e Debitar</span>
                    </>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: Editar Medição, Contrato & Empenho               */}
      {/* ======================================================== */}
      {isEditFinancialsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileText size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Vincular Contrato Público & Medição</h3>
                  <p className="text-[11px] text-slate-400">Prestação de contas do processo e liquidação da despesa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditFinancialsOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveFinancialsSubmit} className="p-5 space-y-4">
              
              {/* Dropdown de Contratos Ativos da Prefeitura */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Contrato Municipal Vigente (Empenho Global):
                  </label>
                  <div className="flex items-center gap-2">
                    {isLoadingContracts && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> Carregando...
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsNewContractModalOpen(true)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus size={12} />
                      <span>+ Novo Contrato</span>
                    </button>
                  </div>
                </div>

                <select
                  value={editContratoId}
                  onChange={(e) => handleSelectContract(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">Sem contrato vinculado (Administração Direta / Avulso)</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      Contrato {c.numeroContrato} — {c.empresaContratada} (Saldo: {formatBRL(c.saldoRestante)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Card de Resumo do Contrato Selecionado */}
              {(() => {
                const selectedContract = contracts.find((c) => c.id === editContratoId);
                if (!selectedContract) return null;

                return (
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-700" />
                        {selectedContract.empresaContratada}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200 font-semibold">
                        Empenho: {selectedContract.numeroEmpenho}
                      </span>
                    </div>

                    {selectedContract.objeto && (
                      <p className="text-[11px] text-emerald-800 line-clamp-2">
                        {selectedContract.objeto}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-200/60 text-[11px]">
                      <div>
                        <span className="text-emerald-700 block text-[10px]">Total Empenhado:</span>
                        <span className="font-mono font-bold text-slate-800">{formatBRL(selectedContract.valorTotalEmpenhado)}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block text-[10px]">Total Medido:</span>
                        <span className="font-mono font-bold text-slate-800">{formatBRL(selectedContract.valorTotalMedido)}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block text-[10px]">Saldo Disponível:</span>
                        <span className="font-mono font-bold text-emerald-700">{formatBRL(selectedContract.saldoRestante)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Empresa Contratada */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Razão Social da Contratada:
                </label>
                <input
                  type="text"
                  value={editTerceirizada}
                  onChange={(e) => setEditTerceirizada(e.target.value)}
                  placeholder="Ex: Alvorada Engenharia Ltda"
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              {/* Número do Empenho */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Número do Empenho / Contrato:
                </label>
                <input
                  type="text"
                  value={editEmpenho}
                  onChange={(e) => setEditEmpenho(e.target.value)}
                  placeholder="Ex: 2026NE00412"
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-mono uppercase"
                />
              </div>

              {/* Mão de Obra */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Custo da Mão de Obra Técnica (R$):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editMaoDeObra}
                  onChange={(e) => setEditMaoDeObra(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-mono"
                />
                <span className="text-[10px] text-slate-400 block">
                  Valor liquidado nesta OS pelo serviço técnico prestado.
                </span>
              </div>

              {/* Prévia do total consolidado */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Materiais Lançados:</span>
                  <span className="font-mono">{formatBRL(custoMateriais)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Mão de Obra:</span>
                  <span className="font-mono">{formatBRL(editMaoDeObra)}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                  <span>Total desta Ordem de Serviço:</span>
                  <span className="font-mono text-sm">{formatBRL(custoMateriais + Number(editMaoDeObra || 0))}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditFinancialsOpen(false)}
                  className="text-xs rounded-xl h-9 px-4 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0A2540] hover:bg-[#07192C] text-white text-xs font-semibold rounded-xl h-9 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Salvar Medição</span>
                    </>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Cadastrar Novo Contrato / Empenho Municipal */}
      <NewContractModal
        isOpen={isNewContractModalOpen}
        onClose={() => setIsNewContractModalOpen(false)}
        onContractCreated={handleContractCreated}
      />

    </div>
  );
}
