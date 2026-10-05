'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Fingerprint,
  HardHat,
  Inbox,
  Layers,
  LayoutDashboard,
  Minus,
  Plus,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';

/* ─── Motion ─────────────────────────────────────────────────────────────── */

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const inView = {
  initial: 'hidden' as const,
  whileInView: 'visible' as const,
  viewport: { once: true, margin: '-80px' },
};

/* ─── Content ────────────────────────────────────────────────────────────── */

type Shot = { src: string; w: number; h: number; alt: string };

// Real captures of the running platform (apps/web/public/images/landing/shots)
const SHOTS = {
  painel: {
    src: '/images/landing/shots/painel-hoje.jpg',
    w: 2000,
    h: 1250,
    alt: 'Painel Hoje do Urboa: decisões da zeladoria, indicadores e fila de chamados',
  },
  quadro: {
    src: '/images/landing/shots/chamados-quadro.jpg',
    w: 2000,
    h: 1250,
    alt: 'Quadro de chamados do Urboa organizado por etapa',
  },
  fluxo: {
    src: '/images/landing/shots/chamado-fluxo.jpg',
    w: 1800,
    h: 894,
    alt: 'Detalhe de um chamado com as cinco etapas, do triagem ao concluído',
  },
  urbia: {
    src: '/images/landing/shots/urbia-painel.jpg',
    w: 2000,
    h: 1250,
    alt: 'Assistente urBIA resumindo os chamados da prefeitura',
  },
  mobile: {
    src: '/images/landing/shots/abrir-chamado-mobile.jpg',
    w: 647,
    h: 1400,
    alt: 'Portal do solicitante no celular: abertura de chamado em três etapas',
  },
  agenda: {
    src: '/images/landing/shots/agenda.jpg',
    w: 2000,
    h: 1250,
    alt: 'Agenda semanal de vistorias e manutenções preventivas',
  },
  unidades: {
    src: '/images/landing/shots/unidades.jpg',
    w: 2000,
    h: 1250,
    alt: 'Lista de unidades públicas com pendências e próximo passo operacional',
  },
  relatorios: {
    src: '/images/landing/shots/relatorios.jpg',
    w: 2000,
    h: 1250,
    alt: 'Relatórios e indicadores: backlog, equipe em campo, saúde predial e taxa de resolução',
  },
} satisfies Record<string, Shot>;

const COMPLIANCE = [
  { icon: HardHat, label: 'ABNT NBR 5674' },
  { icon: Fingerprint, label: 'Registro auditável' },
  { icon: Scale, label: 'Prestação de contas' },
  { icon: ShieldCheck, label: 'LGPD' },
] as const;

const ROLES: ReadonlyArray<{
  id: string;
  tab: string;
  icon: LucideIcon;
  title: string;
  text: string;
  bullets: readonly [string, string];
  access: string;
}> = [
  {
    id: 'escolas',
    tab: 'Escolas e UBS',
    icon: Building2,
    title: 'Escolas, UBS e demais unidades',
    text: 'Abra um chamado em três etapas, sem login, e valide o serviço quando a equipe concluir.',
    bullets: ['Abertura sem cadastro', 'Consulta por protocolo'],
    access: 'Portal do solicitante',
  },
  {
    id: 'gestores',
    tab: 'Secretarias e gestores',
    icon: LayoutDashboard,
    title: 'Secretarias e gestores',
    text: 'Priorize a fila, despache equipes e acompanhe prazos de toda a rede predial em um só painel.',
    bullets: ['Triagem com apoio da urBIA', 'Relatórios e indicadores'],
    access: 'Hoje · Chamados · Agenda · Unidades · Relatórios',
  },
  {
    id: 'equipes',
    tab: 'Equipes de campo',
    icon: Wrench,
    title: 'Equipes de campo',
    text: 'Receba as ordens atribuídas, acompanhe a agenda de vistorias e registre cada execução.',
    bullets: ['Agenda de vistorias', 'Registro de execução'],
    access: 'Hoje · Chamados · Agenda',
  },
];

