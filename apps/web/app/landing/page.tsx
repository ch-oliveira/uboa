'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  BarChart3, 
  HardHat, 
  FileCheck2, 
  Navigation, 
  ChevronRight, 
  CalendarCheck, 
  Send, 
  Wrench, 
  X, 
  Clock,
  ArrowUpRight,
  Shield,
  Layers,
  CheckCircle,
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
  Zap
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';
import { HeroDashboardShowcase } from '@/components/hero-dashboard-showcase';

// Refactoring UI: Deliberate spring physics with natural mass
const cubicSpring = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: cubicSpring } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 }
  }
};

export default function LandingPage() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  
  // Interactive urBIA Copilot Chat Simulation State
  const [activeUrbiChip, setActiveUrbiChip] = useState<'tecnicos' | 'resumo' | 'urgencias'>('resumo');
  const [customUrbiInput, setCustomUrbiInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'urbia'; text: string; tag?: string }>>([
    {
      sender: 'urbia',
      text: 'Olá! Sou a urBIA, copiloto de zeladoria do Urboa. Consulto o banco municipal em tempo real, calculo equipes necessárias, verifico SLAs e oriento o despacho técnico. Como posso te apoiar hoje?'
    }
  ]);

  // Demo Form State
  const [demoFormData, setDemoFormData] = useState({
    nome: '',
    cargo: '',
    municipio: '',
    email: '',
    telefone: '',
    qtdPredios: '20-50',
    mensagem: ''
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleSelectChip(type: 'tecnicos' | 'resumo' | 'urgencias') {
    setActiveUrbiChip(type);
    if (type === 'tecnicos') {
      setChatMessages(prev => [
        ...prev,
        { sender: 'user', text: 'Quantos técnicos precisamos?' },
        { 
          sender: 'urbia', 
          text: 'Com base nas 16 ordens ativas e 2 urgências críticas, você precisa de 2 eletrotécnicos e 2 encanadores em campo hoje para manter o SLA em 98.4%. Carlos Silva e Marcos Oliveira já estão em deslocamento.',
          tag: 'Dimensionamento Otimizado'
        }
      ]);
    } else if (type === 'resumo') {
      setChatMessages(prev => [
        ...prev,
        { sender: 'user', text: 'Resumo dos chamados' },
        { 
          sender: 'urbia', 
          text: 'Panorama municipal: 7 chamados em aberto, 2 em execução no local, 1 aguardando triagem técnica (#419806 Praça da Matriz) e 9 ordens concluídas nesta semana com comprovação digital.',
          tag: 'Status Operacional'
        }
      ]);
    } else if (type === 'urgencias') {
      setChatMessages(prev => [
        ...prev,
        { sender: 'user', text: 'Prédios com urgências' },
        { 
          sender: 'urbia', 
          text: 'Atenção imediata na UBS Central (calhas e infiltração em período de chuvas) e UBS Vila Nova (bomba do consultório 3). Ambas já contam com ordens de alta prioridade atribuídas.',
          tag: 'Alerta Prioritário'
        }
      ]);
    }
  }

  function handleSendCustomChat(e: React.FormEvent) {
    e.preventDefault();
    if (!customUrbiInput.trim()) return;
    const text = customUrbiInput;
    setCustomUrbiInput('');
    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text },
      { 
        sender: 'urbia', 
        text: `Registrei sua consulta sobre "${text}". O motor da urBIA cruza normas NBR 5674 e histórico predial para priorizar o despacho sem desvios orçamentários.`,
        tag: 'Parecer Municipal'
      }
    ]);
  }

  function handleDemoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDemoSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#2563EB]/20 selection:text-[#0F172A] relative overflow-x-hidden">
      
      {/* ─── REFACTORING UI: SUBTLE AMBIENT CANVAS ACCENTS ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft atmospheric gradient glow (<= 30deg hue rotation) */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#2563EB]/[0.04] via-[#7C3AED]/[0.02] to-transparent rounded-full blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.025]" 
          style={{ 
            backgroundImage: 'linear-gradient(#0A2540 1px, transparent 1px), linear-gradient(90deg, #0A2540 1px, transparent 1px)', 
            backgroundSize: '48px 48px' 
          }} 
        />
      </div>

      {/* ─── 1. FLOATING NAVIGATION BAR (Refactoring UI: Clear Action Hierarchy & Elevation) ─── */}
      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: cubicSpring }}
        className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <header className={`h-14 rounded-full flex items-center justify-between px-4 sm:px-5 pointer-events-auto transition-all duration-300 gap-6 sm:gap-8 max-w-4xl w-full ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-[0_10px_25px_rgba(15,23,42,0.08),0_2px_4px_rgba(15,23,42,0.04)] border border-slate-200/90' 
            : 'bg-white shadow-[0_6px_20px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/80'
        }`}>
          {/* Standardized Logo Urboa ('u. Urboa') */}
          <Logo href="/landing" size="md" textStyle="simple" />

          {/* Navigation Links: Refactoring UI 3-shade rule (Secondary color #475569) */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-semibold text-[#475569]">
            <a href="#plataforma" className="hover:text-[#0F172A] transition-colors">Plataforma</a>
            <a href="#modulos" className="hover:text-[#0F172A] transition-colors">Módulos</a>
          </nav>

          {/* Actions: Refactoring UI hierarchy (1 Primary + 1 Secondary) */}
          <div className="flex items-center gap-2.5">
            {/* Secondary Action: Demo Modal Trigger */}
            <button 
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#7C3AED] text-xs font-bold border border-[#DDD6FE] transition-colors active:scale-[0.98]"
            >
              <span>Agendar Demo</span>
              <ArrowUpRight size={13} strokeWidth={1.5} />
            </button>

            {/* Primary Action: Portal Entry */}
            <Link href={user ? '/' : '/login'}>
              <button className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0A2540] hover:bg-[#07192C] text-white text-xs font-bold shadow-[0_2px_4px_rgba(10,37,64,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all active:scale-[0.98]">
                <span>{user ? 'Painel' : 'Entrar'}</span>
                <ChevronRight size={13} strokeWidth={1.5} />
              </button>
            </Link>
          </div>
        </header>
      </motion.div>

      {/* ─── MAIN CONTENT CONTAINER (Refactoring UI: Balanced Macro-Spacing) ─── */}
      <main className="relative z-10 pt-32 sm:pt-40 pb-24 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col gap-24 sm:gap-32">
        
        {/* ─── 2. HERO SECTION ─── */}
        <section className="flex flex-col items-center text-center gap-8 pt-2">
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-5 max-w-3xl"
          >
            {/* Eyebrow Label: All-caps with +0.05em tracking and soft contrast */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold text-[#1D4E89] bg-[#1D4E89]/[0.08] border border-[#1D4E89]/20 shadow-2xs tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              <span>Gestão Predial Urbana & Zeladoria Pública</span>
            </motion.div>

            {/* Headline: Refactoring UI proportional scale (tight line-height, bold weight, balanced size) */}
            <motion.h1 variants={fadeUp} className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-[-0.03em] text-[#0F172A] leading-[1.08]">
              O padrão de excelência para a zeladoria dos <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A2540] via-[#1D4E89] to-[#2563EB]">
                prédios públicos
              </span> da sua cidade.
            </motion.h1>

            {/* Subtitle: Refactoring UI line-length rule (45-75 chars, max-w-2xl) with high-legibility grey */}
            <motion.p variants={fadeUp} className="text-base sm:text-lg text-[#475569] max-w-2xl leading-relaxed font-normal">
              Gestão integrada, preditiva e auditável para manutenção de escolas, unidades de saúde e prédios administrativos. Da abertura do chamado à comprovação perante o Tribunal de Contas.
            </motion.p>

            {/* Actions: Strict Hierarchy (Primary Solid + Secondary Outline) */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 w-full sm:w-auto">
              {/* Exactly ONE Dominant Primary Action */}
              <button 
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#0A2540] hover:bg-[#07192C] text-white rounded-full font-bold px-7 py-3 text-[14px] shadow-[0_10px_20px_rgba(10,37,64,0.18),0_2px_4px_rgba(10,37,64,0.12),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-200 active:scale-[0.98]"
              >
                <span>Agendar demonstração municipal</span>
                <ArrowRight size={15} strokeWidth={1.5} />
              </button>

              {/* Secondary Action */}
              <a 
                href="#plataforma"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-[#0F172A] text-[14px] font-bold border border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all active:scale-[0.98]"
              >
                <span>Explorar plataforma</span>
                <ChevronRight size={15} strokeWidth={1.5} className="text-[#64748B]" />
              </a>
            </motion.div>

            {/* Social Proof: Refactoring UI "Invisible Border" Overlap Trick */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 pt-3 border-t border-slate-200/80 w-full max-w-xl">
              <div className="flex -space-x-2 shrink-0">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-xs">
                  <img src="/images/municipal_director.jpg" alt="Gestora Municipal" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 overflow-hidden shadow-xs">
                  <img src="/images/municipal_team.jpg" alt="Equipe de Campo" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#0A2540] text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                  +15
                </div>
              </div>
              <div className="text-[12px] font-medium text-[#475569] text-left leading-snug">
                Adotado em <strong className="font-bold text-[#0F172A]">15 Prefeituras</strong> • Mais de 28 mil ordens auditadas
              </div>
            </motion.div>

            {/* Trust Proof Badges */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} strokeWidth={1.5} className="text-[#059669]" />
                <span>Conforme ABNT NBR 5674</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={15} strokeWidth={1.5} className="text-[#2563EB]" />
                <span>Dossiê preparado para TCE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={15} strokeWidth={1.5} className="text-[#7C3AED]" />
                <span>urBIA: Triagem e Despacho por IA</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ─── 3. HERO SHOWCASE: LIVE DASHBOARD PREVIEW (Refactoring UI Light Source Emulation) ─── */}
          <motion.div 
            id="plataforma"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: cubicSpring }}
            className="w-full mt-2 scroll-mt-28 relative"
          >
            <HeroDashboardShowcase />
          </motion.div>

          {/* ─── 4. TYPOGRAPHIC METRICS SCALE (Base 16 Rhythm) ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-y border-slate-200 divide-x divide-slate-200 w-full mt-6">
            <div className="py-7 px-6 space-y-1 text-center md:text-left">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">48+</p>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Prédios Públicos Conectados</p>
            </div>
            <div className="py-7 px-6 space-y-1 text-center md:text-left">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">28k</p>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Ordens Concluídas no Ciclo</p>
            </div>
            <div className="py-7 px-6 space-y-1 text-center md:text-left">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">94%</p>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Resoluções dentro do SLA</p>
            </div>
            <div className="py-7 px-6 space-y-1 text-center md:text-left">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">3.2x</p>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Retorno em Eficiência Pública</p>
            </div>
          </div>
        </section>

        {/* ─── 5. PLATFORM MODULES (Refactoring UI: Color Accents & Content Scannability) ─── */}
        <section id="modulos" className="flex flex-col gap-10 scroll-mt-24">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-[#2563EB] bg-[#2563EB]/[0.08] border border-[#2563EB]/20">
              Arquitetura de Plataforma
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              A esteira completa da zeladoria urbana municipal.
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              Elimine o papel, as planilhas soltas e o risco jurídico. Cobertura de ponta a ponta: do chamado do diretor escolar ao relatório do Tribunal de Contas.
            </p>
          </div>

          {/* Cards Grid: Refactoring UI Top Accent Border Treatment */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Module 1: Despacho Dinâmico */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border-t-4 border-t-[#2563EB] p-7 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Navigation size={20} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">Despacho Dinâmico & Roteirização</h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Distribuição automática de ordens de serviço por geolocalização e especialidade técnica. O sistema calcula a rota ideal e notifica o encarregado no app mobile.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <MapPin size={13} className="text-[#2563EB]" /> Roteirização GPS
                </span>
                <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                  Tempo real
                </span>
              </div>
            </div>

            {/* Module 2: Dossiê de Auditoria TCE */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border-t-4 border-t-[#059669] p-7 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center">
                  <FileCheck2 size={20} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">Dossiê de Auditoria TCE</h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Comprovação irrefutável com fotos antes e depois georreferenciadas, carimbo de tempo inviolável e assinatura digital dos gestores escolares e municipais.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <ShieldCheck size={13} className="text-[#059669]" /> Pronto p/ Prestação
                </span>
                <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  100% Digital
                </span>
              </div>
            </div>

            {/* Module 3: Prevenção NBR 5674 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border-t-4 border-t-[#7C3AED] p-7 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                  <HardHat size={20} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">Prevenção ABNT NBR 5674</h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Cronogramas normatizados que antecipam a fadiga de materiais elétricos, coberturas e redes hidráulicas em todos os equipamentos municipais.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <CalendarCheck size={13} className="text-[#7C3AED]" /> Inspeções periódicas
                </span>
                <span className="font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">
                  Antecipa falhas
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ─── 6. URBIA COPILOT (Refactoring UI: Dark Surface Contrast Rules) ─── */}
        <section id="urbi" className="scroll-mt-24">
          {/* Deep Navy Container with High-Contrast Typography (Never Grey on Dark Blue) */}
          <div className="rounded-3xl bg-[#0A1A30] text-white p-7 sm:p-11 shadow-[0_20px_40px_rgba(10,26,48,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] border border-white/10 flex flex-col lg:flex-row gap-9 items-stretch relative overflow-hidden">
            
            {/* Subtle ambient lighting */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: Context with Hand-Picked Text Colors */}
            <div className="lg:w-1/2 flex flex-col justify-between space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold text-[#DDD6FE] bg-[#7C3AED]/25 border border-[#7C3AED]/40">
                  <Sparkles size={13} className="text-[#C4B5FD]" />
                  <span>urBIA • Assistente de Zeladoria</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Inteligência Artificial aplicada à gestão pública.
                </h2>
                {/* Refactoring UI: Use sky-100 / slate-200 for legibility on dark blue, not dark grey */}
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
                  A urBIA é a copiloto nativa da Urboa. Ela lê chamados municipais, classifica riscos conforme normas da ABNT, calcula equipes necessárias e orienta a tomada de decisão do gestor sem burocracia.
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10">
                <span className="text-xs font-bold text-sky-200 uppercase tracking-wider block">
                  Perguntas frequentes que a urBIA responde em segundos:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleSelectChip('tecnicos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeUrbiChip === 'tecnicos' 
                        ? 'bg-[#7C3AED] text-white shadow-xs' 
                        : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    Quantos técnicos precisamos?
                  </button>
                  <button 
                    onClick={() => handleSelectChip('resumo')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeUrbiChip === 'resumo' 
                        ? 'bg-[#7C3AED] text-white shadow-xs' 
                        : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    Resumo dos chamados
                  </button>
                  <button 
                    onClick={() => handleSelectChip('urgencias')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeUrbiChip === 'urgencias' 
                        ? 'bg-[#7C3AED] text-white shadow-xs' 
                        : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    Prédios com urgências
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Chat Simulation Container */}
            <div className="lg:w-1/2 bg-white text-[#0F172A] rounded-2xl p-5 border border-slate-200 shadow-xl flex flex-col justify-between min-h-[380px] relative z-10">
              
              {/* Chat Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-white flex items-center justify-center shadow-xs">
                    <Sparkles size={14} className="text-[#A78BFA]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">urBIA Copilot</span>
                    <span className="text-[10px] text-slate-400">Contexto: Operação Municipal</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Fonte: Base Oficial
                </span>
              </div>

              {/* Chat Stream */}
              <div className="py-4 space-y-3 flex-1 overflow-y-auto max-h-[260px] pr-1">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.tag && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#7C3AED] mb-1">
                        {msg.tag}
                      </span>
                    )}
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                      msg.sender === 'user'
                        ? 'bg-[#0A2540] text-white rounded-br-none shadow-xs'
                        : 'bg-[#F8FAFC] text-[#0F172A] border border-slate-200 rounded-bl-none shadow-2xs'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Input Row */}
              <form onSubmit={handleSendCustomChat} className="relative pt-2 border-t border-slate-100">
                <input 
                  type="text"
                  value={customUrbiInput}
                  onChange={(e) => setCustomUrbiInput(e.target.value)}
                  placeholder="Solicitar parecer, dimensionamento, relatório..."
                  className="w-full h-11 pl-4 pr-11 rounded-xl bg-slate-50 border border-slate-300 text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                />
                <button 
                  type="submit"
                  className="absolute right-1.5 top-3.5 w-8 h-8 rounded-lg bg-[#0A2540] text-white flex items-center justify-center hover:bg-[#07192C] transition-colors"
                >
                  <Send size={13} />
                </button>
              </form>

            </div>

          </div>
        </section>

        {/* ─── 7. AGENDAR DEMONSTRAÇÃO (Refactoring UI: Form Layout & Hierarchy) ─── */}
        <section id="agendar-demo" className="scroll-mt-24">
          <div className="rounded-3xl bg-white p-7 sm:p-12 border border-slate-200/90 shadow-[0_15px_30px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row gap-10 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:w-1/2 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-[#0A2540] bg-slate-100 border border-slate-200">
                <Building2 size={13} className="text-[#2563EB]" />
                <span>Demonstração Personalizada</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight leading-tight">
                Veja o Urboa funcionando com a realidade do seu município.
              </h2>
              
              <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
                Nossa equipe de engenharia e governança digital apresenta o sistema em 20 minutos, simulando os chamados, as escolas e os fluxos da sua secretaria.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-bold text-[#0F172A]">
                  <CheckCircle2 size={16} strokeWidth={1.5} className="text-[#059669]" />
                  <span>Sem compromisso de contratação prévia</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-[#0F172A]">
                  <CheckCircle2 size={16} strokeWidth={1.5} className="text-[#059669]" />
                  <span>Mapeamento dos prédios e termos de referência</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-[#0F172A]">
                  <CheckCircle2 size={16} strokeWidth={1.5} className="text-[#059669]" />
                  <span>Implantação rápida em menos de 15 dias</span>
                </div>
              </div>
            </div>

            {/* Right Column: Form Container (Refactoring UI: Grouping & 3:1 Input Borders) */}
            <div className="lg:w-1/2 w-full bg-[#F8FAFC] p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
              {demoSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Demonstração Solicitada!</h3>
                  <p className="text-xs sm:text-sm text-[#475569] max-w-sm mx-auto leading-relaxed">
                    Recebemos os dados da sua prefeitura. Nosso especialista entrará em contato em até 2 horas úteis pelo WhatsApp ou e-mail institucional informado.
                  </p>
                  <button 
                    onClick={() => setDemoSubmitted(false)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0A2540] text-white hover:bg-[#07192C]"
                  >
                    Enviar nova solicitação
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4 text-left">
                  <h3 className="text-lg font-bold text-[#0F172A]">Agendar Apresentação Executiva</h3>
                  
                  {/* Row 1: Nome & Cargo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#0F172A]">Seu Nome Completo</label>
                      <input 
                        required
                        type="text"
                        placeholder="Ex: Mariana Silva"
                        value={demoFormData.nome}
                        onChange={(e) => setDemoFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#0F172A]">Cargo na Administração</label>
                      <input 
                        required
                        type="text"
                        placeholder="Ex: Secretário(a), Diretor(a)"
                        value={demoFormData.cargo}
                        onChange={(e) => setDemoFormData(prev => ({ ...prev, cargo: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  {/* Row 2: Município & Porte */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#0F172A]">Município e UF</label>
                      <input 
                        required
                        type="text"
                        placeholder="Ex: Campinas - SP"
                        value={demoFormData.municipio}
                        onChange={(e) => setDemoFormData(prev => ({ ...prev, municipio: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#0F172A]">Porte da Rede Predial</label>
                      <select 
                        value={demoFormData.qtdPredios}
                        onChange={(e) => setDemoFormData(prev => ({ ...prev, qtdPredios: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      >
                        <option value="ate-20">Até 20 prédios públicos</option>
                        <option value="20-50">20 a 50 prédios públicos</option>
                        <option value="50-100">50 a 100 prédios públicos</option>
                        <option value="mais-100">Mais de 100 prédios públicos</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: E-mail & WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#0F172A]">E-mail Institucional</label>
                      <input 
                        required
                        type="email"
                        placeholder="seu.nome@prefeitura.sp.gov.br"
                        value={demoFormData.email}
                        onChange={(e) => setDemoFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#0F172A]">WhatsApp / Celular com DDD</label>
                      <input 
                        required
                        type="tel"
                        placeholder="(11) 98765-4321"
                        value={demoFormData.telefone}
                        onChange={(e) => setDemoFormData(prev => ({ ...prev, telefone: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  {/* Solid Primary Button */}
                  <button 
                    type="submit"
                    className="w-full h-11 rounded-full bg-[#0A2540] hover:bg-[#07192C] text-white font-bold text-xs shadow-[0_4px_12px_rgba(10,37,64,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
                  >
                    <span>Confirmar Agendamento</span>
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </button>

                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Seus dados são protegidos conforme a LGPD e usados exclusivamente para o contato institucional.
                  </p>
                </form>
              )}
            </div>

          </div>
        </section>

      </main>

      {/* ─── 8. MODAL DE AGENDAR DEMO (Refactoring UI: Elevation 5, Clean Form) ─── */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: cubicSpring }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.15)] relative text-left"
            >
              <button 
                onClick={() => setIsDemoModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X size={16} strokeWidth={1.5} />
              </button>

              {demoSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Solicitação Registrada!</h3>
                  <p className="text-xs sm:text-sm text-[#475569] max-w-sm mx-auto leading-relaxed">
                    Entraremos em contato com você em até 2 horas úteis pelo WhatsApp ou e-mail institucional.
                  </p>
                  <button 
                    onClick={() => {
                      setDemoSubmitted(false);
                      setIsDemoModalOpen(false);
                    }}
                    className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#0A2540] text-white hover:bg-[#07192C]"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED]">
                    <Sparkles size={14} strokeWidth={1.5} />
                    <span>Apresentação Executiva Urboa</span>
                  </div>
                  <h3 className="text-xl font-black text-[#0F172A]">Agendar Demonstração</h3>
                  <p className="text-xs text-[#475569]">
                    Preencha os dados abaixo para receber uma demonstração personalizada dos módulos para a sua prefeitura.
                  </p>

                  <div className="space-y-3.5 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#0F172A]">Nome Completo</label>
                      <input 
                        required
                        type="text"
                        placeholder="Ex: Mariana Silva"
                        value={demoFormData.nome}
                        onChange={(e) => setDemoFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#0F172A]">Cargo</label>
                        <input 
                          required
                          type="text"
                          placeholder="Secretário(a), Diretor(a)"
                          value={demoFormData.cargo}
                          onChange={(e) => setDemoFormData(prev => ({ ...prev, cargo: e.target.value }))}
                          className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#0F172A]">Município e UF</label>
                        <input 
                          required
                          type="text"
                          placeholder="Ex: Campinas - SP"
                          value={demoFormData.municipio}
                          onChange={(e) => setDemoFormData(prev => ({ ...prev, municipio: e.target.value }))}
                          className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#0F172A]">E-mail Institucional</label>
                        <input 
                          required
                          type="email"
                          placeholder="nome@prefeitura.gov.br"
                          value={demoFormData.email}
                          onChange={(e) => setDemoFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#0F172A]">WhatsApp</label>
                        <input 
                          required
                          type="tel"
                          placeholder="(11) 98765-4321"
                          value={demoFormData.telefone}
                          onChange={(e) => setDemoFormData(prev => ({ ...prev, telefone: e.target.value }))}
                          className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full h-11 rounded-full bg-[#0A2540] hover:bg-[#07192C] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
                  >
                    <span>Solicitar Apresentação</span>
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </button>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 9. FOOTER INSTITUCIONAL (Refactoring UI: Clean Tertiary Layer) ─── */}
      <footer className="py-10 border-t border-slate-200 bg-white text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" textStyle="tecnologia" href="/landing" />
            <span className="text-slate-300">•</span>
            <span>Gestão e Manutenção Predial Pública</span>
          </div>
          <p className="text-slate-400">&copy; {new Date().getFullYear()} Urboa. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
