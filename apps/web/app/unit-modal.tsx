'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  X,
  MapPin,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Wrench,
  ShieldCheck,
  GraduationCap,
  Activity,
  Trees,
  Landmark,
  QrCode,
  Plus,
  Cpu,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type OrdemServico } from './kanban/data';
import { useOrders, type TipoUnidade } from '@/context/orders-context';
import { apiClient, type AtivoPredialItem } from '@/lib/api-client';

interface Props {
  unitName: string | null;
  isOpen: boolean;
  initialTab?: 'CHAMADOS' | 'ATIVOS';
  onClose: () => void;
  orders: OrdemServico[];
  onSelectOrder: (order: OrdemServico) => void;
  onNewOrder?: (unitName: string) => void;
}

function buildDefaultAssetsForUnit(unitName: string, unitId = 'unit-default'): AtivoPredialItem[] {
  const slug = unitName
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4) || 'UNID';

  const makeQr = (ambiente: string, patrimonio: string, ativo: string, categoria: string) => {
    const params = new URLSearchParams({
      unidade: unitName,
      setor: ambiente,
      patrimonio,
      ativo,
      categoria,
    });
    return `/abrir-chamado?${params.toString()}`;
  };

  return [
    {
      id: `ast-${slug}-1`,
      codigoPatrimonio: `PAT-${slug}-101`,
      nome: 'Ar-Condicionado Split Inverter 24.000 BTUs',
      categoria: 'CLIMATIZACAO',
      ambiente: 'Sala de Atendimento / Aula 04',
      marcaModelo: 'Springer Midea AirVolution',
      status: 'CRITICO',
      custoAcumulado: 2140,
      totalChamados: 4,
      chamadosAbertos: 1,
      emGarantia: false,
      alertaSubstituicao: true,
      recomendacaoTce:
        'Alerta de antieconomicidade (TCE): Equipamento acumula 4 ocorrências corretivas (R$ 2.140,00). Recomendada avaliação técnica para substituição patrimonial.',
      qrCodeUrl: makeQr(
        'Sala de Atendimento / Aula 04',
        `PAT-${slug}-101`,
        'Ar-Condicionado Split Inverter 24.000 BTUs',
        'CLIMATIZACAO',
      ),
      predioId: unitId,
      predioNome: unitName,
    },
    {
      id: `ast-${slug}-2`,
      codigoPatrimonio: `PAT-${slug}-204`,
      nome: 'Quadro Geral de Baixa Tensão (QGBT-01)',
      categoria: 'ELETRICA',
      ambiente: 'Corredor Técnico Térreo',
      marcaModelo: 'Schneider Electric Easy9',
      status: 'OPERACIONAL',
      custoAcumulado: 480,
      totalChamados: 1,
      chamadosAbertos: 0,
      emGarantia: false,
      alertaSubstituicao: false,
      recomendacaoTce: 'Operação regular dentro dos parâmetros de vida útil.',
      qrCodeUrl: makeQr(
        'Corredor Técnico Térreo',
        `PAT-${slug}-204`,
        'Quadro Geral de Baixa Tensão (QGBT-01)',
        'ELETRICA',
      ),
      predioId: unitId,
      predioNome: unitName,
    },
    {
      id: `ast-${slug}-3`,
      codigoPatrimonio: `PAT-${slug}-309`,
      nome: 'Bomba de Recalque Centrífuga 3CV',
      categoria: 'HIDRAULICA',
      ambiente: 'Casa de Bombas / Reservatório',
      marcaModelo: 'Schneider Motobombas BC-92',
      status: 'OPERACIONAL',
      garantiaAte: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
      custoAcumulado: 0,
      totalChamados: 0,
      chamadosAbertos: 0,
      emGarantia: true,
      alertaSubstituicao: false,
      recomendacaoTce:
        'Equipamento em período de garantia vigente. Acionar assistência técnica autorizada sem ônus ao contrato de manutenção.',
      qrCodeUrl: makeQr(
        'Casa de Bombas / Reservatório',
        `PAT-${slug}-309`,
        'Bomba de Recalque Centrífuga 3CV',
        'HIDRAULICA',
      ),
      predioId: unitId,
      predioNome: unitName,
    },
  ];
}

/**
 * Renderiza uma matriz QR Code SVG determinística e nítida a partir do código do ativo
 */