const STEPS: ReadonlyArray<{
  n: string;
  title: string;
  text: string;
  shot: Shot;
  mode: 'wide' | 'phone' | 'framed';
}> = [
  {
    n: '01',
    title: 'A unidade abre o chamado',
    text: 'Diretores de escola e UBS registram o problema em três etapas, escolhendo o prédio e o local exato. Sem login e sem papel.',
    shot: SHOTS.mobile,
    mode: 'phone',
  },
  {
    n: '02',
    title: 'A urBIA apoia a triagem',
    text: 'A assistente consulta a base de chamados, resume a fila, aponta prédios com urgência e estima a equipe necessária.',
    shot: SHOTS.urbia,
    mode: 'wide',
  },
  {
    n: '03',
    title: 'Despacho e execução em campo',
    text: 'O quadro mostra cada chamado em sua etapa: triagem, agendamento, execução e validação, com responsável e prazo.',
    shot: SHOTS.quadro,
    mode: 'wide',
  },
  {
    n: '04',
    title: 'Validação com aceite formal',
    text: 'A unidade confere o serviço e dá o aceite. Cada alteração operacional gera um registro auditável.',
    shot: SHOTS.fluxo,
    mode: 'framed',
  },
];

const FAQ = [
  {
    q: 'O que é o Urboa?',
    a: 'Uma plataforma de zeladoria e manutenção predial para prefeituras. Reúne chamados, triagem, despacho de equipes, agenda de vistorias, relatórios e a assistente urBIA em um só lugar.',
  },
  {
    q: 'Quem pode abrir chamados?',
    a: 'Diretores e responsáveis por escolas, UBS e outras unidades abrem chamados pelo portal do solicitante, sem login, e acompanham o andamento pelo protocolo.',
  },
  {
    q: 'O que a urBIA faz?',
    a: 'Consulta os chamados em tempo real, resume a fila, aponta prédios com urgência e estima a equipe necessária. A decisão final continua com o gestor.',
  },
  {
    q: 'Os registros são auditáveis?',
    a: 'Sim. Alterações operacionais geram registro auditável, seguindo a lógica da ABNT NBR 5674 para manutenção de edificações.',
  },
  {
    q: 'Quanto tempo leva para começar?',
    a: 'A implantação leva menos de 15 dias, incluindo o cadastro das unidades. Agende uma demonstração para ver como fica na sua rede.',
  },
] as const;

const STEP_MS = 7000;

/* ─── Small presentational helpers ───────────────────────────────────────── */

