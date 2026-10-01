'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Wrench, 
  Clock,
  Sun,
  Inbox,
  Calendar,
  TrendingUp,
  Settings,
  Search,
  Bell,
  AlertTriangle,
  Plus,
  Check,
  User,
  Zap,
  ChevronRight
} from 'lucide-react';

interface TicketItem {
  id: string;
  title: string;
  unit: string;
  priority: 'Urgente' | 'Alta' | 'Média';
  assignee: string;
  sla: string;
  actionType: 'validar' | 'acompanhar' | 'triar';
}

const PRIORIDADES_TICKETS: TicketItem[] = [
  {
    id: '#104940',
    title: 'Substituição de fechaduras de segurança no arquivo...',
    unit: 'Prefeitura - Ala Sul',
    priority: 'Média',
    assignee: 'Lucas Pereira',
    sla: 'SLA: Hoje 18:00',
    actionType: 'validar',
  },
  {
    id: '#104939',
    title: 'Troca de luminárias e reatores no pátio coberto',
    unit: 'EMEF Paulo Freire',
    priority: 'Média',
    assignee: 'Carlos Silva',
    sla: 'SLA: Hoje 18:00',
    actionType: 'validar',
  },
  {
    id: '#104928',
    title: 'Rampa de acesso com piso solto e degrau quebrado',
    unit: 'Praça da Matriz',
    priority: 'Alta',
    assignee: 'Lucas Pereira',
    sla: 'SLA: Hoje 18:00',
    actionType: 'acompanhar',
  },
  {
    id: '#104922',
    title: 'Superaquecimento no quadro elétrico do 2º piso',
    unit: 'EMEF Paulo Freire',
    priority: 'Alta',
    assignee: 'Carlos Silva',
    sla: 'SLA: Hoje 18:00',
    actionType: 'acompanhar',
  },
  {
    id: '#104923',
    title: 'Bomba de água do consultório 3 inoperante',
    unit: 'UBS Vila Nova',
    priority: 'Urgente',
    assignee: 'Roberto Santos',
    sla: 'SLA: Hoje 18:00',
    actionType: 'acompanhar',
  }
];

const TRIAGEM_TICKETS: TicketItem[] = [
  {
    id: '#104945',
    title: 'Infiltração com risco de goteira sobre computadores',
    unit: 'EMEF Castro Alves',
    priority: 'Urgente',
    assignee: 'Definir na triagem',
    sla: 'SLA Crítico: 4h',
    actionType: 'triar',
  },
  {
    id: '#104943',
    title: 'Disjuntor geral desarmando em horário de pico',
    unit: 'UBS Central',
    priority: 'Alta',
    assignee: 'Definir na triagem',
    sla: 'SLA: Hoje 18:00',
    actionType: 'triar',
  },
  {
    id: '#104937',
    title: 'Vazamento na prumada hidráulica do refeitório',
    unit: 'EMEI Sementinha',
    priority: 'Alta',
    assignee: 'Definir na triagem',
    sla: 'SLA: Hoje 18:00',
    actionType: 'triar',
  },
  {
    id: '#104932',
    title: 'Ajuste de fechamento de portão automatizado',
    unit: 'Prefeitura - Estacionamento',
    priority: 'Média',
    assignee: 'Definir na triagem',
    sla: 'SLA: Amanhã 12:00',
    actionType: 'triar',
  }
];

function getElementCenter(target: HTMLElement | null, container: HTMLElement | null, fallbackX = 500, fallbackY = 400) {
  if (!target || !container) return { x: fallbackX, y: fallbackY };
  const t = target.getBoundingClientRect();
  const c = container.getBoundingClientRect();
  return {
    x: Math.round(t.left - c.left + t.width / 2),
    y: Math.round(t.top - c.top + t.height / 2)
  };
}

