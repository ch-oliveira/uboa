'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Megaphone, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Send, 
  Wrench, 
  Archive, 
  ExternalLink, 
  ChevronRight, 
  Check, 
  X, 
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ThumbsUp,
  FileText,
  MapPin
} from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { TopHeader } from '@/components/top-header';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { useOrders } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';
import type { 
  ManifestacaoItem, 
  StatusManifestacao, 
  TipoManifestacao, 
  ManifestacoesMeta 
} from '@/types/manifestacao';

type StatusFilter = 'TODOS' | StatusManifestacao;
type TipoFilter = 'TODOS' | TipoManifestacao;

export default function OuvidoriaPage() {
  const { units } = useOrders();
  const { user, role } = useAuth();

  const [manifestacoes, setManifestacoes] = useState<ManifestacaoItem[]>([]);
  const [meta, setMeta] = useState<ManifestacoesMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('TODOS');
  const [selectedTipo, setSelectedTipo] = useState<TipoFilter>('TODOS');
  const [selectedUnit, setSelectedUnit] = useState<string>('TODOS');

  // Modal de Detalhes e Ação
  const [activeItem, setActiveItem] = useState<ManifestacaoItem | null>(null);
  const [modalTab, setModalTab] = useState<'RESPONDER' | 'CONVERTER' | 'ARQUIVAR'>('RESPONDER');
  const [respostaTexto, setRespostaTexto] = useState<string>('');
  const [motivoArquivamento, setMotivoArquivamento] = useState<string>('');
  const [categoriaOS, setCategoriaOS] = useState<string>('GERAL');
  const [prioridadeOS, setPrioridadeOS] = useState<string>('MEDIA');
  const [predioDestinoOS, setPredioDestinoOS] = useState<string>('');
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  async function loadManifestacoes() {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedStatus !== 'TODOS') params.status = selectedStatus;
      if (selectedTipo !== 'TODOS') params.tipo = selectedTipo;
      if (selectedUnit !== 'TODOS') params.predioId = selectedUnit;
      if (searchQuery.trim()) params.busca = searchQuery.trim();

      const res = await apiClient.getManifestacoes(params);
      if (res.success && Array.isArray(res.data)) {
        setManifestacoes(res.data as ManifestacaoItem[]);
        if (res.meta) setMeta(res.meta);
      } else {
        setManifestacoes([]);
      }
    } catch {
      showToast('Erro ao carregar manifestações.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadManifestacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, selectedTipo, selectedUnit]);

  // Handle Search Trigger
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadManifestacoes();
  }

  // Open Action Modal
  function handleOpenModal(item: ManifestacaoItem) {
    setActiveItem(item);
    setModalTab('RESPONDER');
    setRespostaTexto(item.respostaOficial || '');
    setMotivoArquivamento(item.motivoArquivamento || '');
    setCategoriaOS('GERAL');
    setPrioridadeOS('MEDIA');
    setPredioDestinoOS(item.predioId || units[0]?.id || '');
  }

  // Submit Official Response
  async function handleEnviarResposta() {
    if (!activeItem || !respostaTexto.trim()) return;
    setIsSubmittingAction(true);
    try {
      const res = await apiClient.responderManifestacao(activeItem.id, {
        resposta: respostaTexto.trim(),
        acao: 'RESPONDER',
      });
      if (res.success) {
        showToast('Parecer oficial publicado com sucesso!');
        setActiveItem(null);
        loadManifestacoes();
      } else {
        showToast(res.message || 'Erro ao publicar resposta.');
      }
    } catch {
      showToast('Falha na comunicação com o servidor.');
    } finally {
      setIsSubmittingAction(false);
    }
  }

  // Submit Archive Action
  async function handleArquivar() {
    if (!activeItem || !motivoArquivamento.trim()) return;
    setIsSubmittingAction(true);
    try {
      const res = await apiClient.responderManifestacao(activeItem.id, {
        resposta: `Manifestação arquivada pela gestão: ${motivoArquivamento.trim()}`,
        acao: 'ARQUIVAR',
        motivoArquivamento: motivoArquivamento.trim(),
      });
      if (res.success) {
        showToast('Manifestação arquivada com sucesso.');
        setActiveItem(null);
        loadManifestacoes();
      } else {
        showToast(res.message || 'Erro ao arquivar manifestação.');
      }
    } catch {
      showToast('Falha na comunicação com o servidor.');
    } finally {
      setIsSubmittingAction(false);
    }
  }

  // Submit Convert to Technical Work Order
  async function handleConverterOS() {
    if (!activeItem) return;
    setIsSubmittingAction(true);
    try {
      const res = await apiClient.converterManifestacaoOS(activeItem.id, {
        predioId: activeItem.predioId || predioDestinoOS || undefined,
        titulo: `Demanda de Ouvidoria: ${activeItem.categoria} - ${activeItem.predioNome}`,
        categoria: categoriaOS,
        prioridade: prioridadeOS,
      });
      if (res.success) {
        showToast(`Convertida com sucesso! Chamado técnico criado.`);
        setActiveItem(null);
        loadManifestacoes();
      } else {
        showToast(res.message || 'Erro ao converter em chamado técnico.');
      }
    } catch {
      showToast('Falha na comunicação com o servidor.');
    } finally {
      setIsSubmittingAction(false);
    }
  }

  // Helper styles for Badges
  function getTipoBadge(tipo: TipoManifestacao) {
    switch (tipo) {
      case 'RECLAMACAO':
        return { label: 'Reclamação', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' };
      case 'SUGESTAO':
        return { label: 'Sugestão', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20' };
      case 'ELOGIO':
        return { label: 'Elogio', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' };
      default:
        return { label: 'Geral', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20' };
    }
  }

  function getStatusBadge(status: StatusManifestacao) {
    switch (status) {
      case 'RECEBIDA':
        return { label: 'Aguardando Análise', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' };
      case 'EM_ANALISE':
        return { label: 'Em Análise', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' };
      case 'RESPONDIDA':
        return { label: 'Respondida', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' };
      case 'ARQUIVADA':
        return { label: 'Arquivada', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
      case 'CONVERTIDA_EM_OS':
        return { label: 'Convertida em OS', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' };
      default:
        return { label: status, color: 'bg-slate-500/10 text-slate-700 border-slate-500/20' };
    }
  }

  // Filtered in-memory list if searching locally
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return manifestacoes;
    const q = searchQuery.toLowerCase();
    return manifestacoes.filter(
      (m) =>
        m.protocolo.toLowerCase().includes(q) ||
        m.descricao.toLowerCase().includes(q) ||
        (m.manifestanteNome && m.manifestanteNome.toLowerCase().includes(q)) ||
        m.predioNome.toLowerCase().includes(q)
    );
  }, [manifestacoes, searchQuery]);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar currentRoute="/ouvidoria" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader
          titleOverride="Ouvidoria & Manifestações Cidadãs"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectOrder={() => {}}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={loadManifestacoes}
              disabled={isLoading}
              className="gap-1.5 text-xs font-semibold h-8.5 rounded-xl cursor-pointer"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>Atualizar</span>
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Megaphone size={20} />
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Central de Ouvidoria & Manifestações
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                Canal exclusivo para triagem e resposta de queixas administrativas, conduta e sugestões do cidadão. 
                Separa manifestações gerais de ordens de serviço técnico para preservar o MTTR de zeladoria.
              </p>
            </div>

            <Link href="/abrir-chamado" target="_blank" className="shrink-0">
              <Button variant="outline" size="sm" className="gap-2 text-xs font-bold rounded-xl h-9.5 cursor-pointer">
                <span>Portal Público do Cidadão</span>
                <ExternalLink size={13} />
              </Button>
            </Link>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Registrado
              </span>
              <p className="text-2xl sm:text-3xl font-black text-foreground">
                {meta?.totalCount ?? manifestacoes.length}
              </p>
              <span className="text-[11px] text-muted-foreground">Manifestações da população</span>
            </div>

            <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={14} />
                Aguardando Análise
              </span>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                {meta?.pendentesCount ?? manifestacoes.filter((m) => m.status === 'RECEBIDA' || m.status === 'EM_ANALISE').length}
              </p>
              <span className="text-[11px] text-muted-foreground">Necessitam de resposta</span>
            </div>

            <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                Respondidas
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {meta?.respondidasCount ?? manifestacoes.filter((m) => m.status === 'RESPONDIDA').length}
              </p>
              <span className="text-[11px] text-muted-foreground">Com parecer oficial publicado</span>
            </div>

            <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench size={14} />
                Convertidas em OS
              </span>
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                {meta?.convertidasCount ?? manifestacoes.filter((m) => m.status === 'CONVERTIDA_EM_OS').length}
              </p>
              <span className="text-[11px] text-muted-foreground">Reparos físicos encaminhados</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              
              {/* Search input */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar protocolo ou texto..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-xs bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </form>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
                className="px-3 py-2 rounded-xl border border-border text-xs bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="RECEBIDA">Aguardando Análise</option>
                <option value="EM_ANALISE">Em Análise</option>
                <option value="RESPONDIDA">Respondida</option>
                <option value="CONVERTIDA_EM_OS">Convertida em OS</option>
                <option value="ARQUIVADA">Arquivada</option>
              </select>

              {/* Tipo Filter */}
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value as TipoFilter)}
                className="px-3 py-2 rounded-xl border border-border text-xs bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="TODOS">Todos os Tipos</option>
                <option value="RECLAMACAO">Reclamação</option>
                <option value="SUGESTAO">Sugestão</option>
                <option value="ELOGIO">Elogio</option>
                <option value="OUTRO">Outro</option>
              </select>

              {/* Unit Filter */}
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border text-xs bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="TODOS">Todas as Demandas (Prédios & Vias)</option>
                <option value="SEM_PREDIO">🌐 Vias Públicas / Serviços Gerais</option>
                <optgroup label="Prédios Municipais">
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* List of Manifestações */}
          {isLoading ? (
            <div className="bg-card p-12 rounded-2xl border border-border text-center space-y-3">
              <RefreshCw size={24} className="animate-spin text-primary mx-auto" />
              <p className="text-xs font-semibold text-muted-foreground">Carregando manifestações...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="bg-card p-12 rounded-2xl border border-border text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-foreground">Nenhuma manifestação encontrada</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Não há registros com os filtros aplicados no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredList.map((item) => {
                const tipoBadge = getTipoBadge(item.tipo);
                const statusBadge = getStatusBadge(item.status);

                return (
                  <div
                    key={item.id}
                    className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-2xs hover:border-primary/40 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-sm sm:text-base text-foreground tracking-tight">
                          {item.protocolo}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${tipoBadge.color}`}>
                          {tipoBadge.label}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {item.categoria}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Clock size={12} />
                        <span>{new Date(item.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground flex-wrap">
                        {item.predioId ? (
                          <>
                            <Building2 size={14} className="text-primary shrink-0" />
                            <span className="truncate">{item.predioNome}</span>
                            {item.predioEndereco && (
                              <span className="text-[11px] font-normal text-muted-foreground truncate">
                                • {item.predioEndereco}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <MapPin size={14} className="text-amber-500 shrink-0" />
                            <span className="font-bold text-amber-900 dark:text-amber-300">
                              Via Pública / Serviços Urbanos
                            </span>
                            {item.bairro && (
                              <span className="text-[11px] font-semibold text-muted-foreground">
                                • Bairro: {item.bairro}
                              </span>
                            )}
                            {item.localReferencia && (
                              <span className="text-[11px] font-normal text-muted-foreground">
                                • {item.localReferencia}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-muted/40 p-3 rounded-xl border border-border/80">
                        {item.descricao}
                      </p>
                    </div>

                    {/* Official Response block if present */}
                    {item.respostaOficial && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck size={13} />
                            Parecer Oficial da Gestão
                          </span>
                          {item.respondidoEm && (
                            <span className="font-normal text-[10px] opacity-80">
                              {new Date(item.respondidoEm).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                        <p className="text-emerald-950 dark:text-emerald-200">
                          {item.respostaOficial}
                        </p>
                      </div>
                    )}

                    {/* Converted Work Order notice */}
                    {item.ordemServicoCodigo && (
                      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs text-purple-900 dark:text-purple-300">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Wrench size={13} className="text-purple-600" />
                          Chamado Técnico Gerado: <strong className="font-mono">{item.ordemServicoCodigo}</strong>
                        </span>
                        <Link href={`/chamados?busca=${item.ordemServicoCodigo}`}>
                          <span className="text-[11px] font-bold text-purple-700 underline">Ver Chamado</span>
                        </Link>
                      </div>
                    )}

                    {/* Footer Row: Manifestante info & Action button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <User size={13} />
                          {item.anonimo ? 'Manifestação Anônima' : (item.manifestanteNome || 'Cidadão')}
                        </span>
                        {item.manifestanteTelefone && !item.anonimo && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} />
                            {item.manifestanteTelefone}
                          </span>
                        )}
                        {item.manifestanteEmail && !item.anonimo && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {item.manifestanteEmail}
                          </span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleOpenModal(item)}
                        className="bg-primary hover:bg-secondary text-primary-foreground text-xs font-bold rounded-xl h-8.5 px-4 gap-1.5 cursor-pointer shadow-2xs self-end sm:self-auto"
                      >
                        <span>Analisar / Responder</span>
                        <ChevronRight size={13} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>

      {/* MODAL DE TRATATIVA / ANÁLISE DO GESTOR */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-xl rounded-3xl border border-border shadow-xl p-5 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg sm:text-xl text-foreground">
                    {activeItem.protocolo}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTipoBadge(activeItem.tipo).color}`}>
                    {getTipoBadge(activeItem.tipo).label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeItem.predioNome} • {activeItem.categoria}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Manifestation Content */}
            <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-1.5 text-xs">
              <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                Relato do Cidadão
              </span>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {activeItem.descricao}
              </p>
              <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-2">
                <span>Registrado por: <strong>{activeItem.anonimo ? 'Anônimo' : (activeItem.manifestanteNome || 'Cidadão')}</strong></span>
                {activeItem.manifestanteTelefone && <span>• Tel: {activeItem.manifestanteTelefone}</span>}
              </div>
            </div>

            {/* Action Tabs Switcher */}
            <div className="grid grid-cols-3 p-1 rounded-xl bg-muted border border-border text-xs font-bold text-center">
              <button
                type="button"
                onClick={() => setModalTab('RESPONDER')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  modalTab === 'RESPONDER' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
                }`}
              >
                1. Responder
              </button>
              <button
                type="button"
                onClick={() => setModalTab('CONVERTER')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  modalTab === 'CONVERTER' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
                }`}
              >
                2. Converter em OS
              </button>
              <button
                type="button"
                onClick={() => setModalTab('ARQUIVAR')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  modalTab === 'ARQUIVAR' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground'
                }`}
              >
                3. Arquivar
              </button>
            </div>

            {/* TAB 1: EMITIR RESPOSTA OFICIAL */}
            {modalTab === 'RESPONDER' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    Parecer Oficial da Prefeitura / Gestão *
                  </label>
                  <textarea
                    rows={4}
                    value={respostaTexto}
                    onChange={(e) => setRespostaTexto(e.target.value)}
                    placeholder="Escreva a resposta formal que o cidadão visualizará ao consultar o protocolo..."
                    className="w-full p-3.5 rounded-xl border border-border text-xs bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 leading-relaxed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Esta resposta ficará gravada no registro oficial com seu login e data para fins de auditoria municipal.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveItem(null)}
                    className="text-xs rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEnviarResposta}
                    disabled={isSubmittingAction || !respostaTexto.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-4 gap-1.5"
                  >
                    <Send size={13} />
                    <span>Publicar Resposta</span>
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: CONVERTER EM CHAMADO TÉCNICO */}
            {modalTab === 'CONVERTER' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-300">
                  <p className="font-semibold">
                    Esta ação criará uma Ordem de Serviço física real no Kanban de zeladoria e vinculará à manifestação, avisando o cidadão.
                  </p>
                </div>

                {!activeItem.predioId && (
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Unidade Predial / Polo Técnico Responsável *
                    </label>
                    <select
                      value={predioDestinoOS}
                      onChange={(e) => setPredioDestinoOS(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border text-xs bg-background text-foreground cursor-pointer"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} ({u.tipo}) • {u.endereco.split('-')[0]}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Esta manifestação é de via pública/serviços gerais. Selecione qual unidade ou polo municipal executará a ordem técnica.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Especialidade Técnica
                    </label>
                    <select
                      value={categoriaOS}
                      onChange={(e) => setCategoriaOS(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border text-xs bg-background text-foreground cursor-pointer"
                    >
                      <option value="HIDRAULICA">Hidráulica</option>
                      <option value="ELETRICA">Elétrica</option>
                      <option value="ALVENARIA">Alvenaria / Pintura</option>
                      <option value="ACESSIBILIDADE">Acessibilidade</option>
                      <option value="TELHADO">Cobertura / Telhado</option>
                      <option value="GERAL">Zeladoria Geral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Prioridade da OS
                    </label>
                    <select
                      value={prioridadeOS}
                      onChange={(e) => setPrioridadeOS(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border text-xs bg-background text-foreground cursor-pointer"
                    >
                      <option value="BAIXA">Baixa</option>
                      <option value="MEDIA">Média</option>
                      <option value="ALTA">Alta</option>
                      <option value="URGENTE">Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveItem(null)}
                    className="text-xs rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConverterOS}
                    disabled={isSubmittingAction}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl px-4 gap-1.5"
                  >
                    <Wrench size={13} />
                    <span>Gerar Chamado Técnico</span>
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: ARQUIVAR */}
            {modalTab === 'ARQUIVAR' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    Justificativa de Arquivamento *
                  </label>
                  <textarea
                    rows={3}
                    value={motivoArquivamento}
                    onChange={(e) => setMotivoArquivamento(e.target.value)}
                    placeholder="Ex: Demanda fora do escopo de serviços municipais / manifestação duplicada..."
                    className="w-full p-3.5 rounded-xl border border-border text-xs bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveItem(null)}
                    className="text-xs rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleArquivar}
                    disabled={isSubmittingAction || !motivoArquivamento.trim()}
                    className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-4 gap-1.5"
                  >
                    <Archive size={13} />
                    <span>Confirmar Arquivamento</span>
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
