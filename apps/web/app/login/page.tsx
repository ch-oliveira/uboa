'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertTriangle, 
  QrCode,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      setErrorMsg(res.message || 'Credenciais inválidas.');
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white">
        <Link href="/landing" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#1e293b] rounded-lg flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <div className="w-4 h-4 bg-white rounded-xs transform rotate-45" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">zelo.</span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link href="/abrir-chamado" className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
            <QrCode size={14} className="text-[#1D6FEB]" />
            <span className="hidden sm:inline">Portal do</span> Solicitante
          </Link>
          <Link href="/landing" className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
            <Globe size={14} className="text-slate-400" />
            <span className="hidden sm:inline">Página</span> Inicial
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="max-w-md w-full space-y-6">

          {/* Login Form Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-50 text-[#1D6FEB] rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
                <ShieldCheck size={26} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Acesso ao Sistema Integrado</h1>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Prefeitura Municipal de Gestão Urbana • Plataforma de Zeladoria e Manutenção Predial
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" /> E-mail Institucional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: gestor@zelo.gov.br"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#1D6FEB] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Lock size={13} className="text-slate-400" /> Senha de Acesso
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#1D6FEB] transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1D6FEB] hover:bg-[#1557BA] text-white font-bold text-xs h-11 rounded-xl shadow-md shadow-blue-500/20 gap-2 cursor-pointer transition-all mt-2"
              >
                {loading ? 'Validando acesso...' : 'Entrar na Plataforma'}
                <ArrowRight size={15} />
              </Button>
            </form>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-200/80 bg-white text-center text-[11px] text-slate-400">
        Prefeitura Municipal de Gestão Urbana • zelo. Segurança da Informação & ABNT NBR 5674
      </footer>

    </div>
  );
}