export function HeroDashboardShowcase() {
  const [activeTab, setActiveTab] = useState<'Prioridades' | 'Triagem' | 'Validação' | 'Todos'>('Prioridades');
  const [isValidatedFirst, setIsValidatedFirst] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 620, y: 460 });
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const validateBtnRef = useRef<HTMLButtonElement>(null);
  const triagemTabRef = useRef<HTMLButtonElement>(null);
  const prioridadesTabRef = useRef<HTMLButtonElement>(null);
  const triarBtnRef = useRef<HTMLButtonElement>(null);

  // Initialize and run loop
  useEffect(() => {
    setIsMounted(true);

    // Initial positioning after layout calculation
    const initTimer = setTimeout(() => {
      if (validateBtnRef.current && containerRef.current) {
        const pt = getElementCenter(validateBtnRef.current, containerRef.current, 580, 480);
        // Start near the button so the first motion is clear
        setCursorPos({ x: pt.x + 80, y: pt.y + 60 });
      }
    }, 400);

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % 6;

      if (step === 1) {
        // Step 1: Move directly to "Validar" button
        if (validateBtnRef.current && containerRef.current) {
          const pt = getElementCenter(validateBtnRef.current, containerRef.current, 580, 480);
          setCursorPos({ x: pt.x - 4, y: pt.y - 4 });
        }
      } else if (step === 2) {
        // Step 2: Click "Validar"
        setIsClicking(true);
        setTimeout(() => {
          setIsClicking(false);
          setIsValidatedFirst(true);
          setToastMessage('Chamado #104940 validado e despachado!');
        }, 220);
      } else if (step === 3) {
        // Step 3: Glide up to "Triagem" tab
        if (triagemTabRef.current && containerRef.current) {
          const pt = getElementCenter(triagemTabRef.current, containerRef.current, 450, 400);
          setCursorPos({ x: pt.x - 4, y: pt.y - 4 });
        }
      } else if (step === 4) {
        // Step 4: Click "Triagem" tab
        setIsClicking(true);
        setTimeout(() => {
          setIsClicking(false);
          setActiveTab('Triagem');
          setToastMessage(null);
        }, 220);
      } else if (step === 5) {
        // Step 5: Glide to "Triar" button in triage table
        if (triarBtnRef.current && containerRef.current) {
          const pt = getElementCenter(triarBtnRef.current, containerRef.current, 580, 480);
          setCursorPos({ x: pt.x - 4, y: pt.y - 4 });
        }
      } else if (step === 0) {
        // Step 0: Glide back to "Prioridades" tab, click and reset loop
        if (prioridadesTabRef.current && containerRef.current) {
          const pt = getElementCenter(prioridadesTabRef.current, containerRef.current, 380, 400);
          setCursorPos({ x: pt.x - 4, y: pt.y - 4 });
        }
        setTimeout(() => {
          setActiveTab('Prioridades');
          setIsValidatedFirst(false);
          setToastMessage(null);
        }, 800);
      }
    }, 2000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, []);

  const currentTickets = activeTab === 'Triagem' ? TRIAGEM_TICKETS : PRIORIDADES_TICKETS;
  const validationCounter = isValidatedFirst ? 1 : 2;

  return (
    <div 
      ref={containerRef}
      className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_20px_40px_rgba(15,23,42,0.08),0_4px_10px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] overflow-hidden text-left relative select-none"
    >
      {/* ─── SIMULATED ANIMATED USER CURSOR (Always Visible & Animated) ─── */}
      {isMounted && (
        <motion.div
          animate={{ 
            x: cursorPos.x, 
            y: cursorPos.y,
            scale: isClicking ? 0.88 : 1
          }}
          transition={{
            x: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 0.15 }
          }}
          style={{ willChange: 'transform' }}
          className="absolute top-0 left-0 z-50 pointer-events-none"
        >
          {/* Click ripple circle effect */}
          {isClicking && (
            <motion.span 
              initial={{ scale: 0.3, opacity: 0.9 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#0A2540]/30 pointer-events-none"
            />
          )}

          {/* Custom Sleek OS Pointer */}
          <div className="flex items-center gap-1.5 -translate-x-1 -translate-y-1">
            <svg 
              className="w-5 h-5 drop-shadow-[0_3px_6px_rgba(0,0,0,0.4)] shrink-0" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path 
                d="M4 3L17.5 13.5L11 15L7.5 21L4 3Z" 
                fill="#0A2540" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinejoin="round" 
              />
            </svg>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0A2540] text-white text-[10px] font-bold shadow-md whitespace-nowrap -mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Mariana (Gestora)</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating Success Feedback Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-6 right-6 z-40 pointer-events-none flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0A2540] text-white text-xs font-semibold shadow-xl border border-white/10"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check size={12} strokeWidth={2.5} />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chrome Top Bar */}
      <div className="h-10 w-full bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between px-4 sm:px-5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span className="text-[11px] font-semibold text-[#64748B] ml-3 hidden sm:inline">
            urboa.app / Gestão municipal / Hoje
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>Simulação ao vivo</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
            <span>Ambiente Operacional Ativo</span>
          </div>
        </div>
      </div>

      {/* Platform Shell: Left Sidebar Rail + Main Workspace */}
      <div className="flex bg-[#F8FAFC]">
        
        {/* ─── MINI SIDEBAR (Exact Match to Platform Left Rail) ─── */}
        <div className="hidden md:flex flex-col justify-between py-4 items-center w-14 shrink-0 bg-[#FAFAFA] border-r border-slate-200 select-none">
          {/* Top icons */}
          <div className="flex flex-col items-center gap-2">
            {/* Urboa 'u.' Logo Mark */}
            <div className="w-8 h-8 rounded-lg bg-[#0A2540] text-white flex items-center justify-center font-black text-xs shadow-xs mb-2">
              u.
            </div>

            {/* Sun (Hoje) Active */}
            <div className="w-8 h-8 rounded-lg bg-slate-200/80 text-slate-800 flex items-center justify-center transition-colors">
              <Sun size={15} />
            </div>

            {/* Inbox with badge 14 */}
            <div className="relative w-8 h-8 flex items-center justify-center text-slate-500">
              <Inbox size={15} />
              <span className="absolute -top-0.5 -right-0.5 bg-slate-900 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                14
              </span>
            </div>

            {/* Calendar */}
            <div className="w-8 h-8 flex items-center justify-center text-slate-500">
              <Calendar size={15} />
            </div>

            {/* Board / Kanban with badge 11 */}
            <div className="relative w-8 h-8 flex items-center justify-center text-slate-500">
              <Building2 size={15} />
              <span className="absolute -top-0.5 -right-0.5 bg-slate-900 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                11
              </span>
            </div>

            {/* Trending / Analytics */}
            <div className="w-8 h-8 flex items-center justify-center text-slate-500">
              <TrendingUp size={15} />
            </div>

            {/* urBIA Copilot */}
            <div className="w-8 h-8 flex items-center justify-center text-slate-500">
              <Sparkles size={15} />
            </div>
          </div>

          {/* Bottom icons */}
          <div className="flex flex-col items-center gap-2.5">
            {/* Settings */}
            <div className="w-8 h-8 flex items-center justify-center text-slate-500">
              <Settings size={15} />
            </div>

            {/* User Avatar */}
            <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-300 shadow-2xs">
              <img 
                src="/images/municipal_director.jpg" 
                alt="Mariana Alves" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>

        {/* ─── MAIN WORKSPACE ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Header: Breadcrumbs + Search + Notifications */}
          <div className="h-14 px-5 sm:px-7 bg-white/90 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-500">Gestão municipal</span>
              <span className="text-slate-300 select-none">/</span>
              <span className="text-slate-900 font-bold">Hoje</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <div className="w-60 pl-8 pr-3 py-1.5 bg-slate-100/80 border border-slate-200/90 rounded-xl text-xs text-slate-400 select-none flex items-center">
                  Buscar chamado ou unidade...
                </div>
              </div>
              <div className="relative text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell size={15} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </div>
            </div>
          </div>

          {/* Dashboard Content Container */}
          <div className="p-5 sm:p-7 flex flex-col gap-6">
            
            {/* Page Title & Actions Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">Decisões da Zeladoria</h2>
                <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
                  Você tem 4 chamado(s) aguardando triagem. Priorize com apoio inteligente.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button 
                  onClick={() => setActiveTab('Triagem')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-semibold transition-colors shadow-2xs active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles size={13} strokeWidth={1.5} />
                  <span>Triar próximo</span>
                  <ArrowRight size={13} strokeWidth={1.5} />
                </button>
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A2540] hover:bg-[#07192C] text-white text-xs font-semibold shadow-xs transition-colors active:scale-[0.98] cursor-pointer">
                  <Plus size={13} />
                  <span>Novo chamado</span>
                </button>
              </div>
            </div>

            {/* Stat Cards Section with Categorized Headers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Bloco 1: VOLUME OPERACIONAL */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em]">
                    Volume Operacional
                  </span>
                  <div className="h-px flex-1 bg-slate-200/80" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Card 1: Em execução */}
                  <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-[#0A2540]">
                        <Wrench size={18} strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        Em campo
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[#64748B] block">Em execução</span>
                      <div className="text-3xl font-semibold text-[#0F172A] tracking-tight mt-0.5">4</div>
                      <span className="text-[11px] text-[#64748B] mt-1 block leading-snug">Equipes técnicas ativas no local</span>
                    </div>
                  </div>

                  {/* Card 2: Precisam de validação (Animated Counter) */}
                  <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-purple-700">
                        <CheckCircle2 size={18} strokeWidth={1.5} />
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                        validationCounter === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {validationCounter === 1 ? '1 pendente' : 'Pendente aceite'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[#64748B] block">Precisam de validação</span>
                      <motion.div 
                        key={validationCounter}
                        initial={{ scale: 0.85, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-semibold text-[#0F172A] tracking-tight mt-0.5"
                      >
                        {validationCounter}
                      </motion.div>
                      <span className="text-[11px] text-[#64748B] mt-1 block leading-snug">Aguardando confirmação da unidade</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco 2: REQUER ATENÇÃO */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em]">
                    Requer Atenção
                  </span>
                  <div className="h-px flex-1 bg-slate-200/80" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Card 3: Urgências ativas (Active Border ring as in Platform) */}
                  <div className="bg-white p-4.5 rounded-xl border-2 border-[#0F172A] ring-1 ring-[#0F172A]/10 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-red-600">
                        <AlertTriangle size={18} strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[#0F172A] border border-slate-200">
                        SLA 4h
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[#64748B] block">Urgências ativas</span>
                      <div className="text-3xl font-semibold text-[#0F172A] tracking-tight mt-0.5">2</div>
                      <span className="text-[11px] text-[#64748B] mt-1 block leading-snug">SLA crítico de 4 horas</span>
                    </div>
                  </div>

                  {/* Card 4: Aguardam triagem */}
                  <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-[#0A2540]">
                        <Clock size={18} strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                        Ação imediata
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[#64748B] block">Aguardam triagem</span>
                      <div className="text-3xl font-semibold text-[#0F172A] tracking-tight mt-0.5">4</div>
                      <span className="text-[11px] text-[#64748B] mt-1 block leading-snug">Novas ocorrências sem triagem técnica</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Section 2 Header: ACOMPANHAMENTO E PRÓXIMOS PASSOS */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em]">
                  Acompanhamento e Próximos Passos
                </span>
                <div className="h-px flex-1 bg-slate-200/80" />
              </div>

              {/* Main Table + Agenda Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Fila Table: 8 Cols */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
                  {/* Header da Tabela com Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-200/80 gap-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#0F172A]">
                        {activeTab === 'Triagem' ? 'Aguardam Triagem' : 'Fila de Decisões'}
                      </h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {activeTab === 'Triagem' ? '4' : '10'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-lg text-[11px] font-medium text-slate-600">
                      <button
                        ref={prioridadesTabRef}
                        onClick={() => setActiveTab('Prioridades')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          activeTab === 'Prioridades' 
                            ? 'bg-white text-[#0F172A] font-semibold shadow-2xs' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Prioridades
                      </button>
                      <button
                        ref={triagemTabRef}
                        onClick={() => setActiveTab('Triagem')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          activeTab === 'Triagem' 
                            ? 'bg-white text-[#0F172A] font-semibold shadow-2xs' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Triagem
                      </button>
                      <button
                        onClick={() => setActiveTab('Validação')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          activeTab === 'Validação' 
                            ? 'bg-white text-[#0F172A] font-semibold shadow-2xs' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Validação
                      </button>
                      <button
                        onClick={() => setActiveTab('Todos')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          activeTab === 'Todos' 
                            ? 'bg-white text-[#0F172A] font-semibold shadow-2xs' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Todos
                      </button>
                      <span className="px-2 py-1 text-slate-400 flex items-center gap-0.5 ml-1 select-none">
                        Kanban <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>

                  {/* Header Columns */}
                  <div className="grid grid-cols-12 text-[10px] font-bold text-slate-600 uppercase tracking-wider px-5 py-2.5 bg-slate-50/90 border-b border-slate-200/80">
                    <div className="col-span-5">Chamado & Unidade</div>
                    <div className="col-span-2">Prioridade</div>
                    <div className="col-span-3">Responsável & Prazo</div>
                    <div className="col-span-2 text-right">Ação imediata</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-slate-100 text-xs">
                    {currentTickets.map((ticket, idx) => {
                      const isFirstValidated = idx === 0 && isValidatedFirst && activeTab === 'Prioridades';
                      
                      return (
                        <div 
                          key={ticket.id}
                          className="grid grid-cols-12 items-center px-5 py-3 hover:bg-slate-50/70 transition-colors"
                        >
                          <div className="col-span-5 pr-2 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-mono font-medium text-slate-400">{ticket.id}</span>
                              <h4 className="text-[12px] font-medium text-[#0F172A] truncate">
                                {ticket.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <Building2 size={11} className="opacity-70 shrink-0" />
                              <span className="truncate">{ticket.unit}</span>
                            </p>
                          </div>

                          <div className="col-span-2 flex items-center gap-1.5 font-medium text-[11px]">
                            {ticket.priority === 'Urgente' ? (
                              <div className="flex items-center gap-1.5 text-slate-900">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                                <span>Urgente</span>
                              </div>
                            ) : ticket.priority === 'Alta' ? (
                              <div className="flex items-center gap-1.5 text-slate-900">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                <span>Alta</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span>Média</span>
                              </div>
                            )}
                          </div>

                          <div className="col-span-3 min-w-0">
                            <div className="flex items-center gap-1 text-[11px] font-medium text-[#0F172A]">
                              <User size={11} className="text-slate-400 shrink-0" />
                              <span className="truncate">{ticket.assignee}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <Clock size={10} className="opacity-70 shrink-0" />
                              <span>{ticket.sla}</span>
                            </div>
                          </div>

                          <div className="col-span-2 flex justify-end">
                            {ticket.actionType === 'validar' ? (
                              isFirstValidated ? (
                                <motion.span 
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-semibold shadow-2xs"
                                >
                                  <Check size={11} strokeWidth={2.5} />
                                  <span>Validado</span>
                                </motion.span>
                              ) : (
                                <button 
                                  ref={idx === 0 ? validateBtnRef : undefined}
                                  onClick={() => setIsValidatedFirst(true)}
                                  className="inline-flex items-center gap-1 bg-[#0A2540] hover:bg-[#07192C] text-white px-3 py-1 rounded-md text-[11px] font-semibold shadow-2xs transition-all active:scale-[0.97] cursor-pointer"
                                >
                                  <span>Validar</span>
                                  <ArrowRight size={11} />
                                </button>
                              )
                            ) : ticket.actionType === 'triar' ? (
                              <button 
                                ref={idx === 0 ? triarBtnRef : undefined}
                                className="inline-flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-700 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer"
                              >
                                <span>Triar</span>
                                <ArrowRight size={11} />
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer">
                                <span>Acompanhar</span>
                                <ArrowRight size={11} />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Side Panel: Agenda de Hoje (4 Cols) */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-sm p-4.5 space-y-4">
                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#0F172A]">Agenda de hoje</h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        0/6 concluídas
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Vistorias programadas</p>
                  </div>

                  {/* Next Commitment Box */}
                  <div className="rounded-lg p-3.5 border border-slate-200/90 bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-blue-600 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        Próximo compromisso
                      </span>
                      <span className="text-slate-800 font-medium">Amanhã, 09:00</span>
                    </div>

                    <div>
                      <h4 className="text-[12px] font-medium text-[#0F172A] leading-snug">
                        Manutenção preventiva e teste de estanqueidade de bombas
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Building2 size={11} className="opacity-70 shrink-0" />
                        <span>UBS Vila Nova</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User size={11} className="opacity-70 shrink-0" />
                        <span>Roberto Santos</span>
                      </div>
                      <button className="bg-[#0A2540] hover:bg-[#07192C] text-white px-3 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer">
                        <Check size={11} />
                        <span>Concluir</span>
                      </button>
                    </div>
                  </div>

                  {/* Compromissos Seguintes */}
                  <div className="space-y-2.5 pt-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Compromissos seguintes (5)
                    </p>

                    {/* Item 1 */}
                    <div className="p-2 rounded-lg border border-slate-100 bg-slate-50/30 flex items-center justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                          <Zap size={12} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-[#0F172A] leading-snug truncate">
                            Hoje, 14:30 · Vistoria elétrica semestral nos quadros de distribuição
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">EMEF Paulo Freire</p>
                        </div>
                      </div>
                      <div className="w-4 h-4 rounded border border-slate-300 shrink-0" />
                    </div>

                    {/* Item 2 */}
                    <div className="p-2 rounded-lg border border-slate-100 bg-slate-50/30 flex items-center justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                          <CheckCircle2 size={12} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-[#0F172A] leading-snug truncate">
                            Quinta, 10:00 · Inspeção de rampas e rotas táteis acessíveis
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">UBS Central</p>
                        </div>
                      </div>
                      <div className="w-4 h-4 rounded border border-slate-300 shrink-0" />
                    </div>

                    {/* Item 3 */}
                    <div className="p-2 rounded-lg border border-slate-100 bg-slate-50/30 flex items-center justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                          <Clock size={12} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-[#0F172A] leading-snug truncate">
                            Quinta, 14:00 · Avaliação preventiva de calhas e coberturas pré-ch...
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">EMEI Sementinha</p>
                        </div>
                      </div>
                      <div className="w-4 h-4 rounded border border-slate-300 shrink-0" />
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
