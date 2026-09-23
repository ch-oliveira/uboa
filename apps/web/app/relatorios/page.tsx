'use client';

import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Printer, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  Building2, 
  ShieldCheck, 
  Award, 
  Zap, 
  Droplets, 
  ArrowUpRight, 
  Sparkles, 
  FileText, 
  X,
  Eye,
  DoorOpen,
  Paintbrush
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';
import { useOrders } from '@/context/orders-context';
import { TECNICOS } from '../kanban/data';

type PeriodOption = 'MES_ATUAL' | 'ULTIMOS_30' | 'TRIMESTRE' | 'ANO_2026';

// Helper functions for Donut polar arc generation
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeDonutSlice(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
) {
  const deltaAngle = endAngle - startAngle;
  if (deltaAngle <= 0) return '';
  const safeDelta = Math.min(deltaAngle, 359.999);
  const safeEndAngle = startAngle + safeDelta;

  const startOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, safeEndAngle);
  const startInner = polarToCartesian(cx, cy, innerR, safeEndAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);

  const largeArcFlag = safeDelta > 180 ? 1 : 0;

  return [
    `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
    `L ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

export default function RelatoriosPage() {
  const { 
    orders, 
    unitsWithStats, 
    activities, 
    stats 
  } = useOrders();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('MES_ATUAL');
  const [activeDonutHover, setActiveDonutHover] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Period multiplier for simulated timeframes
  const multiplier = useMemo(() => {
    switch (selectedPeriod) {
      case 'ULTIMOS_30': return 1.2;
      case 'TRIMESTRE': return 2.8;
      case 'ANO_2026': return 8.5;
      case 'MES_ATUAL':
      default: return 1.0;
    }
  }, [selectedPeriod]);

  const periodLabel = useMemo(() => {
    switch (selectedPeriod) {
      case 'ULTIMOS_30': return 'Últimos 30 Dias (Agosto - Setembro 2026)';
      case 'TRIMESTRE': return '3º Trimestre de 2026 (Julho a Setembro)';
      case 'ANO_2026': return 'Ano Fiscal de 2026';
      case 'MES_ATUAL':
      default: return 'Mês de Setembro / 2026';
    }
  }, [selectedPeriod]);

  // Metrics Calculations
  const metrics = useMemo(() => {
    const rawTotal = orders.length;
    const total = Math.round(rawTotal * multiplier);
    const concluidos = Math.round(stats.concluidos * multiplier);
    const taxaResolucao = total > 0 ? Math.round((concluidos / total) * 100) : 100;
    
    // Priority counts
    const urgentes = Math.round(orders.filter(o => o.prioridade === 'URGENTE').length * multiplier);
    const altas = Math.round(orders.filter(o => o.prioridade === 'ALTA').length * multiplier);
    const medias = Math.round(orders.filter(o => o.prioridade === 'MEDIA').length * multiplier);
    const baixas = Math.max(1, total - (urgentes + altas + medias));

    // Status counts
    const triagem = Math.round(stats.triagem * multiplier);
    const agendados = Math.round(orders.filter(o => o.status === 'AGENDADO').length * multiplier);
    const emExecucao = Math.round(stats.emExecucao * multiplier);
    const aguardando = Math.round(stats.aguardando * multiplier);

    // By category
    const educacao = Math.round(orders.filter(o => o.predio.startsWith('EMEF') || o.predio.startsWith('EMEI')).length * multiplier);
    const saude = Math.round(orders.filter(o => o.predio.startsWith('UBS') || o.predio.includes('Hospital')).length * multiplier);
    const admin = Math.round(orders.filter(o => o.predio.includes('Prefeitura') || o.predio.includes('Secretaria') || o.predio.includes('Biblioteca')).length * multiplier);
    const pracas = Math.round(orders.filter(o => o.predio.includes('Praça') || o.predio.includes('Parque')).length * multiplier);

    // Specialties / categories breakdown
    const hidraulica = Math.round(total * 0.38);
    const eletrica = Math.round(total * 0.28);
    const acessibilidade = Math.round(total * 0.20);
    const alvenaria = Math.max(1, total - (hidraulica + eletrica + acessibilidade));

    return {
      total,
      concluidos,
      taxaResolucao,
      urgentes,
      altas,
      medias,
      baixas,
      triagem,
      agendados,
      emExecucao,
      aguardando,
      educacao,
      saude,
      admin,
      pracas,
      hidraulica,
      eletrica,
      acessibilidade,
      alvenaria,
    };
  }, [orders, stats, multiplier]);

  // Donut Chart Math & Precision Slices
  const donutData = useMemo(() => {
    const total = metrics.total || 1;
    const rawSlices = [
      { 
        id: 'URGENTE', 
        label: 'Urgente', 
        count: metrics.urgentes, 
        color: '#F43F5E', 
        hoverColor: '#E11D48', 
        lightBg: '#FFF1F2', 
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200' 
      },
      { 
        id: 'ALTA', 
        label: 'Alta Prioridade', 
        count: metrics.altas, 
        color: '#F59E0B', 
        hoverColor: '#D97706', 
        lightBg: '#FFFBEB', 
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200' 
      },
      { 
        id: 'MEDIA', 
        label: 'Média Prioridade', 
        count: metrics.medias, 
        color: '#2563EB', 
        hoverColor: '#1D4ED8', 
        lightBg: '#EFF6FF', 
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200' 
      },
      { 
        id: 'BAIXA', 
        label: 'Baixa Prioridade', 
        count: metrics.baixas, 
        color: '#64748B', 
        hoverColor: '#475569', 
        lightBg: '#F8FAFC', 
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200' 
      },
    ];

    const positiveSlices = rawSlices.filter(s => s.count > 0);
    const positiveCount = positiveSlices.length;
    const padAngle = positiveCount > 1 ? 4.0 : 0;
    const totalGap = positiveCount * padAngle;
    const availableDegrees = 360 - totalGap;

    let currentAngle = 0;

    return rawSlices.map((slice) => {
      const percentage = Math.round((slice.count / total) * 100);
      if (slice.count <= 0) {
        return {
          ...slice,
          percentage: 0,
          startAngle: 0,
          endAngle: 0,
          normalPath: '',
          hoverPath: '',
        };
      }

      const sliceAngle = positiveCount === 1 
        ? 360 
        : (slice.count / total) * availableDegrees;
      
      const startAngle = positiveCount === 1 ? 0 : currentAngle + padAngle / 2;
      const endAngle = startAngle + sliceAngle;
      currentAngle = positiveCount === 1 ? 360 : endAngle + padAngle / 2;

      // Base ring: cx=100, cy=100, innerR=56, outerR=82
      const normalPath = describeDonutSlice(100, 100, 56, 82, startAngle, endAngle);
      // Hover ring: outer expands to 88, inner tucks to 54
      const hoverPath = describeDonutSlice(100, 100, 54, 88, startAngle, endAngle);

      return {
        ...slice,
        percentage,
        startAngle,
        endAngle,
        normalPath,
        hoverPath,
      };
    });
  }, [metrics]);

  const activeHoveredSlice = useMemo(() => {
    const activeId = activeDonutHover || selectedPriority;
    return donutData.find(d => d.id === activeId) || null;
  }, [donutData, activeDonutHover, selectedPriority]);

  // Weekly Activity Bar Chart Data
  const weeklyBars = useMemo(() => {
    return [
      { day: 'Seg', abertos: 4, resolvidos: 3, maxH: 7 },
      { day: 'Ter', abertos: 6, resolvidos: 5, maxH: 7 },
      { day: 'Qua', abertos: 5, resolvidos: 4, maxH: 7 },
      { day: 'Qui', abertos: 3, resolvidos: 2, maxH: 7 },
      { day: 'Sex', abertos: 7, resolvidos: 6, maxH: 7 },
      { day: 'Sáb', abertos: 2, resolvidos: 2, maxH: 7 },
      { day: 'Dom', abertos: 0, resolvidos: 0, maxH: 7 },
    ];
  }, []);

  // Technician Leaderboard
  const techPerformance = useMemo(() => {
    return TECNICOS.map((tech) => {
      const techOrders = orders.filter(o => o.tecnico === tech);
      const inProgress = Math.round(techOrders.filter(o => o.status === 'EM_EXECUCAO').length * multiplier);
      const completed = Math.round(techOrders.filter(o => o.status === 'CONCLUIDO').length * multiplier);
      const total = inProgress + completed + Math.round(techOrders.length * 0.5 * multiplier);
      const rate = total > 0 ? Math.round((completed / total) * 100) : 100;
      const mttr = (3.5 + (tech.length % 3) * 0.6).toFixed(1);

      return {
        name: tech,
        total,
        inProgress,
        completed,
        rate,
        mttr,
      };
    }).sort((a, b) => b.completed - a.completed);
  }, [orders, multiplier]);

  // Top 5 units with most issues
  const topUnits = useMemo(() => {
    return [...unitsWithStats]
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 5);
  }, [unitsWithStats]);

  function handlePrint() {
    window.print();
  }

  function handleExportCSV() {
    const headers = ['Indicador', 'Valor Registrado', 'Unidade de Medida'];
    const rows = [
      ['Total de Ordens Registradas', metrics.total, 'chamados'],
      ['Ordens Concluídas', metrics.concluidos, 'chamados'],
      ['Taxa Geral de Resolução', `${metrics.taxaResolucao}%`, 'percentual'],
      ['Tempo Médio de Atendimento (MTTR)', '4.8', 'horas'],
      ['Eficiência Preventiva', '91%', 'percentual'],
      ['Chamados Urgentes', metrics.urgentes, 'chamados'],
      ['Chamados Alta Prioridade', metrics.altas, 'chamados'],
      ['Chamados Média Prioridade', metrics.medias, 'chamados'],
      ['Chamados Baixa Prioridade', metrics.baixas, 'chamados'],
      ['Setor Educação', metrics.educacao, 'ocorrências'],
      ['Setor Saúde', metrics.saude, 'ocorrências'],
      ['Setor Administrativo', metrics.admin, 'ocorrências'],
      ['Especialidade Hidráulica', metrics.hidraulica, 'ocorrências'],
      ['Especialidade Elétrica', metrics.eletrica, 'ocorrências'],
      ['Especialidade Acessibilidade', metrics.acessibilidade, 'ocorrências'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_executivo_zelo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. ON-SCREEN INTERACTIVE DASHBOARD VIEW (HIDDEN ON PRINT)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden print:hidden">
        
        {/* Sidebar */}
        <Sidebar currentRoute="/relatorios" />

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Top Header */}
          <header className="h-16 flex items-center justify-between px-8 bg-white/70 backdrop-blur-md border-b border-slate-100 shrink-0">
            <div className="text-sm text-slate-500 font-medium">
              Gestão municipal <span className="mx-2">/</span> <span className="text-slate-800 font-bold">Relatórios e Indicadores</span>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={handleExportCSV}
                className="rounded-lg text-xs font-semibold h-10 border-slate-200"
              >
                <Download size={14} className="mr-1.5 text-slate-500" />
                Exportar CSV
              </Button>

              <Button 
                variant="outline"
                onClick={() => setIsPreviewModalOpen(true)}
                className="rounded-lg text-xs font-semibold h-10 border-slate-200 hover:border-[#1D6FEB] hover:text-[#1D6FEB]"
              >
                <Eye size={14} className="mr-1.5 text-slate-500" />
                Prévia do Documento
              </Button>

              <Button 
                onClick={handlePrint}
                className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white rounded-lg text-xs font-semibold h-10 shadow-sm"
              >
                <Printer size={14} className="mr-1.5" />
                Imprimir Relatório
              </Button>
            </div>
          </header>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            
            {/* Header Title & Period Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1D6FEB] bg-blue-50 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                    <Sparkles size={13} />
                    Inteligência e Gestão Estratégica
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• Zelo Municipal</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Painel Executivo de Manutenção Predial
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Acompanhe indicadores de conformidade, tempo de resposta, custos e capacidade operacional.
                </p>
              </div>

              {/* Interactive Period Toggle */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                {[
                  { id: 'MES_ATUAL', label: 'Este Mês' },
                  { id: 'ULTIMOS_30', label: 'Últimos 30d' },
                  { id: 'TRIMESTRE', label: '3º Trimestre' },
                  { id: 'ANO_2026', label: 'Ano 2026' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPeriod(p.id as PeriodOption)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedPeriod === p.id
                        ? 'bg-[#1D6FEB] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 HIGH-IMPACT KPI CARDS */}
            <div className="grid grid-cols-4 gap-5">
              
              {/* 1. Total de Ordens */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordens Registradas</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D6FEB] flex items-center justify-center">
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.total}</div>
                  <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <ArrowUpRight size={14} />
                    <span>+14.2%</span> 
                    <span className="text-slate-400 font-normal">vs. ciclo anterior</span>
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Fluxo diário contínuo</span>
                  <svg className="w-20 h-6 overflow-visible">
                    <path 
                      d="M 0 18 Q 10 12, 20 16 T 40 8 T 60 14 T 80 2" 
                      fill="none" 
                      stroke="#1D6FEB" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* 2. Taxa de Resolução */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taxa de Resolução</span>
                  <div className="text-3xl font-extrabold text-emerald-700 mt-2">{metrics.taxaResolucao}%</div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {metrics.concluidos} concluídas de {metrics.total}
                  </p>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 mt-2 rounded bg-emerald-100 text-emerald-800">
                    Meta mensal: 80%
                  </span>
                </div>

                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="26" 
                      stroke="#10B981" 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 26}
                      strokeDashoffset={(2 * Math.PI * 26) * (1 - metrics.taxaResolucao / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <CheckCircle2 size={18} className="absolute text-emerald-600" />
                </div>
              </div>

              {/* 3. MTTR */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tempo Médio (MTTR)</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-2">4.8h</div>
                  <p className="text-xs text-emerald-600 font-bold mt-1">
                    2.2h abaixo do SLA máximo
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <span>Atual: 4.8h</span>
                    <span>SLA: 8.0h</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>

              {/* 4. Eficiência Preventiva */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eficiência Preventiva</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <ShieldCheck size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-purple-700 mt-2">91%</div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Inspeções periódicas em dia
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Certificação Municipal</span>
                  <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Classe A</span>
                </div>
              </div>

            </div>

            {/* CHARTS ROW 1: SVG DONUT & BAR CHART */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* DONUT */}
              <div className="col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">Distribuição por Criticidade</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {metrics.total} {metrics.total === 1 ? 'chamado' : 'chamados'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Severidade e urgência operacional</p>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                      <AlertTriangle size={18} />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 py-2 my-auto">
                    {/* SVG Donut */}
                    <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 200 200" className="w-48 h-48 overflow-visible">
                        {/* Background subtle ring */}
                        <circle cx="100" cy="100" r="69" stroke="#F1F5F9" strokeWidth="26" fill="transparent" />

                        {/* Slices */}
                        {donutData.map((slice) => {
                          if (slice.count <= 0) return null;
                          const isHovered = (activeDonutHover || selectedPriority) === slice.id;
                          return (
                            <path
                              key={slice.id}
                              d={isHovered ? slice.hoverPath : slice.normalPath}
                              fill={isHovered ? slice.hoverColor : slice.color}
                              className="cursor-pointer transition-all duration-300 ease-out"
                              style={{
                                filter: isHovered ? `drop-shadow(0 6px 14px ${slice.color}88)` : 'none',
                                opacity: (activeDonutHover || selectedPriority) && !isHovered ? 0.45 : 1,
                              }}
                              onMouseEnter={() => setActiveDonutHover(slice.id)}
                              onMouseLeave={() => setActiveDonutHover(null)}
                              onClick={() => setSelectedPriority(selectedPriority === slice.id ? null : slice.id)}
                            />
                          );
                        })}
                      </svg>

                      {/* Dynamic Center Display */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center p-3">
                        {activeHoveredSlice ? (
                          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                            <span 
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1"
                              style={{ color: activeHoveredSlice.hoverColor, backgroundColor: activeHoveredSlice.lightBg }}
                            >
                              {activeHoveredSlice.label.replace(' Prioridade', '')}
                            </span>
                            <span 
                              className="text-3xl font-black tracking-tight leading-none"
                              style={{ color: activeHoveredSlice.color }}
                            >
                              {activeHoveredSlice.count}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 mt-1">
                              {activeHoveredSlice.percentage}% do total
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center animate-in fade-in duration-150">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest text-slate-400 bg-slate-100 mb-1">
                              Total
                            </span>
                            <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                              {metrics.total}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                              Ordens
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interactive Legend with Micro Progress Bars */}
                    <div className="flex-1 w-full flex flex-col justify-center space-y-2">
                      {donutData.map((slice) => {
                        const isHovered = (activeDonutHover || selectedPriority) === slice.id;
                        return (
                          <div 
                            key={slice.id}
                            onMouseEnter={() => setActiveDonutHover(slice.id)}
                            onMouseLeave={() => setActiveDonutHover(null)}
                            onClick={() => setSelectedPriority(selectedPriority === slice.id ? null : slice.id)}
                            className={`group p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                              isHovered 
                                ? 'bg-slate-50 border-slate-300 shadow-xs ring-1 ring-slate-200/50' 
                                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span 
                                  className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform ${isHovered ? 'scale-125' : ''}`}
                                  style={{ backgroundColor: slice.color }} 
                                />
                                <span className={`text-xs font-semibold truncate ${isHovered ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                                  {slice.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-xs font-extrabold text-slate-900">
                                  {slice.count}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${slice.badgeBg}`}>
                                  {slice.percentage}%
                                </span>
                              </div>
                            </div>

                            {/* Micro progress bar */}
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${slice.percentage}%`, 
                                  backgroundColor: slice.color 
                                }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Alert Banner */}
                {metrics.urgentes > 0 ? (
                  <div className="p-3 bg-gradient-to-r from-rose-50 to-amber-50/50 border border-rose-200/90 rounded-xl text-xs text-rose-950 flex items-center justify-between gap-3 shadow-xs mt-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 text-rose-600">
                        <AlertTriangle size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-rose-900 leading-tight">
                          Atenção Crítica de SLA
                        </p>
                        <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                          <strong className="font-bold">{metrics.urgentes} {metrics.urgentes === 1 ? 'chamado urgente requer' : 'chamados urgentes requerem'}</strong> prioridade imediata para cumprimento do SLA.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-rose-600 text-white shrink-0 shadow-xs">
                      Prioritário
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-center gap-2.5 mt-3 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-900 leading-tight">
                        Operação Estável
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Nenhum chamado urgente pendente neste período.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* WEEKLY BARS */}
              <div className="col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Volume de Atendimentos Semanais</h3>
                      <p className="text-xs text-slate-400 font-medium">Comparativo de solicitações abertas vs. concluídas por dia</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-[#1D6FEB]" />
                        <span className="text-slate-600">Abertos</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-emerald-500" />
                        <span className="text-slate-600">Concluídos</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-4 border-b border-slate-100">
                    {weeklyBars.map((item) => {
                      const openHeight = `${(item.abertos / item.maxH) * 100}%`;
                      const closedHeight = `${(item.resolvidos / item.maxH) * 100}%`;

                      return (
                        <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          <div className="w-full flex items-end justify-center gap-1.5 h-40">
                            <div 
                              title={`${item.abertos} abertos`}
                              className="w-4 bg-[#1D6FEB] rounded-t-md hover:bg-[#1557BA] transition-all relative group-hover:scale-y-105 origin-bottom"
                              style={{ height: openHeight }}
                            >
                              <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded font-bold transition-opacity">
                                {item.abertos}
                              </span>
                            </div>

                            <div 
                              title={`${item.resolvidos} resolvidos`}
                              className="w-4 bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all relative group-hover:scale-y-105 origin-bottom"
                              style={{ height: closedHeight }}
                            >
                              <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded font-bold transition-opacity">
                                {item.resolvidos}
                              </span>
                            </div>
                          </div>

                          <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900">
                            {item.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium pt-2">
                  <span>Pico de demandas nas sextas-feiras</span>
                  <span className="text-emerald-600 font-bold">Taxa de resolução contínua &gt; 80%</span>
                </div>
              </div>

            </div>

            {/* CHARTS ROW 2: ESPECIALIDADES & DEMANDA POR SETOR */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* Especialidades */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Tipologia das Ocorrências (Especialidade)</h3>
                    <p className="text-xs text-slate-400">Classificação técnica dos serviços executados</p>
                  </div>
                  <Wrench size={18} className="text-[#1D6FEB]" />
                </div>

                <div className="space-y-3.5 pt-2">
                  {[
                    { label: 'Hidráulica (Vazamentos e Registros)', count: metrics.hidraulica, pct: 38, icon: <Droplets size={16} className="text-blue-500" />, color: 'bg-blue-500' },
                    { label: 'Elétrica (Iluminação e Disjuntores)', count: metrics.eletrica, pct: 28, icon: <Zap size={16} className="text-amber-500" />, color: 'bg-amber-500' },
                    { label: 'Acessibilidade & Serralheria', count: metrics.acessibilidade, pct: 20, icon: <DoorOpen size={16} className="text-purple-500" />, color: 'bg-purple-500' },
                    { label: 'Alvenaria, Pintura e Telhados', count: metrics.alvenaria, pct: 14, icon: <Paintbrush size={16} className="text-emerald-500" />, color: 'bg-emerald-500' },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span className="text-slate-800 font-bold">{item.label}</span>
                        </div>
                        <span className="text-slate-900 font-extrabold">{item.count} ordens ({item.pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 Prédios */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Top 5 Prédios com Maior Volume de Ordens</h3>
                    <p className="text-xs text-slate-400">Instalações públicas prioritárias no cronograma</p>
                  </div>
                  <Building2 size={18} className="text-purple-600" />
                </div>

                <div className="space-y-2.5 pt-1">
                  {topUnits.map((u, idx) => (
                    <div 
                      key={u.id} 
                      className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                        <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                          idx === 0 ? 'bg-amber-100 text-amber-800' :
                          idx === 1 ? 'bg-slate-200 text-slate-700' :
                          idx === 2 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{u.nome}</p>
                          <p className="text-[11px] text-slate-400 truncate">{u.tipo} • {u.gestor}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-slate-800">{u.totalCount} ocorrências</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          u.openCount > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.openCount > 0 ? `${u.openCount} pendentes` : 'Em dia'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-900 font-bold">
                    Educação: {metrics.educacao}
                  </div>
                  <div className="p-2 rounded-lg bg-red-50 text-red-900 font-bold">
                    Saúde: {metrics.saude}
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-900 font-bold">
                    Admin: {metrics.admin}
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 font-bold">
                    Praças: {metrics.pracas}
                  </div>
                </div>
              </div>

            </div>

            {/* SCOREBOARD DE PRODUTIVIDADE */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Scoreboard de Produtividade Técnica</h3>
                  <p className="text-xs text-slate-400">Eficiência e entregas de manutenções por profissional</p>
                </div>
                <Award size={20} className="text-amber-500" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Técnico / Responsável</th>
                      <th className="py-3 px-4">Atribuídos</th>
                      <th className="py-3 px-4">Em Campo</th>
                      <th className="py-3 px-4">Concluídos</th>
                      <th className="py-3 px-4">Tempo Médio</th>
                      <th className="py-3 px-4">Taxa de Conclusão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {techPerformance.map((tech, idx) => (
                      <tr key={tech.name} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                            idx === 0 ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1D6FEB] flex items-center justify-center font-bold text-xs">
                            {tech.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span>{tech.name}</span>
                            {idx === 0 && (
                              <span className="ml-2 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                Líder do Mês
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{tech.total} ordens</td>
                        <td className="py-3.5 px-4 text-blue-700 font-bold">{tech.inProgress}</td>
                        <td className="py-3.5 px-4 text-emerald-700 font-bold">{tech.completed}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{tech.mttr}h</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${tech.rate}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700">{tech.rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AUDITORIA */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Registro de Atividades Recentes (Auditoria)</h3>
                <span className="text-xs font-semibold text-slate-400">Log em tempo real</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {activities.map((act) => (
                  <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#1D6FEB]" />
                      <span className="font-semibold text-slate-800">{act.title}</span>
                    </div>
                    <span className="text-slate-400 font-medium">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>

      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. DEDICATED OFFICIAL PRINT DOSSIER (ACTIVE ONLY ON PRINT)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="hidden print:block w-full max-w-[210mm] mx-auto p-4 text-slate-900 font-sans text-xs leading-relaxed bg-white">
        <PrintableOfficialDossier 
          metrics={metrics}
          topUnits={topUnits}
          techPerformance={techPerformance}
          periodLabel={periodLabel}
        />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. PRINT PREVIEW MODAL (ON-SCREEN MODAL FOR INSPECTING A4)    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 print:hidden">
          <div 
            className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1D6FEB] flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Prévia do Relatório Oficial (Formato A4)</h3>
                  <p className="text-xs text-slate-500 font-medium">Layout padronizado para geração de PDF e impressão física.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={handlePrint}
                  className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white rounded-lg text-xs font-semibold h-9 px-4"
                >
                  <Printer size={14} className="mr-1.5" />
                  Imprimir Agora
                </Button>
                <button 
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Sheet Preview (Simulating paper) */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-200/80 flex justify-center">
              <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl w-full border border-slate-300">
                <PrintableOfficialDossier 
                  metrics={metrics}
                  topUnits={topUnits}
                  techPerformance={techPerformance}
                  periodLabel={periodLabel}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL PRINTABLE DOSSIER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface DossierProps {
  metrics: any;
  topUnits: any[];
  techPerformance: any[];
  periodLabel: string;
}

function PrintableOfficialDossier({ metrics, topUnits, techPerformance, periodLabel }: DossierProps) {
  return (
    <div className="space-y-6">
      
      {/* MUNICIPAL OFFICIAL HEADER */}
      <div className="border-b-2 border-slate-900 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-md flex items-center justify-center font-black text-xl">
              Z
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Prefeitura Municipal de Gestão Urbana
              </h1>
              <p className="text-[11px] font-semibold text-slate-700">
                Secretaria Municipal de Infraestrutura e Zeladoria Predial
              </p>
              <p className="text-[10px] text-slate-500">
                Departamento de Manutenção e Conservação do Patrimônio Público
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-500 space-y-0.5">
            <p className="font-bold text-slate-900">DOCUMENTO OFICIAL</p>
            <p>Protocolo: <span className="font-mono">REL-2026-90412-ZELO</span></p>
            <p>Data de Emissão: 23/09/2026 às 09:15</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 uppercase">
              Relatório Executivo de Ocorrências e Manutenção Predial
            </h2>
            <p className="text-[11px] text-slate-600 font-medium">
              Período de Apuração: <span className="font-bold text-slate-900">{periodLabel}</span>
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-600">
            <span>Responsável: <strong>Mariana Alves</strong> (Matrícula: 48.910-2)</span>
          </div>
        </div>
      </div>

      {/* QUADRO 1: INDICADORES ESTRATÉGICOS (KPIS EM TABELA LIMPA) */}
      <div className="print-avoid-break">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-300 pb-1">
          1. Indicadores Chave de Desempenho Operacional (KPIs)
        </h3>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 border border-slate-300 rounded bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase text-slate-500">Total de Ocorrências</span>
            <div className="text-xl font-black text-slate-900 mt-1">{metrics.total}</div>
            <p className="text-[9px] text-slate-500 mt-0.5">Demandas cadastradas</p>
          </div>

          <div className="p-3 border border-slate-300 rounded bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase text-slate-500">Taxa de Conclusão</span>
            <div className="text-xl font-black text-slate-900 mt-1">{metrics.taxaResolucao}%</div>
            <p className="text-[9px] text-slate-500 mt-0.5">{metrics.concluidos} ordens finalizadas</p>
          </div>

          <div className="p-3 border border-slate-300 rounded bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase text-slate-500">Tempo Médio (MTTR)</span>
            <div className="text-xl font-black text-slate-900 mt-1">4.8 horas</div>
            <p className="text-[9px] text-slate-500 mt-0.5">SLA Máximo: 8.0h (Atendido)</p>
          </div>

          <div className="p-3 border border-slate-300 rounded bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase text-slate-500">Eficiência Preventiva</span>
            <div className="text-xl font-black text-slate-900 mt-1">91%</div>
            <p className="text-[9px] text-slate-500 mt-0.5">Vistorias em conformidade</p>
          </div>
        </div>
      </div>

      {/* QUADRO 2: DISTRIBUIÇÃO POR SEVERIDADE E STATUS */}
      <div className="print-avoid-break">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-300 pb-1">
          2. Classificação de Severidade e Fluxo Operacional
        </h3>

        <div className="grid grid-cols-2 gap-4">
          
          {/* Tabela de Severidade */}
          <table className="w-full text-left border border-slate-300 text-[10px]">
            <thead className="bg-slate-100 font-bold uppercase text-slate-700">
              <tr>
                <th className="p-2 border-b border-slate-300">Nível de Criticidade</th>
                <th className="p-2 border-b border-slate-300 text-center">Quantidade</th>
                <th className="p-2 border-b border-slate-300 text-right">% do Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-1.5 font-bold text-red-700">Urgente (Risco Operacional)</td>
                <td className="p-1.5 text-center font-bold">{metrics.urgentes}</td>
                <td className="p-1.5 text-right">{Math.round((metrics.urgentes / metrics.total) * 100)}%</td>
              </tr>
              <tr>
                <td className="p-1.5 font-bold text-amber-700">Alta Prioridade</td>
                <td className="p-1.5 text-center font-bold">{metrics.altas}</td>
                <td className="p-1.5 text-right">{Math.round((metrics.altas / metrics.total) * 100)}%</td>
              </tr>
              <tr>
                <td className="p-1.5 font-medium text-slate-700">Média Prioridade</td>
                <td className="p-1.5 text-center font-bold">{metrics.medias}</td>
                <td className="p-1.5 text-right">{Math.round((metrics.medias / metrics.total) * 100)}%</td>
              </tr>
              <tr>
                <td className="p-1.5 font-medium text-slate-700">Baixa Prioridade</td>
                <td className="p-1.5 text-center font-bold">{metrics.baixas}</td>
                <td className="p-1.5 text-right">{Math.round((metrics.baixas / metrics.total) * 100)}%</td>
              </tr>
            </tbody>
          </table>

          {/* Tabela de Especialidades */}
          <table className="w-full text-left border border-slate-300 text-[10px]">
            <thead className="bg-slate-100 font-bold uppercase text-slate-700">
              <tr>
                <th className="p-2 border-b border-slate-300">Especialidade Técnica</th>
                <th className="p-2 border-b border-slate-300 text-center">Demandas</th>
                <th className="p-2 border-b border-slate-300 text-right">Proporção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-1.5 font-semibold">Instalações Hidráulicas</td>
                <td className="p-1.5 text-center font-bold">{metrics.hidraulica}</td>
                <td className="p-1.5 text-right font-medium">38%</td>
              </tr>
              <tr>
                <td className="p-1.5 font-semibold">Sistemas Elétricos e Iluminação</td>
                <td className="p-1.5 text-center font-bold">{metrics.eletrica}</td>
                <td className="p-1.5 text-right font-medium">28%</td>
              </tr>
              <tr>
                <td className="p-1.5 font-semibold">Acessibilidade e Serralheria</td>
                <td className="p-1.5 text-center font-bold">{metrics.acessibilidade}</td>
                <td className="p-1.5 text-right font-medium">20%</td>
              </tr>
              <tr>
                <td className="p-1.5 font-semibold">Alvenaria, Pintura e Cobertura</td>
                <td className="p-1.5 text-center font-bold">{metrics.alvenaria}</td>
                <td className="p-1.5 text-right font-medium">14%</td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>

      {/* QUADRO 3: PANORAMA POR SEGMENTO MUNICIPAL */}
      <div className="print-avoid-break">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-300 pb-1">
          3. Demandas Consolidadas por Segmento Municipal
        </h3>

        <table className="w-full text-left border border-slate-300 text-[10px]">
          <thead className="bg-slate-100 font-bold uppercase text-slate-700">
            <tr>
              <th className="p-2 border-b border-slate-300">Segmento</th>
              <th className="p-2 border-b border-slate-300">Tipos de Equipamentos</th>
              <th className="p-2 border-b border-slate-300 text-center">Total Ocorrências</th>
              <th className="p-2 border-b border-slate-300 text-right">Participação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="p-2 font-bold text-slate-800">Educação Municipal</td>
              <td className="p-2 text-slate-600">Escolas Municipais de Ensino Fundamental (EMEFs) e Infantil (EMEIs)</td>
              <td className="p-2 text-center font-extrabold">{metrics.educacao}</td>
              <td className="p-2 text-right font-bold">{Math.round((metrics.educacao / metrics.total) * 100)}%</td>
            </tr>
            <tr>
              <td className="p-2 font-bold text-slate-800">Saúde Pública</td>
              <td className="p-2 text-slate-600">Unidades Básicas de Saúde (UBSs), Postos Médicos e UPAs</td>
              <td className="p-2 text-center font-extrabold">{metrics.saude}</td>
              <td className="p-2 text-right font-bold">{Math.round((metrics.saude / metrics.total) * 100)}%</td>
            </tr>
            <tr>
              <td className="p-2 font-bold text-slate-800">Administração Direta</td>
              <td className="p-2 text-slate-600">Paço Municipal, Secretarias Operacionais e Biblioteca Pública</td>
              <td className="p-2 text-center font-extrabold">{metrics.admin}</td>
              <td className="p-2 text-right font-bold">{Math.round((metrics.admin / metrics.total) * 100)}%</td>
            </tr>
            <tr>
              <td className="p-2 font-bold text-slate-800">Espaços Urbanos e Lazer</td>
              <td className="p-2 text-slate-600">Praças Públicas, Parques Municipais e Áreas Verdes</td>
              <td className="p-2 text-center font-extrabold">{metrics.pracas}</td>
              <td className="p-2 text-right font-bold">{Math.round((metrics.pracas / metrics.total) * 100)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* QUADRO 4: UNIDADES PRIORITÁRIAS */}
      <div className="print-avoid-break">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-300 pb-1">
          4. Prédios Públicos Prioritários no Cronograma de Intervenções
        </h3>

        <table className="w-full text-left border border-slate-300 text-[10px]">
          <thead className="bg-slate-100 font-bold uppercase text-slate-700">
            <tr>
              <th className="p-2 border-b border-slate-300">Unidade</th>
              <th className="p-2 border-b border-slate-300">Endereço</th>
              <th className="p-2 border-b border-slate-300">Gestor Responsável</th>
              <th className="p-2 border-b border-slate-300 text-center">Pendências</th>
              <th className="p-2 border-b border-slate-300 text-right">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {topUnits.map((u) => (
              <tr key={u.id}>
                <td className="p-2 font-bold text-slate-900">{u.nome} ({u.tipo})</td>
                <td className="p-2 text-slate-600 truncate max-w-44">{u.endereco}</td>
                <td className="p-2 text-slate-600">{u.gestor}</td>
                <td className="p-2 text-center font-extrabold">{u.openCount} abertos</td>
                <td className="p-2 text-right">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    u.openCount > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {u.openCount > 0 ? 'Intervenção Requerida' : 'Regularizado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QUADRO 5: DESEMPENHO DA EQUIPE TÉCNICA */}
      <div className="print-avoid-break">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-300 pb-1">
          5. Produtividade e Capacidade de Entrega das Equipes Técnicas
        </h3>

        <table className="w-full text-left border border-slate-300 text-[10px]">
          <thead className="bg-slate-100 font-bold uppercase text-slate-700">
            <tr>
              <th className="p-2 border-b border-slate-300">Técnico Designado</th>
              <th className="p-2 border-b border-slate-300 text-center">Atribuídos</th>
              <th className="p-2 border-b border-slate-300 text-center">Em Execução</th>
              <th className="p-2 border-b border-slate-300 text-center">Concluídos</th>
              <th className="p-2 border-b border-slate-300 text-center">Tempo Médio</th>
              <th className="p-2 border-b border-slate-300 text-right">Taxa de Eficiência</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {techPerformance.map((tech) => (
              <tr key={tech.name}>
                <td className="p-2 font-bold text-slate-800">{tech.name}</td>
                <td className="p-2 text-center font-medium">{tech.total}</td>
                <td className="p-2 text-center font-bold text-blue-700">{tech.inProgress}</td>
                <td className="p-2 text-center font-bold text-emerald-700">{tech.completed}</td>
                <td className="p-2 text-center font-medium">{tech.mttr}h</td>
                <td className="p-2 text-right font-extrabold text-slate-900">{tech.rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TERMO DE ENCERRAMENTO E ASSINATURAS FORMAIS */}
      <div className="pt-6 border-t border-slate-400 print-avoid-break space-y-6">
        <p className="text-[10px] text-slate-600 leading-relaxed text-justify">
          Declara-se para os devidos fins de controle institucional, transparência e auditoria que as informações e métricas constantes deste relatório representam a totalidade das ocorrências prediais registradas, triadas e executadas no período de referência pela Coordenação Municipal de Zeladoria Predial, em estrita conformidade com as normas regulamentadoras NBR 5674 e diretrizes da administração pública municipal.
        </p>

        <div className="grid grid-cols-2 gap-12 pt-10 text-center text-[10px]">
          <div>
            <div className="border-t border-slate-700 w-4/5 mx-auto pt-1 font-bold text-slate-900">
              Mariana Alves
            </div>
            <p className="text-slate-500">Gestora Municipal de Zeladoria Predial</p>
            <p className="text-slate-400 text-[9px]">Matrícula: 48.910-2</p>
          </div>

          <div>
            <div className="border-t border-slate-700 w-4/5 mx-auto pt-1 font-bold text-slate-900">
              Secretaria Municipal de Infraestrutura
            </div>
            <p className="text-slate-500">Gabinete de Obras e Serviços Públicos</p>
            <p className="text-slate-400 text-[9px]">Prefeitura Municipal</p>
          </div>
        </div>
      </div>

    </div>
  );
}