function SectionPill({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#0A0F1A]/10 bg-white py-1 pl-1 pr-3 text-[12px] font-medium text-[#0A0F1A] shadow-[0_1px_3px_rgba(10,15,26,0.08)]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0A0F1A] text-white">
        <Icon size={11} strokeWidth={2} />
      </span>
      {children}
    </span>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span className="text-[#7D8696]">{children}</span>;
}

function Diamond({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={`h-3 w-3 shrink-0 ${className}`} fill="currentColor">
      <path d="M6 0.5 11.5 6 6 11.5 0.5 6Z" />
    </svg>
  );
}

/** Product screenshot inside a dashed, blueprint-style frame. */
function StepStage({ active }: { active: number }) {
  return (
    <div className="ld-dashed rounded-[28px] bg-white p-3">
      <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[20px] bg-[#EEF1F5]">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-0'}`}
          >
            {s.mode === 'wide' && (
              <Image
                src={s.shot.src}
                alt={s.shot.alt}
                width={s.shot.w}
                height={s.shot.h}
                sizes="(min-width: 1024px) 640px, 100vw"
                className="h-full w-full object-cover object-left-top"
              />
            )}
            {s.mode === 'framed' && (
              <div className="flex h-full items-center justify-center p-5 sm:p-8">
                <Image
                  src={s.shot.src}
                  alt={s.shot.alt}
                  width={s.shot.w}
                  height={s.shot.h}
                  sizes="(min-width: 1024px) 600px, 100vw"
                  className="ld-shot h-auto w-full rounded-xl"
                />
              </div>
            )}
            {s.mode === 'phone' && (
              <div className="flex h-full items-center justify-center py-5">
                <Image
                  src={s.shot.src}
                  alt={s.shot.alt}
                  width={s.shot.w}
                  height={s.shot.h}
                  sizes="260px"
                  className="ld-shot h-full w-auto rounded-[20px]"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Cropped, zoomed product screenshot used inside the module cards. */
function ModuleShot({ shot }: { shot: Shot }) {
  return (
    <div className="relative mt-8 h-[260px] overflow-hidden rounded-[16px] border border-[#0A0F1A]/10 bg-[#F6F7F9] sm:h-[320px]">
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.w}
        height={shot.h}
        sizes="(min-width: 1024px) 560px, 100vw"
        className="absolute -left-[26%] top-0 h-auto w-[150%] max-w-none"
      />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(1);
  const [activeStep, setActiveStep] = useState(0);
  const [stepsPaused, setStepsPaused] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [ctaEmail, setCtaEmail] = useState('');

  const [demoFormData, setDemoFormData] = useState({
    nome: '',
    cargo: '',
    municipio: '',
    email: '',
    telefone: '',
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance the "how it works" stage; hovering the section pauses it.
  useEffect(() => {
    if (stepsPaused) return;
    const t = setTimeout(() => setActiveStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [activeStep, stepsPaused]);

  // Close the modal with Escape
  useEffect(() => {
    if (!isDemoModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsDemoModalOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDemoModalOpen]);

  function openDemo(email?: string) {
    if (email) setDemoFormData((p) => ({ ...p, email }));
    setIsDemoModalOpen(true);
  }

  function handleDemoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDemoSubmitted(true);
  }

  const input =
    'w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-[14px] text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20 focus:border-[#0A2540]';

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-[#0A0F1A] antialiased selection:bg-[#0A2540] selection:text-white">
      {/* ─── 1. NAVIGATION ─── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <header
          className={`transition-all duration-300 ${
            isScrolled ? 'border-b border-[#0A0F1A]/[0.08] bg-white/80 backdrop-blur-xl' : 'border-b border-transparent'
          }`}
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
            <Logo href="/landing" size="md" textStyle="simple" variant="dark" />

            <nav aria-label="Principal" className="hidden items-center gap-8 text-[14px] font-medium text-[#4A5362] md:flex">
              <a href="#plataforma" className="transition-colors hover:text-[#0A0F1A]">Plataforma</a>
              <a href="#como-funciona" className="transition-colors hover:text-[#0A0F1A]">Como funciona</a>
              <a href="#modulos" className="transition-colors hover:text-[#0A0F1A]">Módulos</a>
              <a href="#relatorios" className="transition-colors hover:text-[#0A0F1A]">Relatórios</a>
              <a href="#faq" className="transition-colors hover:text-[#0A0F1A]">Perguntas</a>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                id="nav-entrar"
                href={user ? '/' : '/login'}
                className="inline-flex items-center rounded-full border border-[#0A0F1A]/10 bg-white px-4 py-1.5 text-[14px] font-medium text-[#0A0F1A] shadow-[0_1px_2px_rgba(10,15,26,0.06)] transition-colors hover:bg-[#F6F7F9] active:scale-[0.98]"
              >
                {user ? 'Painel' : 'Entrar'}
              </Link>
              <button
                id="nav-agendar-demo"
                onClick={() => openDemo()}
                className="hidden items-center gap-1.5 rounded-full bg-[#0A0F1A] px-4 py-1.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1B2433] active:scale-[0.98] sm:inline-flex"
              >
                Agendar demo
                <ArrowUpRight size={14} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </header>
      </motion.div>

      <main>
        {/* ─── 2. HERO: Pure Tech Clean Canvas + Floating Window Showcase ─── */}
        <section className="relative overflow-hidden bg-white pt-32 sm:pt-40" aria-labelledby="hero-title">
          {/* Ambient top glow */}
          <div className="ld-hero-glow pointer-events-none absolute inset-x-0 top-0 h-[640px]" aria-hidden="true" />

          {/* Technical blueprint grid */}
          <div className="ld-tech-grid pointer-events-none absolute inset-x-0 top-0 h-[720px]" aria-hidden="true" />

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center"
          >
            <motion.div variants={fadeUp}>
              <SectionPill icon={Sparkles}>Zeladoria inteligente para prédios públicos</SectionPill>
            </motion.div>

            <motion.h1
              id="hero-title"
              variants={fadeUp}
              className="ld-display text-[44px] leading-[1.04] tracking-tight text-[#0A0F1A] sm:text-[64px] lg:text-[76px]"
            >
              Chamados resolvidos.
              <br />
              Contas em dia.
            </motion.h1>

            <motion.p variants={fadeUp} className="max-w-lg text-[16px] leading-relaxed text-[#4A5362] sm:text-[18px]">
              O Urboa organiza chamados, equipes e vistorias dos prédios públicos do seu município e deixa cada passo registrado.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
              <button
                id="hero-agendar-demo"
                onClick={() => openDemo()}
                className="inline-flex items-center gap-2 rounded-full bg-[#0A0F1A] px-7 py-3.5 text-[14px] font-medium text-white shadow-[0_4px_14px_rgba(10,15,26,0.18)] transition-all hover:bg-[#1B2433] hover:shadow-[0_6px_20px_rgba(10,15,26,0.24)] active:scale-[0.98]"
              >
                Agendar demonstração
                <ArrowRight size={15} strokeWidth={1.75} />
              </button>
              <Link
                href={user ? '/' : '/login'}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-[14px] font-medium text-[#0A0F1A] shadow-[0_1px_3px_rgba(10,15,26,0.06)] transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
              >
                Entrar na plataforma
              </Link>
            </motion.div>

            {/* Quick trust cues */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-[12px] text-[#6B7482]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Sem instalação local
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Padrão ABNT NBR 5674
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Implantação em menos de 15 dias
              </span>
            </motion.div>
          </motion.div>

          {/* Elevated application window showcase */}
          <motion.div
            id="plataforma"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.85, ease }}
            className="relative z-10 mx-auto mt-14 max-w-[1140px] scroll-mt-24 px-4 pb-16 sm:mt-16 sm:px-6 sm:pb-24"
          >
            {/* Ambient glow behind window */}
            <div className="pointer-events-none absolute -inset-x-6 top-10 -bottom-6 -z-10 rounded-[36px] bg-gradient-to-b from-blue-600/[0.05] via-slate-400/[0.03] to-transparent blur-2xl" />

            {/* macOS / browser style app window */}
            <div className="ld-window-shadow overflow-hidden rounded-[20px] border border-slate-200/90 bg-white">
              {/* Window titlebar */}
              <div className="flex h-11 items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-4">
                {/* Traffic lights */}
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border border-[#E0443E] bg-[#FF5F56]" />
                  <span className="h-3 w-3 rounded-full border border-[#DEA123] bg-[#FFBD2E]" />
                  <span className="h-3 w-3 rounded-full border border-[#1AAB29] bg-[#27C93F]" />
                </div>

                {/* Address pill */}
                <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3.5 py-1 text-[11px] font-mono text-slate-500 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>app.urboa.gov.br/gestao</span>
                </div>

                {/* Right status */}
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <span className="hidden md:inline text-slate-400">Ambiente Municipal</span>
                  <span className="rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    Mariana Alves · Gestora
                  </span>
                </div>
              </div>

              {/* Window content with real screenshot */}
              <div className="relative bg-slate-50">
                <Image
                  src={SHOTS.painel.src}
                  alt={SHOTS.painel.alt}
                  width={SHOTS.painel.w}
                  height={SHOTS.painel.h}
                  priority
                  sizes="(min-width: 1200px) 1140px, 100vw"
                  className="h-auto w-full object-cover object-top"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Compliance strip */}
        <section aria-label="Conformidade" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <p className="text-[14px] text-[#6B7482]">Construído para a governança pública</p>
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {COMPLIANCE.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-[#2E3746]">
                  <Icon size={18} strokeWidth={1.5} />
                  <span className="ld-display text-[18px]">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── 3. ROLES ─── */}
        <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
          <motion.div variants={stagger} {...inView} className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
            <motion.div variants={fadeUp}>
              <SectionPill icon={Users}>Para cada papel da zeladoria</SectionPill>
            </motion.div>
            <motion.h2 variants={fadeUp} className="ld-display text-[34px] leading-[1.1] sm:text-[48px]">
              O Urboa transforma pedidos soltos em <Muted>execução</Muted> organizada
            </motion.h2>
          </motion.div>

          <div
            role="tablist"
            aria-label="Perfis de uso"
            className="mx-auto mt-10 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-[#0A0F1A]/10 bg-white p-1 shadow-[0_1px_3px_rgba(10,15,26,0.06)]"
          >
            {ROLES.map((r, i) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={i === activeRole}
                id={`role-tab-${r.id}`}
                onClick={() => setActiveRole(i)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  i === activeRole ? 'bg-[#0A0F1A] text-white' : 'text-[#4A5362] hover:bg-[#F6F7F9]'
                }`}
              >
                <r.icon size={14} strokeWidth={1.75} />
                {r.tab}
              </button>
            ))}
          </div>

          <motion.div variants={stagger} {...inView} className="mt-8 grid items-stretch gap-4 md:grid-cols-3">
            {ROLES.map((r, i) => {
              const on = i === activeRole;
              return (
                <motion.button
                  key={r.id}
                  variants={fadeUp}
                  onClick={() => setActiveRole(i)}
                  aria-pressed={on}
                  className={`group flex min-h-[320px] flex-col justify-between rounded-[24px] border p-7 text-left transition-all duration-300 ${
                    on
                      ? 'border-[#0A0F1A] bg-[#0A0F1A] text-white shadow-[0_24px_48px_-12px_rgba(10,15,26,0.4)] md:-my-2'
                      : 'border-[#0A0F1A]/10 bg-white text-[#0A0F1A] hover:border-[#0A0F1A]/25'
                  }`}
                >
                  <div className="space-y-5">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${
                        on ? 'bg-white text-[#0A0F1A]' : 'bg-[#0A0F1A] text-white'
                      }`}
                    >
                      <r.icon size={20} strokeWidth={1.5} />
                    </span>
                    <div className="space-y-2">
                      <h3 className="text-[20px] font-medium leading-tight tracking-tight">{r.title}</h3>
                      <p className={`text-[14px] leading-relaxed ${on ? 'text-[#C9D1DD]' : 'text-[#4A5362]'}`}>{r.text}</p>
                    </div>
                    <ul className="space-y-2.5">
                      {r.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2.5 text-[14px] font-medium">
                          <Diamond className={on ? 'text-white' : 'text-[#0A0F1A]'} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p
                    className={`mt-8 border-t pt-4 text-[12px] ${
                      on ? 'border-white/15 text-[#C9D1DD]' : 'border-[#0A0F1A]/10 text-[#6B7482]'
                    }`}
                  >
                    <span className="font-medium">Acessa:</span> {r.access}
                  </p>
                </motion.button>
              );
            })}
          </motion.div>
        </section>

        {/* ─── 4. HOW IT WORKS ─── */}
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 sm:px-6 sm:pt-32">
          <motion.div variants={stagger} {...inView} className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
            <motion.div variants={fadeUp}>
              <SectionPill icon={Layers}>Como funciona</SectionPill>
            </motion.div>
            <motion.h2 variants={fadeUp} className="ld-display text-[34px] leading-[1.1] sm:text-[48px]">
              Do <Muted>chamado</Muted> à validação, sem perder nenhuma etapa
            </motion.h2>
          </motion.div>

          <div
            onMouseEnter={() => setStepsPaused(true)}
            onMouseLeave={() => setStepsPaused(false)}
            className="mt-14 grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16"
          >
            <StepStage active={activeStep} />

            <ol className="flex flex-col gap-2">
              {STEPS.map((s, i) => {
                const on = i === activeStep;
                return (
                  <li key={s.n}>
                    <button
                      id={`step-${s.n}`}
                      onClick={() => setActiveStep(i)}
                      aria-expanded={on}
                      className="group relative flex w-full gap-4 rounded-2xl p-4 text-left transition-colors hover:bg-[#F6F7F9]"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-medium transition-colors ${
                          on ? 'bg-[#0A0F1A] text-white' : 'bg-[#EEF1F5] text-[#4A5362]'
                        }`}
                      >
                        {s.n}
                      </span>
                      <span className="flex-1 space-y-2">
                        <span
                          className={`block text-[20px] font-medium leading-tight tracking-tight transition-colors ${
                            on ? 'text-[#0A0F1A]' : 'text-[#6B7482]'
                          }`}
                        >
                          {s.title}
                        </span>
                        <span
                          className={`grid transition-all duration-500 ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                          <span className="overflow-hidden">
                            <span className="block pb-1 text-[14px] leading-relaxed text-[#4A5362]">{s.text}</span>
                          </span>
                        </span>
                      </span>
                      {on && (
                        <span className="absolute inset-x-4 bottom-0 h-px overflow-hidden bg-[#0A0F1A]/10">
                          <span
                            key={`${activeStep}-${stepsPaused}`}
                            className={`block h-full bg-[#0A0F1A] ${stepsPaused ? '' : 'ld-fill'}`}
                            style={{ ['--ld-step-ms' as string]: `${STEP_MS}ms`, transform: stepsPaused ? 'scaleX(0)' : undefined }}
                          />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ─── 5. MODULES ─── */}
        <section id="modulos" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 sm:px-6 sm:pt-32">
          <motion.div variants={stagger} {...inView} className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
            <motion.div variants={fadeUp}>
              <SectionPill icon={Inbox}>Módulos</SectionPill>
            </motion.div>
            <motion.h2 variants={fadeUp} className="ld-display text-[34px] leading-[1.1] sm:text-[48px]">
              Toda a rede predial <Muted>na mesma tela</Muted>
            </motion.h2>
          </motion.div>

          <motion.div variants={stagger} {...inView} className="mt-14 grid gap-6 lg:grid-cols-2">
            <motion.article variants={fadeUp} className="rounded-[28px] border border-[#0A0F1A]/10 bg-white p-6 sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A0F1A] text-white">
                <Building2 size={20} strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 text-[24px] font-medium leading-tight tracking-tight">Unidades e instalações</h3>
              <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[#4A5362]">
                Escolas, UBS e praças em uma lista, com chamados ativos, urgências e o próximo passo operacional de cada prédio.
              </p>
              <ModuleShot shot={SHOTS.unidades} />
            </motion.article>

            <motion.article variants={fadeUp} className="rounded-[28px] border border-[#0A0F1A]/10 bg-white p-6 sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A0F1A] text-white">
                <CalendarDays size={20} strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 text-[24px] font-medium leading-tight tracking-tight">Agenda e planejamento</h3>
              <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[#4A5362]">
                Vistorias e manutenções preventivas distribuídas por semana e por equipe, para a rotina não virar emergência.
              </p>
              <ModuleShot shot={SHOTS.agenda} />
            </motion.article>
          </motion.div>
        </section>

        {/* ─── 6. REPORTS (big dark device frame) ─── */}
        <section id="relatorios" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 sm:px-6 sm:pt-32">
          <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <motion.div variants={fadeUp} {...inView} className="relative">
              <div className="rounded-[28px] bg-[#0A0F1A] p-2.5 shadow-[0_40px_80px_-24px_rgba(10,15,26,0.55)]">
                <div className="overflow-hidden rounded-[20px] bg-white">
                  <Image
                    src={SHOTS.relatorios.src}
                    alt={SHOTS.relatorios.alt}
                    width={SHOTS.relatorios.w}
                    height={SHOTS.relatorios.h}
                    sizes="(min-width: 1024px) 680px, 100vw"
                    className="h-auto w-full"
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-[13px] text-white">
                  <span className="flex items-center gap-2">
                    <ClipboardCheck size={15} strokeWidth={1.75} />
                    Relatórios e indicadores
                  </span>
                  <span className="text-[#C9D1DD]">Exportar CSV · Imprimir</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={stagger} {...inView} className="flex flex-col gap-6">
              <motion.div variants={fadeUp}>
                <SectionPill icon={FileCheck2}>Relatórios</SectionPill>
              </motion.div>
              <motion.h2 variants={fadeUp} className="ld-display text-[34px] leading-[1.1] sm:text-[44px]">
                Nada fica <Muted>esquecido</Muted> depois do chamado
              </motion.h2>
              <motion.p variants={fadeUp} className="max-w-md text-[15px] leading-relaxed text-[#4A5362]">
                Backlog, ocupação das equipes, saúde predial e taxa de resolução em uma única tela. Os prazos têm contagem regressiva e a agenda preventiva mostra o que vem a seguir.
              </motion.p>
              <motion.ul variants={fadeUp} className="space-y-3">
                {[
                  'Termômetro de SLA por faixa de vencimento',
                  'Cronograma de vistorias e preventivas',
                  'Exportação em CSV e impressão do relatório',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[14px] font-medium">
                    <CheckCircle2 size={18} strokeWidth={1.5} className="text-[#0A2540]" />
                    {item}
                  </li>
                ))}
              </motion.ul>
              <motion.div variants={fadeUp}>
                <button
                  onClick={() => openDemo()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0A0F1A] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1B2433] active:scale-[0.98]"
                >
                  Ver na prática
                  <ArrowRight size={14} strokeWidth={1.75} />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─── 7. FAQ ─── */}
        <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-3xl scroll-mt-20 px-4 pt-24 sm:px-6 sm:pt-32">
          <motion.div variants={stagger} {...inView} className="flex flex-col items-center gap-5 text-center">
            <motion.div variants={fadeUp}>
              <SectionPill icon={Sparkles}>Perguntas</SectionPill>
            </motion.div>
            <motion.h2 id="faq-title" variants={fadeUp} className="ld-display text-[34px] leading-[1.1] sm:text-[44px]">
              Perguntas, <Muted>respondidas</Muted>
            </motion.h2>
          </motion.div>

          <div className="mt-12 divide-y divide-[#0A0F1A]/10 border-y border-[#0A0F1A]/10">
            {FAQ.map((item, i) => {
              const on = openFaq === i;
              return (
                <div key={item.q}>
                  <h3>
                    <button
                      id={`faq-btn-${i}`}
                      aria-expanded={on}
                      aria-controls={`faq-panel-${i}`}
                      onClick={() => setOpenFaq(on ? -1 : i)}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left text-[16px] font-medium"
                    >
                      {item.q}
                      <span className="text-[#6B7482]">{on ? <Minus size={16} /> : <Plus size={16} />}</span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    className={`grid transition-all duration-300 ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-xl pb-5 text-[14px] leading-relaxed text-[#4A5362]">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 8. CTA ─── */}
        <section id="agendar-demo" aria-labelledby="cta-title" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-24 pt-16 sm:px-6 sm:pb-32 sm:pt-24">
          <motion.div
            variants={fadeUp}
            {...inView}
            className="flex flex-col items-center gap-6 rounded-[24px] bg-[#0A0F1A] px-6 py-12 text-center sm:px-12"
          >
            <h2 id="cta-title" className="ld-display text-[30px] leading-[1.1] text-white sm:text-[40px]">
              Veja o Urboa com a rede do seu município
            </h2>
            <p className="max-w-md text-[14px] leading-relaxed text-[#C9D1DD]">
              Uma demonstração de 20 minutos, com chamados, unidades e fluxos da sua secretaria.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                openDemo(ctaEmail);
              }}
              className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="cta-email" className="sr-only">
                E-mail institucional
              </label>
              <input
                id="cta-email"
                type="email"
                required
                autoComplete="email"
                value={ctaEmail}
                onChange={(e) => setCtaEmail(e.target.value)}
                placeholder="seu.nome@prefeitura.gov.br"
                className="h-11 flex-1 rounded-xl bg-white px-4 text-[14px] text-[#0A0F1A] placeholder:text-[#6B7482] focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <button
                id="cta-submit"
                type="submit"
                className="h-11 rounded-xl bg-white/10 px-5 text-[14px] font-medium text-white ring-1 ring-white/25 transition-colors hover:bg-white/20 active:scale-[0.98]"
              >
                Agendar demo
              </button>
            </form>
          </motion.div>
        </section>
      </main>

      {/* ─── 9. DEMO MODAL ─── */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0A0F1A]/50 p-4 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease }}
              className="relative w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 text-left text-[#0F172A] shadow-[0_30px_60px_rgba(0,0,0,0.25)] sm:p-8"
            >
              <button
                onClick={() => setIsDemoModalOpen(false)}
                aria-label="Fechar"
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
              >
                <X size={16} strokeWidth={1.5} />
              </button>

              {demoSubmitted ? (
                <div className="space-y-4 py-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-[#059669]">
                    <CheckCircle2 size={28} strokeWidth={1.5} />
                  </div>
                  <h3 id="modal-title" className="ld-display text-[26px]">
                    Solicitação registrada
                  </h3>
                  <p className="mx-auto max-w-sm text-[14px] leading-relaxed text-[#475569]">
                    Entraremos em contato em até 2 horas úteis pelo WhatsApp ou e-mail institucional.
                  </p>
                  <button
                    onClick={() => {
                      setDemoSubmitted(false);
                      setIsDemoModalOpen(false);
                    }}
                    className="rounded-full bg-[#0A0F1A] px-6 py-2.5 text-[14px] font-medium text-white hover:bg-[#1B2433]"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <span className="inline-flex items-center gap-2 text-[12px] font-medium text-[#0A2540]">
                    <Sparkles size={14} strokeWidth={1.5} />
                    Apresentação executiva Urboa
                  </span>
                  <h3 id="modal-title" className="ld-display text-[30px] leading-tight">
                    Agendar demonstração
                  </h3>
                  <p className="text-[14px] text-[#475569]">
                    Preencha os dados abaixo para receber uma demonstração personalizada para a sua prefeitura.
                  </p>

                  <div className="space-y-3.5 pt-1">
                    <div className="space-y-1">
                      <label htmlFor="modal-nome" className="text-[12px] font-medium">Nome completo</label>
                      <input id="modal-nome" required type="text" placeholder="Ex: Mariana Silva" value={demoFormData.nome} onChange={(e) => setDemoFormData((p) => ({ ...p, nome: e.target.value }))} className={input} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="modal-cargo" className="text-[12px] font-medium">Cargo</label>
                        <input id="modal-cargo" required type="text" placeholder="Secretário(a), Diretor(a)" value={demoFormData.cargo} onChange={(e) => setDemoFormData((p) => ({ ...p, cargo: e.target.value }))} className={input} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="modal-municipio" className="text-[12px] font-medium">Município e UF</label>
                        <input id="modal-municipio" required type="text" placeholder="Ex: Campinas - SP" value={demoFormData.municipio} onChange={(e) => setDemoFormData((p) => ({ ...p, municipio: e.target.value }))} className={input} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="modal-email" className="text-[12px] font-medium">E-mail institucional</label>
                        <input id="modal-email" required type="email" autoComplete="email" placeholder="nome@prefeitura.gov.br" value={demoFormData.email} onChange={(e) => setDemoFormData((p) => ({ ...p, email: e.target.value }))} className={input} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="modal-telefone" className="text-[12px] font-medium">WhatsApp</label>
                        <input id="modal-telefone" required type="tel" autoComplete="tel" placeholder="(11) 98765-4321" value={demoFormData.telefone} onChange={(e) => setDemoFormData((p) => ({ ...p, telefone: e.target.value }))} className={input} />
                      </div>
                    </div>
                  </div>

                  <button
                    id="modal-submit"
                    type="submit"
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0A0F1A] text-[14px] font-medium text-white transition-all hover:bg-[#1B2433] active:scale-[0.98]"
                  >
                    Solicitar apresentação
                    <ArrowRight size={14} strokeWidth={1.75} />
                  </button>
                  <p className="text-center text-[12px] text-slate-500">
                    Seus dados são protegidos conforme a LGPD e usados apenas para o contato institucional.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 10. FOOTER: Clean Tech & Municipal Governance ─── */}
      <footer className="border-t border-slate-200/80 bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
            <div className="flex flex-col gap-4">
              <Logo href="/landing" size="md" textStyle="simple" variant="dark" />
              <p className="max-w-sm text-[14px] leading-relaxed text-[#4A5362]">
                Gestão e zeladoria predial pública de alta precisão. Rastreabilidade completa do chamado à validação municipal.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[12px] font-medium text-[#4A5362]">Plataforma operacional · Alta disponibilidade</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#0A0F1A]">Navegação</p>
                <ul className="space-y-3 text-[14px] text-[#4A5362]">
                  <li><a href="#plataforma" className="transition-colors hover:text-[#0A0F1A]">Visão geral</a></li>
                  <li><a href="#como-funciona" className="transition-colors hover:text-[#0A0F1A]">Como funciona</a></li>
                  <li><a href="#modulos" className="transition-colors hover:text-[#0A0F1A]">Módulos</a></li>
                  <li><a href="#relatorios" className="transition-colors hover:text-[#0A0F1A]">Relatórios</a></li>
                  <li><a href="#faq" className="transition-colors hover:text-[#0A0F1A]">Perguntas frequentes</a></li>
                </ul>
              </div>
              <div>
                <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#0A0F1A]">Acesso rápido</p>
                <ul className="space-y-3 text-[14px] text-[#4A5362]">
                  <li><Link href="/login" className="transition-colors hover:text-[#0A0F1A]">Painel de gestão</Link></li>
                  <li><Link href="/abrir-chamado" className="transition-colors hover:text-[#0A0F1A]">Abrir chamado</Link></li>
                  <li>
                    <button onClick={() => openDemo()} className="transition-colors hover:text-[#0A0F1A]">
                      Agendar demonstração
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#0A0F1A]">Governança</p>
                <ul className="space-y-3 text-[14px] text-[#4A5362]">
                  <li className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-slate-400" />
                    <span>ABNT NBR 5674</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Fingerprint size={15} className="text-slate-400" />
                    <span>Registro auditável</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Scale size={15} className="text-slate-400" />
                    <span>Prestação de contas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-slate-400" />
                    <span>LGPD e conformidade</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 text-[13px] text-[#8B93A1] sm:flex-row">
            <p>&copy; {new Date().getFullYear()} Urboa Tecnologia para Cidades. Todos os direitos reservados.</p>
            <p className="text-[12px]">Desenvolvido para secretarias, diretorias e prefeituras do Brasil.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
