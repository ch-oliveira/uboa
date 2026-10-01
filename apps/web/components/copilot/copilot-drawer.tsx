'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ShieldCheck,
  History,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  MessageSquare,
  AlertTriangle,
  BrainCircuit,
  ClipboardList,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useOrders } from '@/context/orders-context';
import { UrbiMessageContent } from './urbi-message-content';

export interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolsExecuted?: Array<{
    name: string;
    params: any;
    result: any;
  }>;
  suggestions?: string[];
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMsg[];
}

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY_SESSIONS = 'urboa_urbi_chat_sessions_v2';
const STORAGE_KEY_ACTIVE = 'urboa_urbi_active_session_v2';

export function CopilotDrawer({ isOpen, onClose }: CopilotDrawerProps) {
  const { refreshData } = useOrders();
  
  // Multi-session State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isHistoryViewOpen, setIsHistoryViewOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Controle de exibição do nome no cabeçalho
  const [showIdentity, setShowIdentity] = useState(false);

  // Active Chat State
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
      const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        setSessions(parsed);
        if (activeId) {
          const found = parsed.find((s) => s.id === activeId);
          if (found) {
            setCurrentSessionId(found.id);
            setMessages(found.messages);
            return;
          }
        }
        const first = parsed[0];
        if (first) {
          setCurrentSessionId(first.id);
          setMessages(first.messages);
          return;
        }
      }
    } catch {
      // LocalStorage fallback
    }

    // Initialize initial default session
    const newSessionId = `session-${Date.now()}`;
    const initialSession: ChatSession = {
      id: newSessionId,
      title: 'Nova Consulta',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions([initialSession]);
    setCurrentSessionId(newSessionId);
    setMessages([]);
  }, []);

  // Save Sessions to localStorage
  const saveSessionsToStorage = (updatedSessions: ChatSession[], activeId: string) => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updatedSessions));
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeId);
    } catch {
      // ignore storage quota issues
    }
  };

  // Sync active messages with current session
  useEffect(() => {
    if (!currentSessionId) return;

    setSessions((prev) => {
      const index = prev.findIndex((s) => s.id === currentSessionId);
      if (index === -1) return prev;
      const targetSession = prev[index];
      if (!targetSession) return prev;

      // Generate smart title from first user message if still default
      let title = targetSession.title;
      if (title === 'Nova Consulta' && messages.length > 0) {
        const firstUser = messages.find((m) => m.role === 'user');
        if (firstUser) {
          title = firstUser.content.slice(0, 36) + (firstUser.content.length > 36 ? '...' : '');
        }
      }

      const updated = [...prev];
      updated[index] = {
        ...targetSession,
        title,
        updatedAt: Date.now(),
        messages,
      };

      saveSessionsToStorage(updated, currentSessionId);
      return updated;
    });
  }, [messages, currentSessionId]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Esc key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isHistoryViewOpen) {
          setIsHistoryViewOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isHistoryViewOpen, onClose]);

  // Create New Chat Session
  const handleCreateNewSession = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'Nova Consulta',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    const updated = [newSession, ...sessions.filter((s) => s.messages.length > 0)];
    setSessions(updated);
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setIsHistoryViewOpen(false);
    saveSessionsToStorage(updated, newSessionId);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Switch Chat Session
  const handleSelectSession = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      setCurrentSessionId(target.id);
      setMessages(target.messages);
      setIsHistoryViewOpen(false);
      saveSessionsToStorage(sessions, target.id);
    }
  };

  // Delete Chat Session
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    if (filtered.length === 0) {
      const freshId = `session-${Date.now()}`;
      const freshSession: ChatSession = {
        id: freshId,
        title: 'Nova Consulta',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      setSessions([freshSession]);
      setCurrentSessionId(freshId);
      setMessages([]);
      saveSessionsToStorage([freshSession], freshId);
    } else {
      setSessions(filtered);
      if (currentSessionId === sessionId) {
        const fallback = filtered[0];
        if (fallback) {
          setCurrentSessionId(fallback.id);
          setMessages(fallback.messages);
          saveSessionsToStorage(filtered, fallback.id);
        }
      } else {
        saveSessionsToStorage(filtered, currentSessionId);
      }
    }
  };

  // Copy message to clipboard
  const handleCopyMessage = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await apiClient.sendAiChat(text, history);

      const assistantMessage: ChatMsg = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: res.reply,
        toolsExecuted: res.toolsExecuted,
        suggestions: res.suggestions,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (res.toolsExecuted?.some((t) => t.name === 'abrirChamadoRapido')) {
        await refreshData();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: 'Identificamos uma oscilação na conexão com o servidor municipal. Por gentileza, repita sua consulta.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/20 transition-opacity animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container - Maior para melhor legibilidade (~500px) */}
      <div className="relative w-full max-w-[500px] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-slate-200">
        
        <style>{`
          @keyframes wrench-twist {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(-30deg); }
            40%, 60% { transform: rotate(45deg); }
            80% { transform: rotate(-15deg); }
          }
          @keyframes ai-scan {
            0% { transform: translateY(-100%); }
            50% { transform: translateY(100%); }
            100% { transform: translateY(-100%); }
          }
        `}</style>

        {/* 1. HEADER EXECUTIVO COM AÇÕES E HISTÓRICO */}
        <div className="p-4 px-5 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-md border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setShowIdentity(!showIdentity)}
              className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm border border-slate-700 relative overflow-hidden group hover:bg-slate-700 transition-colors"
              title="Clique para revelar a identidade"
            >
              <Bot size={20} className="text-slate-200 relative z-10 group-hover:scale-110 transition-transform" />
              <Wrench size={10} className="absolute bottom-1 right-1 text-fuchsia-400 animate-[wrench-twist_1.5s_ease-in-out_infinite] z-20" />
              <div className="absolute inset-0 w-full h-[2px] bg-fuchsia-500/50 blur-[1px] animate-[ai-scan_2s_ease-in-out_infinite] z-0" />
            </button>
            
            <div 
              className={`flex flex-col justify-center overflow-hidden transition-all duration-300 ease-out ${
                showIdentity ? 'max-w-[150px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'
              }`}
            >
              <div className="flex items-center gap-2 w-max">
                <h2 className="font-bold text-white text-[15px] tracking-tight whitespace-nowrap">urBIA</h2>
              </div>
              <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Zeladoria Municipal</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Botão Nova Conversa */}
            <button
              type="button"
              onClick={handleCreateNewSession}
              title="Nova Consulta (+)"
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={16} />
            </button>

            {/* Botão Histórico de Conversas */}
            <button
              type="button"
              onClick={() => setIsHistoryViewOpen(!isHistoryViewOpen)}
              title="Histórico de Consultas"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isHistoryViewOpen 
                  ? 'bg-white text-slate-900' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <History size={16} />
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={onClose}
              title="Fechar painel (Esc)"
              className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Barra de Origem dos Dados (Data Provenance & Context) */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="truncate">Contexto: Operação Municipal</span>
          <span className="text-[10px] text-slate-700 font-bold bg-slate-200/70 px-2 py-0.5 rounded shrink-0">
            Fonte: Base Oficial
          </span>
        </div>

        {/* 2. PAINEL DE HISTÓRICO — lista simples */}
        {isHistoryViewOpen && (
          <div className="bg-white border-b border-slate-200 max-h-64 overflow-y-auto animate-in slide-in-from-top-3 duration-200">
            
            {sessions.filter((s) => s.messages.length > 0).length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-400">
                Nenhuma conversa salva ainda.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sessions
                  .filter((s) => s.messages.length > 0)
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .map((session) => {
                    const isSelected = session.id === currentSessionId;
                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => handleSelectSession(session.id)}
                        className={`w-full text-left px-5 py-3 flex items-center justify-between gap-3 transition-colors group cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100/80'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className={`text-[13px] font-semibold truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                            {session.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(session.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            {' · '}
                            {session.messages.length} msgs
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            role="button"
                            onClick={(e) => handleDeleteSession(e, session.id)}
                            title="Excluir"
                            className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={13} />
                          </span>
                          <ChevronRight size={13} className={isSelected ? 'text-slate-900' : 'text-slate-300'} />
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* 3. MESSAGES LIST */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-7 bg-slate-50/80">
          
          {/* WELCOME — estilo chat: uma mensagem de boas-vindas do Urbi + chips */}
          {messages.length === 0 && (
            <div className="space-y-4">

              {/* Balão de boas-vindas do Urbi */}
              <div className="flex flex-col gap-3 justify-start">
                <div className="w-full space-y-4">
                  <div 
                    className="p-5 sm:p-6 rounded-2xl bg-white text-slate-900 border-2 border-slate-200 border-b-[5px] shadow-sm text-sm leading-relaxed animate-in slide-in-from-bottom-4 fade-in duration-500"
                    style={{ animationFillMode: 'both' }}
                  >
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm border border-slate-800 relative overflow-hidden group">
                        {/* A Robô urBIA */}
                        <Bot size={20} className="text-slate-200 relative z-10" />
                        <Wrench size={10} className="absolute bottom-1 right-1 text-fuchsia-400 animate-[wrench-twist_1.5s_ease-in-out_infinite] z-20" />
                        
                        {/* Efeito de Scanner "Feminino/IA" (Fuchsia/Pink) */}
                        <div className="absolute inset-0 w-full h-[2px] bg-fuchsia-500/50 blur-[1px] animate-[ai-scan_2s_ease-in-out_infinite] z-0" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-[16px] leading-snug">Olá! Sou a urBIA, sua assistente.</h3>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed">Posso consultar chamados, calcular equipe necessária, verificar prazos e abrir ordens de serviço. Como posso te ajudar?</p>
                  </div>

                  {/* Chips de ação rápida 3D */}
                  <div className="flex flex-col gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Quantos técnicos precisamos para zerar a fila em 15 dias?')}
                      className="text-[13px] font-bold text-slate-700 bg-white border-2 border-slate-200 px-5 py-3 rounded-xl transition-all cursor-pointer text-left shadow-[0_4px_0_0_#e2e8f0] hover:shadow-[0_2px_0_0_#e2e8f0] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] w-fit animate-in slide-in-from-bottom-3 fade-in duration-500"
                      style={{ animationDelay: '150ms', animationFillMode: 'both' }}
                    >
                      Quantos técnicos precisamos?
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Qual o resumo geral dos chamados?')}
                      className="text-[13px] font-bold text-slate-700 bg-white border-2 border-slate-200 px-5 py-3 rounded-xl transition-all cursor-pointer text-left shadow-[0_4px_0_0_#e2e8f0] hover:shadow-[0_2px_0_0_#e2e8f0] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] w-fit animate-in slide-in-from-bottom-3 fade-in duration-500"
                      style={{ animationDelay: '250ms', animationFillMode: 'both' }}
                    >
                      Resumo dos chamados
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Quais prédios têm chamados urgentes?')}
                      className="text-[13px] font-bold text-slate-700 bg-white border-2 border-slate-200 px-5 py-3 rounded-xl transition-all cursor-pointer text-left shadow-[0_4px_0_0_#e2e8f0] hover:shadow-[0_2px_0_0_#e2e8f0] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] w-fit animate-in slide-in-from-bottom-3 fade-in duration-500"
                      style={{ animationDelay: '350ms', animationFillMode: 'both' }}
                    >
                      Prédios com urgências
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* LISTA DE MENSAGENS COM AVATAR CORRIGIDO E SEM AUDITORIA TÉCNICA */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isCopied = copiedMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-end ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Conteúdo da Mensagem */}
                <div className={`space-y-2 ${isUser ? 'max-w-[85%] sm:max-w-[80%] flex flex-col items-end' : 'w-full'}`}>
                  
                  {/* Balão de Texto Principal */}
                  <div
                    className={`p-5 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-br-sm shadow-xs text-left'
                        : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                    }`}
                  >
                    {!isUser ? (
                      <UrbiMessageContent content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap font-sans font-medium text-white">
                        {msg.content}
                      </div>
                    )}

                    {/* Rodapé do Balão com Origem dos Dados */}
                    <div className={`text-[10px] mt-3 flex items-center justify-between gap-4 ${
                      isUser ? 'text-slate-300 mt-2' : 'text-slate-400 border-t border-slate-100 pt-2'
                    }`}>
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-medium text-slate-500 truncate">
                              Fonte: Base Oficial de Chamados
                            </span>
                          </>
                        )}
                      </div>

                      {!isUser ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            title="Copiar resposta"
                            className="flex items-center gap-1 text-slate-400 hover:text-blue-800 transition-colors cursor-pointer"
                          >
                            {isCopied ? <Check size={11} className="text-blue-600" /> : <Copy size={11} />}
                            <span className="text-[10px]">{isCopied ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-300">
                          Você
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Prévia e Confirmação de Ação Proposta pela IA */}
                  {!isUser && msg.toolsExecuted && msg.toolsExecuted.some(t => t.name === 'abrirChamadoRapido' || t.name === 'designarEquipe') && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                          <span>Ação sugerida pela IA</span>
                        </div>
                        <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                          Prévia e Confirmação
                        </span>
                      </div>
                      
                      {msg.toolsExecuted.filter(t => t.name === 'abrirChamadoRapido' || t.name === 'designarEquipe').map((t, idx) => (
                        <div key={idx} className="text-xs text-amber-950 font-medium bg-white/80 p-2.5 rounded-lg border border-amber-100">
                          <p className="font-bold text-slate-800">
                            {t.name === 'abrirChamadoRapido' ? 'Abertura de Chamado' : 'Designação de Equipe'}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {t.name === 'abrirChamadoRapido' 
                              ? (t.params?.titulo || t.params?.facilityName || 'Operação contextual registrada com sucesso.')
                              : `Designar ${t.params?.tecnicoNome} para a OS ${t.params?.osCodigo}`}
                          </p>
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                        <span className="text-[10px] text-slate-500">Alteração auditada no log</span>
                        <button
                          type="button"
                          onClick={() => refreshData()}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Confirmar ação
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sugestões de Continuidade (sem expor nomes de ferramentas) */}
                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-col gap-3 pt-3">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMessage(sug)}
                          className="text-[13px] font-bold text-slate-700 bg-white border-2 border-slate-200 px-5 py-3 rounded-xl transition-all cursor-pointer text-left shadow-[0_4px_0_0_#e2e8f0] hover:shadow-[0_2px_0_0_#e2e8f0] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] w-fit"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Avatar do Usuário Perfeitamente Alinhado à Direita e Embaixo */}
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm border border-slate-700 mt-auto">
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator Elegante e Inteligente (IA) */}
          {isLoading && (
            <div className="flex justify-start items-end animate-in fade-in slide-in-from-bottom-2 duration-300 mb-2">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm w-[260px] space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center shrink-0 shadow-sm border border-slate-800">
                    <Bot size={13} className="text-fuchsia-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">Processando contexto...</span>
                </div>
                
                {/* Skeleton Loader de "Análise de Dados" */}
                <div className="space-y-2.5 w-full">
                  <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full w-1/2 bg-slate-300 rounded-full animate-[slide-right_1.5s_ease-in-out_infinite_alternate]" />
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full w-3/4 overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full w-1/3 bg-slate-200 rounded-full animate-[slide-right_1.2s_ease-in-out_infinite_alternate-reverse]" />
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full w-5/6 overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full w-2/5 bg-slate-200 rounded-full animate-[slide-right_1.8s_ease-in-out_infinite_alternate]" />
                  </div>
                </div>
                
                <style>{`
                  @keyframes slide-right {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                  }
                `}</style>
              </div>
            </div>
          )}
        </div>

        {/* 4. INPUT AREA EXECUTIVA */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Solicitar parecer, dimensionamento, relatório..."
              disabled={isLoading}
              className="flex-1 bg-white hover:bg-slate-50 focus:bg-white text-[14px] text-slate-800 border-2 border-slate-700 rounded-xl px-5 py-4 focus:outline-hidden focus:ring-1 focus:ring-slate-900 transition-all font-medium placeholder:text-slate-400"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 p-0 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-black cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Send size={18} className="-ml-0.5" />
            </Button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Pressione Enter para enviar • Esc para fechar</span>
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <ShieldCheck size={12} />
              Ambiente Seguro • Dados Auditados Prefeitura
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
