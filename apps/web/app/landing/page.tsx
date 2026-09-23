'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  BarChart2, 
  Calendar, 
  LayoutDashboard, 
  QrCode, 
  Award, 
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';

export default function LandingPage() {
  const { stats, units, orders } = useOrders();
  const { user } = useAuth();

  // ROI Calculator state: number of public buildings
  const [buildingCount, setBuildingCount] = useState<number>(45);

  // Dynamic ROI calculations
  const roiMetrics = useMemo(() => {
    // Estimativas baseadas em médias municipais da ABNT NBR 5674
    const annualTickets = Math.round(buildingCount * 14.5);
    const correctiveCostPerIncident = 1450; // Custo médio de reparo corretivo emergencial em R$
    const preventiveCostPerIncident = 480; // Custo médio com triagem preventiva planejada
    const emergencyCostWithoutZelo = annualTickets * correctiveCostPerIncident;
    const managedCostWithZelo = (annualTickets * 0.35 * correctiveCostPerIncident) + (annualTickets * 0.65 * preventiveCostPerIncident);
    const estimatedSavings = Math.round(emergencyCostWithoutZelo - managedCostWithZelo);
    const techHoursSaved = Math.round(annualTickets * 3.2);

    return {
      annualTickets,
      estimatedSavings,
      techHoursSaved,
    };
  }, [buildingCount]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/landing" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#1e293b] rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <div className="w-5 h-5 bg-white rounded-xs transform rotate-45" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">zelo.</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-blue-50 text-[#1D6FEB] border border-blue-200">GovTech</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Gestão Municipal</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#recursos" className="hover:text-[#1D6FEB] transition-colors">Recursos</a>
            <a href="#modulos" className="hover:text-[#1D6FEB] transition-colors">Módulos</a>
            <a href="#calculadora" className="hover:text-[#1D6FEB] transition-colors">Calculadora ROI</a>
            <a href="#fluxo" className="hover:text-[#1D6FEB] transition-colors">Como Funciona</a>
            <a href="#depoimentos" className="hover:text-[#1D6FEB] transition-colors">Casos de Sucesso</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/abrir-chamado">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs font-bold border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl gap-2 h-10 px-4"
              >
                <QrCode size={15} className="text-[#1D6FEB]" />
                <span className="hidden sm:inline">Abrir Chamado</span> Rápido
              </Button>
            </Link>

            <Link href={user ? '/' : '/login'}>
              <Button 
                size="sm"
                className="text-xs font-bold bg-[#1D6FEB] hover:bg-[#1557BA] text-white rounded-xl gap-2 h-10 px-5 shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                <span>{user ? 'Acessar Painel' : 'Entrar no Sistema'}</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-24 overflow-hidden border-b border-slate-200/60 bg-gradient-to-b from-white via-slate-50/50 to-[#F8FAFC]">
        {/* Glow circles backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          {/* Gov Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 shadow-2xs animate-in fade-in duration-300">
            <Sparkles size={14} className="text-[#1D6FEB]" />
            <span className="text-xs font-extrabold text-[#1D6FEB] tracking-wide">
              Gestão Predial Pública Inteligente • Padrão ABNT NBR 5674
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              A infraestrutura da sua cidade <br />
              <span className="bg-gradient-to-r from-[#1D6FEB] via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                cuidada com precisão e agilidade.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Centralize a triagem, reduza em até <strong>40% o tempo de resolução</strong> de problemas hidráulicos e elétricos e elimine o papel na manutenção de escolas, creches, postos de saúde e prédios municipais.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href={user ? '/' : '/login'} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm font-bold bg-[#1D6FEB] hover:bg-[#1557BA] text-white h-12 px-8 rounded-xl shadow-lg shadow-blue-500/25 gap-2 group cursor-pointer">
                {user ? 'Explorar Painel de Gestão' : 'Entrar no Painel de Gestão'}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/abrir-chamado" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-bold border-slate-300 hover:bg-white text-slate-800 h-12 px-8 rounded-xl gap-2 shadow-xs">
                <QrCode size={18} className="text-slate-600" />
                Simular Chamado via QR Code
              </Button>
            </Link>
          </div>

          {/* INTERACTIVE DASHBOARD MOCKUP PREVIEW */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="relative rounded-2xl p-2 sm:p-3 bg-gradient-to-b from-slate-200 to-slate-300 shadow-2xl border border-slate-300/80">
              <div className="rounded-xl bg-white overflow-hidden border border-slate-200 shadow-inner">
                {/* Mockup Top Window Header */}
                <div className="h-10 bg-slate-900 px-4 flex items-center justify-between border-b border-slate-800 text-xs text-slate-400 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-[11px] font-mono text-slate-400 ml-3">zelo.gestaourbana.gov.br/visao-geral</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Central Online
                  </div>
                </div>

                {/* Mockup Dashboard Content Grid */}
                <div className="p-6 bg-[#F8FAFC] text-left space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Zeladoria Municipal • Visão em Tempo Real</h3>
                      <p className="text-xs text-slate-500">{units.length} unidades monitoradas • {orders.length} ordens registradas no sistema</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        MTTR: 4.8h (SLA OK)
                      </span>
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                        91% Eficiência
                      </span>
                    </div>
                  </div>

                  {/* Mockup KPI Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-xs font-bold text-slate-400 uppercase">Em Triagem</span>
                      <p className="text-2xl font-black text-[#1D6FEB] mt-1">{stats.triagem}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Aguardando despacho</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-xs font-bold text-slate-400 uppercase">Em Execução</span>
                      <p className="text-2xl font-black text-amber-600 mt-1">{stats.emExecucao}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Equipes no local</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-xs font-bold text-slate-400 uppercase">Chamados Concluídos</span>
                      <p className="text-2xl font-black text-emerald-600 mt-1">{stats.concluidos}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Resolvidos no prazo</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-xs font-bold text-slate-400 uppercase">Urgentes / SLA</span>
                      <p className="text-2xl font-black text-rose-600 mt-1">{stats.urgentes}</p>
                      <p className="text-[10px] text-rose-600 font-bold mt-0.5">Atenção prioritária</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF / METRIC NUMBERS */}
      <section className="py-12 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-[#1D6FEB] tracking-tight">-38%</span>
            <p className="text-xs font-bold text-slate-700">Tempo Médio de Atendimento</p>
            <p className="text-[11px] text-slate-400">Redução comprovada de MTTR</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">91%</span>
            <p className="text-xs font-bold text-slate-700">Índice Preventivo</p>
            <p className="text-[11px] text-slate-400">Inspeções periódicas em dia</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-purple-700 tracking-tight">4.8h</span>
            <p className="text-xs font-bold text-slate-700">SLA Médio de Reparo</p>
            <p className="text-[11px] text-slate-400">Bem abaixo do limite máximo (8h)</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">100%</span>
            <p className="text-xs font-bold text-slate-700">Digital & Auditável</p>
            <p className="text-[11px] text-slate-400">Conformidade ABNT NBR 5674</p>
          </div>
        </div>
      </section>

      {/* 4. MÓDULOS DA PLATAFORMA */}
      <section id="modulos" className="py-24 max-w-7xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#1D6FEB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Arquitetura Integrada
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            5 Pilares Completos para a Zeladoria Pública
          </h2>
          <p className="text-sm text-slate-500">
            Da solicitação feita pelo diretor de escola na ponta até o relatório assinado pelo secretário municipal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D6FEB] flex items-center justify-center">
              <LayoutDashboard size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Quadro Kanban & Triagem</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Arraste e solte chamados entre Triagem, Execução e Conclusão com rastreamento visual de SLAs e criticidade em tempo real.
            </p>
            <Link href="/kanban" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D6FEB] hover:underline pt-2">
              Ver quadro Kanban <ArrowRight size={13} />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Monitoramento de Prédios 360°</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Visão consolidada de todas as EMEFs, creches, UBSs e secretarias da cidade, com status de saúde e responsáveis locais.
            </p>
            <Link href="/unidades" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline pt-2">
              Explorar unidades <ArrowRight size={13} />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Agenda de Vistorias Técnicas</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Linha do tempo diária e semanal com agendamentos de manutenção preventiva e checklist de conformidade em campo.
            </p>
            <Link href="/agenda" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline pt-2">
              Abrir cronograma <ArrowRight size={13} />
            </Link>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BarChart2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Relatórios Oficiais A4</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Gráficos polares de criticidade, produtividade dos técnicos e emissão de dossiês técnicos prontos para auditoria de TCE.
            </p>
            <Link href="/relatorios" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:underline pt-2">
              Acessar relatórios <ArrowRight size={13} />
            </Link>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <QrCode size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Chamado Rápido via QR Code</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Plaquetas de QR Code em salas e corredores permitem que diretores e servidores abram ocorrências em 30 segundos pelo celular.
            </p>
            <Link href="/abrir-chamado" className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline pt-2">
              Testar abertura rápida <ArrowRight size={13} />
            </Link>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Conformidade ABNT NBR 5674</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Atende integralmente às exigências legais de gestão da manutenção em edificações com histórico imutável e prestação de contas.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 pt-2">
              <CheckCircle2 size={13} className="text-emerald-600" /> Padrão Nacional
            </span>
          </div>
        </div>
      </section>

      {/* 5. CALCULADORA DE ECONOMIA / ROI MUNICIPAL */}
      <section id="calculadora" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-3.5 py-1 rounded-full border border-emerald-800">
              Calculadora de Eficiência
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Estime a Economia de Verba no seu Município
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              A manutenção preventiva e a resposta rápida a vazamentos evitam degradação estrutural e sinistros caros.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="max-w-3xl mx-auto bg-slate-800/90 rounded-2xl border border-slate-700/80 p-8 shadow-2xl space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-200">
                  Quantos prédios públicos municipais sua gestão administra?
                </label>
                <span className="text-2xl font-black text-[#1D6FEB] bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-700">
                  {buildingCount} unidades
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={buildingCount}
                onChange={(e) => setBuildingCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1D6FEB]"
              />

              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>10 prédios (Pequeno porte)</span>
                <span>100 prédios (Médio porte)</span>
                <span>200+ prédios (Grande porte)</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-700/80 text-center">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60">
                <span className="text-xs font-bold text-slate-400 uppercase">Demandas Previstas/Ano</span>
                <p className="text-2xl font-black text-white mt-1">{roiMetrics.annualTickets}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Ocorrências prediais</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                <span className="text-xs font-bold text-emerald-400 uppercase">Economia Anual Estimada</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  R$ {roiMetrics.estimatedSavings.toLocaleString('pt-BR')}
                </p>
                <p className="text-[10px] text-emerald-400/80 mt-0.5">Evitando reformas graves</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60">
                <span className="text-xs font-bold text-slate-400 uppercase">Horas Técnicas Otimizadas</span>
                <p className="text-2xl font-black text-blue-400 mt-1">+{roiMetrics.techHoursSaved}h</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Produtividade de equipe</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FLUXO OPERACIONAL EM 3 PASSOS */}
      <section id="fluxo" className="py-24 max-w-7xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#1D6FEB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Simplicidade Operacional
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Como o Zelo Funciona no Dia a Dia
          </h2>
          <p className="text-sm text-slate-500">
            Conectando a direção de escolas e postos de saúde à equipe de engenharia e obras da prefeitura.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 relative">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-[#1D6FEB] font-black text-sm flex items-center justify-center">
              1
            </span>
            <h3 className="text-lg font-bold text-slate-900">Abertura Rápida na Ponta</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              O diretor da escola lê o QR Code da sala ou abre o portal simplificado, anexa foto do vazamento e recebe o protocolo na hora.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 relative">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-[#1D6FEB] font-black text-sm flex items-center justify-center">
              2
            </span>
            <h3 className="text-lg font-bold text-slate-900">Triagem & Despacho Municipal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              A central recebe o chamado com alerta de criticidade, aprova a ordem e designa o técnico qualificado (eletricista, encanador).
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 relative">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-[#1D6FEB] font-black text-sm flex items-center justify-center">
              3
            </span>
            <h3 className="text-lg font-bold text-slate-900">Execução & Prestação de Contas</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              O técnico executa o reparo, o solicitante é avisado por WhatsApp e os dossiês formais em A4 ficam prontos para auditoria.
            </p>
          </div>
        </div>
      </section>

      {/* 7. DEPOIMENTOS DE SERVIDORES */}
      <section id="depoimentos" className="py-20 bg-slate-100/60 border-t border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Casos Reais</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              O que dizem os servidores e gestores municipais
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;Antes, quando queimava uma fase elétrica na escola ou vazava um cano, passávamos dias enviando memorandos físicos. Com o QR Code do Zelo, a equipe técnica chega no mesmo dia.&rdquo;
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900">Profª Maria Clara</p>
                <p className="text-[11px] text-slate-400">Diretora da EMEF Paulo Freire</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;Em unidades de saúde, não podemos ter autoclaves ou ar-condicionado parados. O controle rígido de SLAs do sistema garantiu 100% de conformidade nas inspeções da Vigilância.&rdquo;
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900">Dr. Marcelo Ramos</p>
                <p className="text-[11px] text-slate-400">Coordenador da UBS Central</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;A exportação imediata do dossiê impresso oficial nos padrões da ABNT NBR 5674 nos poupou meses de trabalho na prestação de contas do Tribunal de Contas.&rdquo;
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900">Eng. Marcos Silva</p>
                <p className="text-[11px] text-slate-400">Secretaria de Infraestrutura e Obras</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                <div className="w-3.5 h-3.5 bg-slate-950 rounded-xs transform rotate-45" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">zelo.</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Plataforma GovTech para gestão predial municipal, manutenção urbana e cumprimento de normas técnicas.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-3">Módulos do Sistema</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/" className="hover:text-white transition-colors">Visão Geral & Indicadores</Link></li>
              <li><Link href="/chamados" className="hover:text-white transition-colors">Gestão de Chamados</Link></li>
              <li><Link href="/kanban" className="hover:text-white transition-colors">Quadro Operacional Kanban</Link></li>
              <li><Link href="/unidades" className="hover:text-white transition-colors">Prédios & Unidades Públicas</Link></li>
              <li><Link href="/agenda" className="hover:text-white transition-colors">Agenda de Vistorias</Link></li>
              <li><Link href="/relatorios" className="hover:text-white transition-colors">Relatórios Oficiais A4</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-3">Portais & Serviços</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/abrir-chamado" className="hover:text-white transition-colors">Portal do Solicitante (QR Code)</Link></li>
              <li><Link href="/configuracoes" className="hover:text-white transition-colors">Configurações do Sistema</Link></li>
              <li><a href="#calculadora" className="hover:text-white transition-colors">Simulador de Economia Municipal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-3">Conformidade & Segurança</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Em estrita conformidade com a Lei Geral de Proteção de Dados (LGPD) e norma ABNT NBR 5674 de manutenção de edificações.
            </p>
            <div className="pt-4">
              <Link href="/">
                <Button size="sm" className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white text-xs font-bold rounded-xl gap-2 w-full">
                  Entrar no Sistema
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600 text-[11px]">
          <p>© 2026 zelo. Tecnologia para Cidades Inteligentes. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span>Prefeitura Municipal de Gestão Urbana</span>
            <span>•</span>
            <span>Versão 1.0.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
