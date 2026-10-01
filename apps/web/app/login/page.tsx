'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2,
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertTriangle, 
  QrCode,
  Eye,
  EyeOff,
  HelpCircle,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';

// Refactoring UI: Natural Spring Physics
const cubicSpring = [0.16, 1, 0.3, 1] as const;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Informe o e-mail de acesso institucional.');
      return;
    }
    if (!password) {
      setErrorMsg('Informe a senha de acesso.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      let msg = res.message || 'Credenciais inválidas. Verifique seu e-mail e senha.';
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('123')) {
        msg = 'Credenciais inválidas. Verifique seu e-mail e senha institucional.';
      }
      setErrorMsg(msg);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#2563EB]/20 selection:text-[#0F172A] relative overflow-x-hidden flex flex-col justify-between items-center py-10 sm:py-14 px-4 sm:px-6">
      
      {/* ─── AMBIENT CANVAS LIGHTING (Refactoring UI: Subtle Surface Depth) ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#2563EB]/[0.04] via-[#7C3AED]/[0.02] to-transparent rounded-full blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.025]" 
          style={{ 
            backgroundImage: 'linear-gradient(#0A2540 1px, transparent 1px), linear-gradient(90deg, #0A2540 1px, transparent 1px)', 
            backgroundSize: '48px 48px' 
          }} 
        />
      </div>

      {/* ─── 1. TOP HEADER: STANDARDIZED BRAND LOGO ('u. Urboa Tecnologia') ─── */}
      <motion.div 
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: cubicSpring }}
        className="relative z-10 flex flex-col items-center gap-2"
      >
        <Logo href="/landing" size="lg" textStyle="tecnologia" />
      </motion.div>

      {/* ─── 2. CENTERED AUTHENTICATION CARD (Refactoring UI: Raised Profile, Lit Edge) ─── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: cubicSpring }}
        className="relative z-10 w-full max-w-md my-auto"
      >
        <div className="rounded-3xl bg-white p-7 sm:p-9 border border-slate-200/90 shadow-[0_20px_40px_rgba(15,23,42,0.06),0_2px_4px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.95)] space-y-6 text-left">
          
          {/* Card Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              Acesse sua conta
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed">
              Digite suas credenciais institucionais para gerenciar a zeladoria e manutenção municipal.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-in fade-in duration-200">
              <AlertTriangle size={15} strokeWidth={1.5} className="text-rose-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* E-mail Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#0F172A]">
                E-mail Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gestor@urboa.gov.br"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-[#F8FAFC] text-xs sm:text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] focus:bg-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[#0F172A]">
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-[#F8FAFC] text-xs sm:text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] focus:bg-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0A2540] focus:ring-[#2563EB]"
                />
                <span className="text-xs text-[#475569] font-medium">
                  Manter sessão ativa neste dispositivo
                </span>
              </label>
            </div>

            {/* Solid Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-[#0A2540] hover:bg-[#07192C] text-white font-bold text-xs sm:text-sm shadow-[0_4px_12px_rgba(10,37,64,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Validando Acesso...
                </span>
              ) : (
                <>
                  <span>Entrar na Plataforma</span>
                  <ArrowRight size={15} strokeWidth={1.5} />
                </>
              )}
            </button>

          </form>

          {/* Tertiary Action: Solicitante Portal Link */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
            <Link 
              href="/abrir-chamado" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#0A2540] transition-colors"
            >
              <QrCode size={14} strokeWidth={1.5} className="text-[#2563EB]" />
              <span>É diretor de escola ou UBS? <strong>Abrir chamado sem login →</strong></span>
            </Link>
          </div>

        </div>
      </motion.div>

      {/* ─── 3. BOTTOM FOOTER & SECURITY GUARANTEES ─── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative z-10 flex flex-col items-center justify-center text-[11px] text-[#64748B] gap-2.5 max-w-md w-full pt-6 text-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5 font-medium text-emerald-600">
            <ShieldCheck size={13} strokeWidth={1.8} />
            Conexão Segura TLS 1.3
          </span>
          <span className="text-slate-300">•</span>
          <span>Acesso Restrito</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">ABNT NBR 5674</span>
        </div>
        <Link href="/landing" className="hover:text-[#0F172A] text-slate-500 font-medium transition-colors hover:underline">
          Voltar para a página inicial
        </Link>
      </motion.div>

      {/* ─── MODAL: ESQUECEU A SENHA ─── */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: cubicSpring }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-slate-200 relative text-left"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#2563EB] flex items-center justify-center font-bold">
                  <HelpCircle size={20} strokeWidth={1.5} />
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>

              <div className="space-y-2 text-left">
                <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Recuperação de Acesso</h3>
                <p className="text-xs text-[#475569] leading-relaxed font-normal">
                  Por motivos de segurança e conformidade da administração pública, a redefinição de senhas de servidores municipais é gerenciada pelo Departamento de Tecnologia da Informação (DTI).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-xs space-y-1.5 text-slate-700 text-left">
                <p className="font-bold text-[#0F172A]">Canais de Suporte Interno:</p>
                <p className="text-slate-600">• Ramal Interno: <strong className="text-[#0F172A]">8900</strong> (DTI Zeladoria)</p>
                <p className="text-slate-600">• E-mail: <strong className="text-[#0F172A]">suporte.ti@urboa.gov.br</strong></p>
                <p className="text-slate-600">• Horário: Segunda a Sexta, das 07h30 às 18h00</p>
              </div>

              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full bg-[#0A2540] hover:bg-[#07192C] text-white font-bold text-xs h-11 rounded-full cursor-pointer transition-all active:scale-[0.98]"
              >
                Compreendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