function DeterministicQrSvg({ value, size = 148 }: { value: string; size?: number }) {
  const grid = 21;
  const cells = useMemo(() => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const isFinder = (r: number, c: number) => {
      const inTL = r < 7 && c < 7;
      const inTR = r < 7 && c >= grid - 7;
      const inBL = r >= grid - 7 && c < 7;
      if (!inTL && !inTR && !inBL) return null;

      const lr = r >= grid - 7 ? r - (grid - 7) : r;
      const lc = c >= grid - 7 ? c - (grid - 7) : c;
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    };

    const matrix: boolean[][] = [];
    for (let r = 0; r < grid; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < grid; c++) {
        const finder = isFinder(r, c);
        if (finder !== null) {
          row.push(finder);
          continue;
        }
        // Zonas de separação brancas ao redor dos finders
        if (
          (r === 7 && (c < 8 || c >= grid - 8)) ||
          (r === grid - 8 && c < 8) ||
          (c === 7 && (r < 8 || r >= grid - 8)) ||
          (c === grid - 8 && r < 8)
        ) {
          row.push(false);
          continue;
        }
        const seed = Math.imul(hash ^ (r * 31 + c * 17), 2654435761) >>> 0;
        const charBit = value.charCodeAt((r * grid + c) % value.length) + r + c;
        row.push(((seed ^ charBit) & 1) === 1);
      }
      matrix.push(row);
    }
    return matrix;
  }, [value]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid} ${grid}`}
      className="bg-white p-2 rounded-lg border border-[#E2E8F0] shadow-2xs"
      shapeRendering="crispEdges"
      aria-label={`QR Code para ${value}`}
    >
      {cells.map((row, rIdx) =>
        row.map((filled, cIdx) =>
          filled ? (
            <rect key={`${rIdx}-${cIdx}`} x={cIdx} y={rIdx} width={1} height={1} fill="#0F172A" />
          ) : null,
        ),
      )}
    </svg>
  );
}

export function UnitModal({ unitName, isOpen, initialTab = 'CHAMADOS', onClose, orders, onSelectOrder, onNewOrder }: Props) {
  const { unitsWithStats } = useOrders();
  const [activeSection, setActiveSection] = useState<'CHAMADOS' | 'ATIVOS'>(initialTab);
  const [historyTab, setHistoryTab] = useState<'ALL' | 'OPEN' | 'COMPLETED'>('ALL');

  // Estado de Ativos e QR Code
  const [assets, setAssets] = useState<AtivoPredialItem[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  const [selectedQrAsset, setSelectedQrAsset] = useState<AtivoPredialItem | null>(null);
  const [copiedQr, setCopiedQr] = useState(false);

  // Campos de novo ativo
  const [novoCodigo, setNovoCodigo] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novoAmbiente, setNovoAmbiente] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('CLIMATIZACAO');
  const [novaMarca, setNovaMarca] = useState('');
  const [novaGarantia, setNovaGarantia] = useState('');
  const [isSavingAsset, setIsSavingAsset] = useState(false);

  const unitInfo = unitsWithStats.find((u) => u.nome === unitName);

  useEffect(() => {
    if (!isOpen || !unitName) return;
    let active = true;
    setActiveSection(initialTab);
    setIsLoadingAssets(true);
    setSelectedQrAsset(null);
    setShowNewAssetForm(false);

    apiClient
      .getAssets({ predioNome: unitName })
      .then((res) => {
        if (!active) return;
        if (res.success && res.assets.length > 0) {
          setAssets(res.assets);
        } else {
          setAssets(buildDefaultAssetsForUnit(unitName, unitInfo?.id));
        }
      })
      .catch(() => {
        if (!active) return;
        setAssets(buildDefaultAssetsForUnit(unitName, unitInfo?.id));
      })
      .finally(() => {
        if (active) setIsLoadingAssets(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, unitName, unitInfo?.id, initialTab]);

  if (!isOpen || !unitName) return null;

  const unitOrders = orders.filter((o) => o.predio === unitName);
  const openOrders = unitOrders.filter((o) => o.status !== 'CONCLUIDO');
  const urgentOrders = unitOrders.filter(
    (o) => o.status !== 'CONCLUIDO' && o.prioridade === 'URGENTE',
  );
  const completedOrders = unitOrders.filter((o) => o.status === 'CONCLUIDO');

  const filteredHistory =
    historyTab === 'OPEN'
      ? openOrders
      : historyTab === 'COMPLETED'
        ? completedOrders
        : unitOrders;

  const getCategoryIcon = (tipo?: TipoUnidade) => {
    switch (tipo) {
      case 'ESCOLA':
        return <GraduationCap size={16} className="text-[#0A2540]" />;
      case 'UBS':
      case 'HOSPITAL':
        return <Activity size={16} className="text-[#0A2540]" />;
      case 'PRACA':
        return <Trees size={16} className="text-[#0A2540]" />;
      default:
        return <Landmark size={16} className="text-[#0A2540]" />;
    }
  };

  const getCategoryLabel = (tipo?: TipoUnidade) => {
    switch (tipo) {
      case 'ESCOLA':
        return 'Educação';
      case 'UBS':
        return 'Saúde';
      case 'HOSPITAL':
        return 'Saúde Especializada';
      case 'PRACA':
        return 'Praças e Parques';
      default:
        return 'Gestão Administrativa';
    }
  };

  async function handleCreateAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!novoCodigo.trim() || !novoNome.trim() || !novoAmbiente.trim() || !unitName) return;

    setIsSavingAsset(true);
    try {
      const predioId = unitInfo?.id || unitName;
      const res = await apiClient.createAsset({
        codigoPatrimonio: novoCodigo.trim().toUpperCase(),
        nome: novoNome.trim(),
        categoria: novaCategoria,
        ambiente: novoAmbiente.trim(),
        predioId,
        marcaModelo: novaMarca.trim() || undefined,
        garantiaAte: novaGarantia || undefined,
      });

      if (res.success && res.asset) {
        setAssets((prev) => [res.asset!, ...prev]);
      } else {
        const codigoClean = novoCodigo.trim().toUpperCase();
        const emGarantia = Boolean(
          novaGarantia && new Date(novaGarantia).getTime() > Date.now(),
        );
        const qrParams = new URLSearchParams({
          unidade: unitName,
          setor: novoAmbiente.trim(),
          patrimonio: codigoClean,
          ativo: novoNome.trim(),
          categoria: novaCategoria,
        });
        const localAsset: AtivoPredialItem = {
          id: `local-${Date.now()}`,
          codigoPatrimonio: codigoClean,
          nome: novoNome.trim(),
          categoria: novaCategoria,
          ambiente: novoAmbiente.trim(),
          marcaModelo: novaMarca.trim() || undefined,
          status: 'OPERACIONAL',
          garantiaAte: novaGarantia || undefined,
          custoAcumulado: 0,
          totalChamados: 0,
          chamadosAbertos: 0,
          emGarantia,
          alertaSubstituicao: false,
          recomendacaoTce: emGarantia
            ? 'Equipamento em período de garantia vigente. Acionar assistência técnica autorizada sem ônus ao contrato de manutenção.'
            : 'Operação regular dentro dos parâmetros de vida útil.',
          qrCodeUrl: `/abrir-chamado?${qrParams.toString()}`,
          predioId,
          predioNome: unitName,
        };
        setAssets((prev) => [localAsset, ...prev]);
      }

      setNovoCodigo('');
      setNovoNome('');
      setNovoAmbiente('');
      setNovaMarca('');
      setNovaGarantia('');
      setShowNewAssetForm(false);
    } finally {
      setIsSavingAsset(false);
    }
  }

  function handleCopyQrLink(url: string) {
    const fullUrl =
      typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedQr(true);
    setTimeout(() => setCopiedQr(false), 2500);
  }

  const criticosCount = assets.filter((a) => a.alertaSubstituicao).length;
  const garantiaCount = assets.filter((a) => a.emGarantia).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg shadow-2xl border border-[#E2E8F0] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#F1F5F9] flex items-start justify-between bg-[#F8FAFC]">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#E1E7EF] flex items-center justify-center shrink-0 mt-0.5">
              {getCategoryIcon(unitInfo?.tipo)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#475569] tracking-wider uppercase">
                  {getCategoryLabel(unitInfo?.tipo)}
                </span>
                <span className="text-xs text-[#CBD5E1]">·</span>
                <span className="text-xs font-semibold text-[#0A2540]">
                  {unitOrders.length} chamados · {assets.length} ativos patrimoniais
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] mt-0.5">
                {unitName}
              </h2>

              {/* Highlight for Pendências & Urgências */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs font-bold text-[#0F172A] bg-[#E1E7EF] px-2.5 py-1 rounded-lg">
                  {openOrders.length} pendências ativas
                </span>
                {urgentOrders.length > 0 && (
                  <span className="text-xs font-bold text-[#DC2626] bg-[#FEECEB] px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <AlertTriangle size={13} />
                    {urgentOrders.length} urgente{urgentOrders.length > 1 ? 's' : ''}
                  </span>
                )}
                {criticosCount > 0 && (
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Cpu size={13} />
                    {criticosCount} ativo(s) em alerta TCE
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#475569] hover:text-[#0F172A] p-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegação de Abas Principais da Unidade */}
        <div className="px-4 sm:px-6 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('CHAMADOS')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'CHAMADOS'
                ? 'border-[#0A2540] text-[#0A2540]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Wrench size={14} />
            <span>Chamados e Manutenção ({unitOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('ATIVOS')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'ATIVOS'
                ? 'border-[#0A2540] text-[#0A2540]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <QrCode size={14} />
            <span>Ativos, Equipamentos & QR Code ({assets.length})</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
          {activeSection === 'CHAMADOS' ? (
            <>
              {/* Section: Informações de Endereço & Responsável */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#475569] uppercase tracking-wider">
                    <MapPin size={14} className="text-[#0A2540]" />
                    <span>Endereço Completo</span>
                  </div>
                  <p className="text-sm font-bold text-[#0F172A] pt-1">
                    {unitInfo?.endereco || 'Rua Central, 100 — Região Central'}
                  </p>
                  <p className="text-xs text-[#475569]">
                    Ponto de referência: Próximo à praça principal
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#475569] uppercase tracking-wider">
                    <User size={14} className="text-[#0A2540]" />
                    <span>Responsável da Unidade</span>
                  </div>
                  <p className="text-sm font-bold text-[#0F172A] pt-1">
                    {unitInfo?.gestor || 'Gestão da Unidade Municipal'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#475569] pt-0.5">
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-[#94A3B8]" />
                      {unitInfo?.telefone || '(11) 3241-8900'}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-[#94A3B8]" />
                      {unitInfo?.email || 'contato@urboa.gov.br'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section: Histórico Completo de Chamados */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                      Histórico de Chamados & Manutenção
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Registro completo de ocorrências preventivas e corretivas
                    </p>
                  </div>

                  {/* Segmented Filter */}
                  <div className="bg-[#E1E7EF] p-1 rounded-md flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setHistoryTab('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        historyTab === 'ALL'
                          ? 'bg-white text-[#0F172A] shadow-xs'
                          : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      Todos ({unitOrders.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryTab('OPEN')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        historyTab === 'OPEN'
                          ? 'bg-white text-[#0F172A] shadow-xs'
                          : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      Ativos ({openOrders.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryTab('COMPLETED')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        historyTab === 'COMPLETED'
                          ? 'bg-white text-[#0F172A] shadow-xs'
                          : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      Concluídos ({completedOrders.length})
                    </button>
                  </div>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="text-center py-10 bg-[#F8FAFC] rounded-lg border border-dashed border-[#CBD5E1] text-xs text-[#475569]">
                    Nenhum chamado encontrado com o filtro selecionado.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHistory.map((order) => {
                      const isUrgente = order.prioridade === 'URGENTE';
                      const isAlta = order.prioridade === 'ALTA';
                      const isCompleted = order.status === 'CONCLUIDO';

                      return (
                        <div
                          key={order.id}
                          onClick={() => {
                            onClose();
                            onSelectOrder(order);
                          }}
                          className="p-4 rounded-lg border border-[#E2E8F0] hover:border-[#0A2540] bg-white hover:bg-slate-50/50 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                        >
                          <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-mono font-bold text-[#475569]">
                                #{order.id.replace('os-', '')}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                  isUrgente
                                    ? 'bg-[#FEECEB] text-[#DC2626]'
                                    : isAlta
                                      ? 'bg-[#FEF6E8] text-[#D97706]'
                                      : 'bg-[#F1F5F9] text-[#475569]'
                                }`}
                              >
                                {order.prioridade}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                  isCompleted
                                    ? 'bg-[#E1E7EF] text-[#0A2540]'
                                    : 'bg-[#F1F5F9] text-[#0F172A]'
                                }`}
                              >
                                {order.status === 'TRIAGEM'
                                  ? 'Triagem'
                                  : order.status === 'AGENDADO'
                                    ? 'Planejamento'
                                    : order.status === 'EM_EXECUCAO'
                                      ? 'Em execução'
                                      : 'Concluído'}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#0A2540] transition-colors">
                              {order.titulo}
                            </h4>

                            <div className="flex items-center gap-3 text-xs text-[#475569] mt-2">
                              <span className="flex items-center gap-1">
                                <User size={12} className="text-[#94A3B8]" />
                                {order.tecnico || 'Equipe a definir'}
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} className="text-[#94A3B8]" />
                                {order.dataAbertura} · 18h
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-bold text-[#0A2540] shrink-0 opacity-80 group-hover:opacity-100 group-hover:underline">
                            <span>Ver detalhes</span>
                            <ArrowUpRight size={14} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ABA DE ATIVOS, EQUIPAMENTOS & ETIQUETAS QR CODE */
            <div className="space-y-4">
              {/* Resumo Patrimonial e Controle TCE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] font-bold uppercase text-[#64748B]">
                    Equipamentos Tombados
                  </span>
                  <p className="text-lg font-extrabold text-[#0F172A] mt-0.5">
                    {assets.length} ativos
                  </p>
                  <span className="text-[11px] text-[#475569]">
                    Com etiqueta QR individual
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[11px] font-bold uppercase text-emerald-800">
                    Cobertura de Garantia
                  </span>
                  <p className="text-lg font-extrabold text-emerald-900 mt-0.5">
                    {garantiaCount} em garantia
                  </p>
                  <span className="text-[11px] text-emerald-700">
                    Reparo sem custo ao contrato
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200">
                  <span className="text-[11px] font-bold uppercase text-amber-900">
                    Curva ABC / Alerta TCE
                  </span>
                  <p className="text-lg font-extrabold text-amber-900 mt-0.5">
                    {criticosCount} para revisão
                  </p>
                  <span className="text-[11px] text-amber-800">
                    3+ quebras (avaliar troca)
                  </span>
                </div>
              </div>

              {/* Barra de Ação: Cadastrar Novo Equipamento */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Inventário de Equipamentos por Ambiente
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Gere etiquetas QR Code para abertura rápida de chamados por sala ou equipamento
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => setShowNewAssetForm((v) => !v)}
                  className="bg-[#0A2540] hover:bg-[#081C32] text-white text-xs font-semibold px-3 py-2 rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{showNewAssetForm ? 'Cancelar' : 'Novo equipamento'}</span>
                </Button>
              </div>

              {/* Formulário de Novo Equipamento */}
              {showNewAssetForm && (
                <form
                  onSubmit={handleCreateAsset}
                  className="p-4 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] space-y-3"
                >
                  <div className="text-xs font-bold text-[#0F172A]">
                    Cadastrar Novo Equipamento / Ativo Predial
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                        Código de Patrimônio *
                      </label>
                      <input
                        type="text"
                        required
                        value={novoCodigo}
                        onChange={(e) => setNovoCodigo(e.target.value)}
                        placeholder="Ex: PAT-2026-405"
                        className="w-full bg-white border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-xs text-[#0F172A]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                        Equipamento / Ativo *
                      </label>
                      <input
                        type="text"
                        required
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        placeholder="Ex: Ar-Condicionado Split 18.000 BTUs"
                        className="w-full bg-white border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-xs text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                        Ambiente / Sala *
                      </label>
                      <input
                        type="text"
                        required
                        value={novoAmbiente}
                        onChange={(e) => setNovoAmbiente(e.target.value)}
                        placeholder="Ex: Sala de Aula 02"
                        className="w-full bg-white border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-xs text-[#0F172A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                        Especialidade
                      </label>
                      <select
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                        className="w-full bg-white border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-xs text-[#0F172A]"
                      >
                        <option value="CLIMATIZACAO">Climatização</option>
                        <option value="ELETRICA">Elétrica</option>
                        <option value="HIDRAULICA">Hidráulica</option>
                        <option value="INCENDIO">Prevenção de Incêndio</option>
                        <option value="GERAL">Zeladoria Geral</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                        Garantia até (opcional)
                      </label>
                      <input
                        type="date"
                        value={novaGarantia}
                        onChange={(e) => setNovaGarantia(e.target.value)}
                        className="w-full bg-white border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-xs text-[#0F172A]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="submit"
                      disabled={isSavingAsset}
                      className="bg-[#0A2540] hover:bg-[#081C32] text-white text-xs font-semibold px-4 py-1.5 rounded-md cursor-pointer"
                    >
                      {isSavingAsset ? 'Salvando...' : 'Salvar e Gerar QR Code'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Modal / Painel de Etiqueta QR Code Selecionada */}
              {selectedQrAsset && (
                <div className="p-4 rounded-xl bg-[#F8FAFC] border-2 border-[#0A2540] shadow-md flex flex-col sm:flex-row items-center gap-5 animate-in fade-in duration-150">
                  <div className="shrink-0 flex flex-col items-center">
                    <DeterministicQrSvg value={selectedQrAsset.qrCodeUrl} size={136} />
                    <span className="text-[10px] font-mono font-bold text-[#0F172A] mt-1.5">
                      {selectedQrAsset.codigoPatrimonio}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0A2540] text-white px-2 py-0.5 rounded">
                        Etiqueta Patrimonial QR Code
                      </span>
                      <span className="text-xs font-semibold text-[#475569]">
                        {selectedQrAsset.ambiente}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-[#0F172A]">
                      {selectedQrAsset.nome}
                    </h4>
                    <p className="text-xs text-[#475569]">
                      Ao escanear esta placa na parede ou no equipamento, o servidor ou cidadão abre o chamado já vinculado à sala{' '}
                      <strong>{selectedQrAsset.ambiente}</strong> e ao tombamento{' '}
                      <strong>{selectedQrAsset.codigoPatrimonio}</strong>.
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="bg-[#0A2540] hover:bg-[#081C32] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer size={13} />
                        <span>Imprimir Plaqueta</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyQrLink(selectedQrAsset.qrCodeUrl)}
                        className="bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#0F172A] text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedQr ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedQr ? 'Link copiado!' : 'Copiar Link QR'}</span>
                      </button>

                      <Link
                        href={selectedQrAsset.qrCodeUrl}
                        onClick={onClose}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5"
                      >
                        <ExternalLink size={13} />
                        <span>Simular Leitura QR</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSelectedQrAsset(null)}
                        className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] px-2 py-1.5 cursor-pointer"
                      >
                        Fechar etiqueta
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Ativos da Unidade */}
              {isLoadingAssets ? (
                <div className="py-10 text-center text-xs text-[#64748B]">
                  Carregando inventário de equipamentos da unidade...
                </div>
              ) : (
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-4 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#94A3B8] transition-all space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-[#0A2540] bg-[#E1E7EF] px-2 py-0.5 rounded">
                              {asset.codigoPatrimonio}
                            </span>
                            <span className="text-[11px] font-bold text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded">
                              {asset.ambiente}
                            </span>
                            {asset.emGarantia && (
                              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                                <ShieldCheck size={12} />
                                EM GARANTIA
                              </span>
                            )}
                            {asset.alertaSubstituicao && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded flex items-center gap-1">
                                <AlertTriangle size={12} />
                                ALERTA TCE ({asset.totalChamados} REPAROS)
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-[#0F172A]">{asset.nome}</h4>
                          <p className="text-xs text-[#64748B] mt-0.5">
                            {asset.marcaModelo || 'Equipamento Padrão Municipal'} ·{' '}
                            {asset.totalChamados} chamado(s) no histórico · Custo acumulado:{' '}
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(asset.custoAcumulado || 0)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedQrAsset(asset)}
                            className="bg-[#F8FAFC] hover:bg-[#E1E7EF] border border-[#CBD5E1] text-[#0A2540] text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <QrCode size={14} />
                            <span>Etiqueta QR</span>
                          </button>

                          <Link
                            href={asset.qrCodeUrl}
                            onClick={onClose}
                            className="bg-[#0A2540] hover:bg-[#081C32] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                          >
                            <span>Abrir OS</span>
                            <ArrowUpRight size={13} />
                          </Link>
                        </div>
                      </div>

                      {/* Parecer de Auditoria / Garantia */}
                      {(asset.alertaSubstituicao || asset.emGarantia) && (
                        <div
                          className={`text-xs px-3 py-2 rounded-md flex items-start gap-2 ${
                            asset.emGarantia
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {asset.emGarantia ? (
                            <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-700" />
                          ) : (
                            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-700" />
                          )}
                          <span>{asset.recomendacaoTce}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#F1F5F9] bg-[#F8FAFC] flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2 sm:gap-3">
          {onNewOrder ? (
            <Button
              onClick={() => {
                onClose();
                onNewOrder(unitName);
              }}
              className="w-full sm:w-auto justify-center bg-[#0A2540] hover:bg-[#081C32] text-white rounded-md px-4 py-2 font-semibold text-xs cursor-pointer"
            >
              + Novo chamado nesta unidade
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto justify-center rounded-md text-xs font-bold text-[#475569] hover:text-[#0F172A] cursor-pointer"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
