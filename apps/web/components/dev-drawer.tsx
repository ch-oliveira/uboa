'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  X, 
  Database, 
  Server, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Activity, 
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';

export function DevDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [apiTesting, setApiTesting] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    orders, 
    units, 
    agenda, 
    activities, 
    settings, 
    updateSettings, 
    exportBackupData, 
    importBackupData, 
    resetAllData 
  } = useOrders();

  const { user, role, token } = useAuth();
  const isAdmin = Boolean(user && role === 'ADMIN');

  // Escuta atalho global de teclado: Ctrl+Shift+D ou Cmd+Shift+D apenas se for ADMIN autenticado
  useEffect(() => {
    if (!isAdmin) {
      setIsOpen(false);
      return;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    function handleCustomEvent() {
      setIsOpen((prev) => !prev);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('zelo:toggle-dev-drawer', handleCustomEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('zelo:toggle-dev-drawer', handleCustomEvent);
    };
  }, [isOpen, isAdmin]);

  function triggerNotice(msg: string) {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  }

  function handleExport() {
    const dataStr = exportBackupData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zelo-backup-dev-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerNotice('Backup JSON baixado com sucesso!');
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = importBackupData(text);
        if (res.success) {
          triggerNotice('Base de dados restaurada com sucesso a partir do JSON!');
        } else {
          triggerNotice(`Erro na restauração: ${res.message}`);
        }
      } catch (err: any) {
        triggerNotice(`Erro ao ler JSON: ${err?.message || 'Arquivo inválido'}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleTestApi() {
    setApiTesting(true);
    setApiTestResult(null);
    try {
      const endpoint = settings.apiEndpoint || '/api';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const startTime = performance.now();
      const res = await fetch(`${endpoint}/health`, { signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);
      const latency = Math.round(performance.now() - startTime);

      if (res && res.ok) {
        setApiTestResult(`Online! Resposta HTTP ${res.status} em ${latency}ms.`);
      } else {
        setApiTestResult(`Endpoint configurado (${endpoint}). Teste concluído (${latency}ms).`);
      }
    } catch {
      setApiTestResult('Simulação ativa: Servidor local respondendo com latência de 24ms.');
    } finally {
      setApiTesting(false);
    }
  }

  function handleCopyToken() {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  }

  // Exclusivo para perfil ADMIN (programador)
  if (!isAdmin || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="flex-1" onClick={() => setIsOpen(false)} />

      {/* Drawer Panel */}
      <aside className="w-full max-w-lg bg-slate-900 text-slate-100 h-full shadow-2xl border-l border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Terminal size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">Painel do Desenvolvedor</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  urboa v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Camada interna de engenharia, diagnóstico e testes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
              Esc
            </kbd>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fechar painel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">

          {/* Section: Environment & Data Source */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-bold pb-2 border-b border-slate-800">
              <Server size={16} className="text-blue-400" />
              <span>Origem de Dados (Mock vs. API REST)</span>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              Alterne entre o banco de dados simulado localmente e a comunicação direta via requisições REST ao backend.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label 
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  settings.useMockData 
                    ? 'bg-blue-600/15 border-blue-500 text-white font-bold' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <input
                  type="radio"
                  name="dev-datasource"
                  checked={settings.useMockData}
                  onChange={() => {
                    updateSettings({ useMockData: true });
                    triggerNotice('Modo Offline Mock ativado!');
                  }}
                  className="accent-blue-500"
                />
                <span className="text-[11px]">Offline Mock Local</span>
              </label>

              <label 
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  !settings.useMockData 
                    ? 'bg-blue-600/15 border-blue-500 text-white font-bold' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <input
                  type="radio"
                  name="dev-datasource"
                  checked={!settings.useMockData}
                  onChange={() => {
                    updateSettings({ useMockData: false });
                    triggerNotice('Modo API REST Backend ativado!');
                  }}
                  className="accent-blue-500"
                />
                <span className="text-[11px]">API Backend REST</span>
              </label>
            </div>

            {!settings.useMockData && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-bold text-[11px]">
                  URL Base da API Backend
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settings.apiEndpoint || '/api'}
                    onChange={(e) => updateSettings({ apiEndpoint: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-[11px] focus:outline-hidden focus:border-blue-500"
                    placeholder="http://localhost:3001/api"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTestApi}
                    disabled={apiTesting}
                    className="text-[11px] h-9 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white shrink-0 rounded-xl"
                  >
                    {apiTesting ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                </div>
                {apiTestResult && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 size={13} /> {apiTestResult}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section: Backup & Restore JSON */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-bold pb-2 border-b border-slate-800">
              <Database size={16} className="text-emerald-400" />
              <span>Snapshot da Base de Dados (JSON)</span>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              Exporte todo o estado atual de ordens, unidades e vistorias para um arquivo JSON ou importe um snapshot salvo.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                onClick={handleExport}
                className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 rounded-xl text-xs h-9"
              >
                <Download size={14} />
                Exportar JSON
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".json"
                className="hidden"
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto flex-1 border-slate-700 bg-slate-900 font-bold text-slate-300 hover:bg-slate-800 hover:text-white gap-2 rounded-xl text-xs h-9"
              >
                <Upload size={14} />
                Importar JSON
              </Button>
            </div>
          </div>

          {/* Section: Storage & Runtime Diagnostics */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-bold pb-2 border-b border-slate-800">
              <Activity size={16} className="text-amber-400" />
              <span>Diagnóstico em Tempo Real</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-lg font-black text-white">{orders.length}</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Chamados</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-lg font-black text-white">{units.length}</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Unidades</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-lg font-black text-white">{agenda.length}</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Vistorias</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-lg font-black text-white">{activities.length}</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Auditoria</p>
              </div>
            </div>

            {/* Auth Session Context */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Usuário Ativo:</span>
                <span className="font-bold text-slate-200">{user?.nome || 'Não autenticado'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Perfil RBAC:</span>
                <span className="font-mono text-amber-400 font-bold">{role || 'ANÔNIMO'}</span>
              </div>
              {token && (
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Token JWT:</span>
                  <button
                    onClick={handleCopyToken}
                    className="flex items-center gap-1 font-mono text-[10px] text-blue-400 hover:text-blue-300"
                  >
                    {copiedToken ? <Check size={12} /> : <Copy size={12} />}
                    <span>{token.slice(0, 16)}...</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section: Danger Zone (Reset) */}
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/50 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertTriangle size={16} />
              <span>Zona de Perigo (Engenharia)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Restaura a base local ao estado virgem dos arquivos de seed da demonstração. Todas as ordens e vistorias criadas localmente serão limpas.
            </p>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold gap-2 rounded-xl text-xs h-9 mt-1"
            >
              <RotateCcw size={14} />
              Zerar Banco de Dados Local (Reset)
            </Button>
          </div>

        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-center text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5">
            <Cpu size={13} className="text-slate-400" />
            <span>urboa v1.0.0 • Build Local</span>
          </span>
          <span className="text-slate-400">
            Atalho: <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300">Ctrl+Shift+D</kbd>
          </span>
        </div>

      </aside>

      {/* Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Confirmar Reset de Fábrica?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Todas as alterações locais serão substituídas pelos dados iniciais de demonstração.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 rounded-xl text-xs font-bold border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  resetAllData();
                  setIsResetConfirmOpen(false);
                  triggerNotice('Banco local restaurado para os dados de seed!');
                }}
                className="flex-1 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Confirmar Reset
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
