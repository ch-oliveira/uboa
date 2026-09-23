'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Search, 
  Phone, 
  User, 
  Droplets, 
  Zap, 
  Paintbrush, 
  DoorOpen, 
  Wrench, 
  Check, 
  ChevronRight,
  Send,
  ExternalLink,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders, type OrdemServico } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { getPriorityBadge, getStatusBadge } from '@/lib/badges';

type ActiveView = 'novo' | 'consultar';

type SpecialtyType = 'hidraulica' | 'eletrica' | 'alvenaria' | 'acessibilidade' | 'geral';

export default function AbrirChamadoPage() {
  const { units, orders, addOrder } = useOrders();
  const { user } = useAuth();

  const [activeView, setActiveView] = useState<ActiveView>('novo');

  // Step wizard for New Order: 1 (Location) -> 2 (Problem) -> 3 (Requester) -> 4 (Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedUnit, setSelectedUnit] = useState<string>(units[0]?.nome || 'EMEF Paulo Freire');
  const [setorLocal, setSetorLocal] = useState<string>('');
  const [specialty, setSpecialty] = useState<SpecialtyType>('hidraulica');
  const [isUrgente, setIsUrgente] = useState<boolean>(false);
  const [titulo, setTitulo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [hasPhoto, setHasPhoto] = useState<boolean>(false);
  const [solicitanteNome, setSolicitanteNome] = useState<string>('');
  const [solicitanteCargo, setSolicitanteCargo] = useState<string>('Direção / Gestão Escolar');
  const [solicitanteTelefone, setSolicitanteTelefone] = useState<string>('');
  const [aceitaWhatsapp, setAceitaWhatsapp] = useState<boolean>(true);

  // Auto preencher com perfil autenticado
  useEffect(() => {
    if (user) {
      if (user.predio) setSelectedUnit(user.predio);
      if (user.nome) setSolicitanteNome(user.nome);
      if (user.cargo) setSolicitanteCargo(user.cargo);
      if (user.telefone) setSolicitanteTelefone(user.telefone);
    }
  }, [user]);

  // Success State
  const [generatedProtocol, setGeneratedProtocol] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Search Protocol State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchedOrder, setSearchedOrder] = useState<OrdemServico | null>(null);
  const [searchNotFound, setSearchNotFound] = useState<boolean>(false);

  // Handle Submit Order
  function handleSubmit() {
    if (!titulo.trim() || !solicitanteNome.trim()) return;

    const protocolNumber = `OS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const formattedDate = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: OrdemServico = {
      id: protocolNumber,
      titulo: titulo.trim(),
      predio: selectedUnit,
      dataAbertura: formattedDate,
      status: 'TRIAGEM',
      prioridade: isUrgente ? 'URGENTE' : 'MEDIA',
      solicitante: `${solicitanteNome.trim()} (${solicitanteCargo})`,
      descricao: `${descricao.trim() ? descricao.trim() + ' | ' : ''}Local específico: ${setorLocal.trim() || 'Geral da unidade'} • Contato: ${solicitanteTelefone.trim() || 'Não informado'}`,
    };

    addOrder(newOrder);
    setGeneratedProtocol(protocolNumber);
    setCurrentStep(4);
  }

  // Handle Search Protocol
  function handleSearchProtocol(query?: string) {
    const term = (query !== undefined ? query : searchQuery).trim().toUpperCase();
    if (!term) return;

    const found = orders.find(
      (o) => o.id.toUpperCase() === term || o.id.toUpperCase() === `OS-${term}`
    );

    if (found) {
      setSearchedOrder(found);
      setSearchNotFound(false);
    } else {
      setSearchedOrder(null);
      setSearchNotFound(true);
    }
  }

  // Reset form to start a new ticket
  function handleResetForm() {
    setCurrentStep(1);
    setTitulo('');
    setDescricao('');
    setSetorLocal('');
    setHasPhoto(false);
    setGeneratedProtocol(null);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      
      {/* 1. TOP HEADER */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-18 flex items-center justify-between gap-4">
          <Link href="/landing" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-[#1e293b] rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <div className="w-4 h-4 bg-white rounded-xs transform rotate-45" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight leading-none block">zelo.</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Portal do Solicitante</span>
            </div>
          </Link>

          {/* View Switcher: Novo Chamado vs Consultar Protocolo */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveView('novo')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'novo' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Novo Chamado
            </button>
            <button
              type="button"
              onClick={() => setActiveView('consultar')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'consultar' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Consultar Protocolo
            </button>
          </div>

          <Link href="/" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-slate-600 hover:text-slate-900 gap-1.5">
              <span>Painel Gestor</span>
              <ExternalLink size={13} />
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. BODY CONTENT */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">

        {/* VIEW 1: ABRIR NOVO CHAMADO */}
        {activeView === 'novo' && (
          <div className="space-y-6">

            {/* Stepper Header (Only when not finished) */}
            {currentStep < 4 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className={currentStep === 1 ? 'text-[#1D6FEB]' : 'text-slate-400'}>1. Localização</span>
                  <ChevronRight size={14} className="text-slate-300" />
                  <span className={currentStep === 2 ? 'text-[#1D6FEB]' : 'text-slate-400'}>2. Ocorrência</span>
                  <ChevronRight size={14} className="text-slate-300" />
                  <span className={currentStep === 3 ? 'text-[#1D6FEB]' : 'text-slate-400'}>3. Solicitante</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1D6FEB] rounded-full transition-all duration-300" 
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* STEP 1: LOCALIZAÇÃO */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h1 className="text-xl font-extrabold text-slate-900">Onde ocorreu o problema?</h1>
                  <p className="text-xs text-slate-500">Selecione o prédio público municipal e a sala ou setor específico.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Building2 size={14} className="text-[#1D6FEB]" />
                      Prédio / Unidade Municipal
                    </label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.nome}>
                          {u.nome} ({u.tipo}) • {u.endereco.split('-')[0]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Local específico dentro da unidade (Opcional)
                    </label>
                    <input
                      type="text"
                      value={setorLocal}
                      onChange={(e) => setSetorLocal(e.target.value)}
                      placeholder="Ex: Refeitório, Banheiro Bloco B, Sala 04, Recepção"
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Ajuda a equipe técnica a encontrar o local exato com rapidez.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white font-bold text-xs rounded-xl px-6 h-11 gap-2"
                  >
                    Avançar para Detalhes
                    <ArrowRight size={15} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: OCORRÊNCIA */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h1 className="text-xl font-extrabold text-slate-900">Qual é a necessidade de reparo?</h1>
                  <p className="text-xs text-slate-500">Selecione a categoria técnica e relate o que está acontecendo.</p>
                </div>

                {/* Specialties chips */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Categoria Técnica</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSpecialty('hidraulica')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        specialty === 'hidraulica' 
                          ? 'bg-blue-50 border-[#1D6FEB] text-[#1D6FEB] font-bold shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Droplets size={18} className="text-[#1D6FEB]" />
                      <span className="text-xs">Hidráulica</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSpecialty('eletrica')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        specialty === 'eletrica' 
                          ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Zap size={18} className="text-amber-500" />
                      <span className="text-xs">Elétrica</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSpecialty('alvenaria')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        specialty === 'alvenaria' 
                          ? 'bg-slate-100 border-slate-500 text-slate-800 font-bold shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Paintbrush size={18} className="text-slate-600" />
                      <span className="text-xs">Alvenaria / Pintura</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSpecialty('acessibilidade')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        specialty === 'acessibilidade' 
                          ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <DoorOpen size={18} className="text-purple-600" />
                      <span className="text-xs">Acessibilidade</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSpecialty('geral')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        specialty === 'geral' 
                          ? 'bg-slate-100 border-slate-500 text-slate-800 font-bold shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Wrench size={18} className="text-slate-600" />
                      <span className="text-xs">Geral / Telhado</span>
                    </button>
                  </div>
                </div>

                {/* Priority Urgente Toggle */}
                <div 
                  onClick={() => setIsUrgente(!isUrgente)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                    isUrgente 
                      ? 'bg-rose-50 border-rose-300 text-rose-950' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/60'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                    isUrgente ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isUrgente && <Check size={13} strokeWidth={3} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight flex items-center gap-2">
                      Marcar como Urgência Crítica
                      {isUrgente && <span className="text-[10px] bg-rose-600 text-white font-extrabold px-1.5 py-0.2 rounded-full">SLA 4 Horas</span>}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Selecione apenas se houver risco de acidente, interrupção de aulas/consultas médicas ou vazamento grave incontrolável.
                    </p>
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Título Resumido da Ocorrência *
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ex: Vazamento contínuo sob a cuba da pia do refeitório"
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Descrição Detalhada dos Sintomas
                    </label>
                    <textarea
                      rows={3}
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Descreva quando começou, se a água precisou ser fechada ou qualquer detalhe relevante para o técnico..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>

                  {/* Photo attachment simulation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Foto do Local / Evidência (Opcional)
                    </label>
                    <div 
                      onClick={() => setHasPhoto(!hasPhoto)}
                      className={`p-4 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${
                        hasPhoto 
                          ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-500 bg-slate-50/50'
                      }`}
                    >
                      {hasPhoto ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                          <CheckCircle2 size={16} /> Foto anexada com sucesso: foto_ocorrencia.jpg (Clique para remover)
                        </div>
                      ) : (
                        <>
                          <Camera size={20} className="text-slate-400" />
                          <span className="text-xs font-semibold">Clique para simular anexo de foto</span>
                          <span className="text-[10px] text-slate-400">JPG, PNG até 10MB</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-slate-600 rounded-xl px-4 h-11 gap-2"
                  >
                    <ArrowLeft size={15} />
                    Voltar
                  </Button>

                  <Button
                    onClick={() => {
                      if (!titulo.trim()) {
                        alert('Por favor, informe o título resumido da ocorrência.');
                        return;
                      }
                      setCurrentStep(3);
                    }}
                    className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white font-bold text-xs rounded-xl px-6 h-11 gap-2"
                  >
                    Identificar Solicitante
                    <ArrowRight size={15} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: SOLICITANTE */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h1 className="text-xl font-extrabold text-slate-900">Quem está registrando o chamado?</h1>
                  <p className="text-xs text-slate-500">Para envio de atualizações e confirmação com a equipe técnica.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <User size={14} className="text-[#1D6FEB]" />
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={solicitanteNome}
                      onChange={(e) => setSolicitanteNome(e.target.value)}
                      placeholder="Ex: Profª Maria Clara da Silva"
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Função / Cargo na Unidade
                    </label>
                    <select
                      value={solicitanteCargo}
                      onChange={(e) => setSolicitanteCargo(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Direção / Gestão Escolar">Direção / Gestão Escolar</option>
                      <option value="Coordenação Pedagógica">Coordenação Pedagógica</option>
                      <option value="Professor(a) / Educador(a)">Professor(a) / Educador(a)</option>
                      <option value="Enfermeiro(a) / Coord. UBS">Enfermeiro(a) / Coord. UBS</option>
                      <option value="Servidor(a) Administrativo">Servidor(a) Administrativo</option>
                      <option value="Zeladoria / Apoio Operacional">Zeladoria / Apoio Operacional</option>
                      <option value="Cidadão / Usuário">Cidadão / Usuário</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Phone size={14} className="text-[#1D6FEB]" />
                      Telefone para Contato / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={solicitanteTelefone}
                      onChange={(e) => setSolicitanteTelefone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={aceitaWhatsapp}
                      onChange={(e) => setAceitaWhatsapp(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1D6FEB] focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Aceito receber notificações automáticas sobre o andamento e conclusão desta ordem.
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-bold text-slate-600 rounded-xl px-4 h-11 gap-2"
                  >
                    <ArrowLeft size={15} />
                    Voltar
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-7 h-11 gap-2 shadow-md shadow-emerald-600/20"
                  >
                    <Send size={15} />
                    Confirmar e Emitir Protocolo
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: SUCESSO & PROTOCOLO */}
            {currentStep === 4 && generatedProtocol && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={36} />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ordem de Serviço Emitida com Sucesso
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Chamado Enviado para a Central
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    A equipe de engenharia e zeladoria municipal já recebeu a solicitação e iniciou a triagem operacional.
                  </p>
                </div>

                {/* Protocol Card */}
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Número de Protocolo Oficial
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-black text-[#1D6FEB] tracking-tight font-mono">
                      {generatedProtocol}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(generatedProtocol);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs"
                      title="Copiar Protocolo"
                    >
                      {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {selectedUnit} • {isUrgente ? 'Prioridade Urgente' : 'Prioridade Regular'}
                  </p>
                </div>

                {/* Flow Timeline */}
                <div className="max-w-md mx-auto text-left p-4 rounded-xl bg-slate-50/50 border border-slate-100 space-y-3">
                  <span className="text-[11px] font-bold text-slate-600 uppercase">Linha do Tempo</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>1. Chamado registrado no sistema (Agora)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-blue-600 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                      <span>2. Em triagem pela central de zeladoria</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span>3. Despacho técnico no local</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button
                    onClick={() => {
                      setSearchQuery(generatedProtocol);
                      setActiveView('consultar');
                      handleSearchProtocol(generatedProtocol);
                    }}
                    className="w-full sm:w-auto bg-[#1D6FEB] hover:bg-[#1557BA] text-white font-bold text-xs rounded-xl h-11 px-6 gap-2"
                  >
                    <Search size={15} />
                    Acompanhar Status
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto border-slate-300 text-slate-700 font-bold text-xs rounded-xl h-11 px-6"
                  >
                    Abrir Outro Chamado
                  </Button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: CONSULTAR PROTOCOLO */}
        {activeView === 'consultar' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
              <div className="space-y-1">
                <h1 className="text-xl font-extrabold text-slate-900">Consultar Andamento de Chamado</h1>
                <p className="text-xs text-slate-500">Digite o código de protocolo fornecido na abertura para verificar o status.</p>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchProtocol()}
                    placeholder="Ex: OS-104921 ou digite o número"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <Button
                  onClick={() => handleSearchProtocol()}
                  className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white font-bold text-xs rounded-xl h-11 px-6 gap-2 shrink-0"
                >
                  Consultar
                </Button>
              </div>

              {/* Quick suggestions */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <span className="text-slate-400 font-semibold">Exemplos rápidos:</span>
                {orders.slice(0, 3).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(o.id);
                      handleSearchProtocol(o.id);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-bold"
                  >
                    {o.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Result Card */}
            {searchedOrder && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-md space-y-6 animate-in slide-in-from-top-4 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900 font-mono">{searchedOrder.id}</span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadge(searchedOrder.status).style}`}>
                        {getStatusBadge(searchedOrder.status).label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{searchedOrder.predio} • Aberto {searchedOrder.dataAbertura}</p>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-xl self-start sm:self-auto border ${getPriorityBadge(searchedOrder.prioridade)}`}>
                    Prioridade: {searchedOrder.prioridade}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{searchedOrder.titulo}</h3>
                  {searchedOrder.descricao && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      {searchedOrder.descricao}
                    </p>
                  )}
                </div>

                {/* Status Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Solicitante</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{searchedOrder.solicitante}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Técnico Atribuído</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {searchedOrder.tecnico || 'Aguardando despacho da central'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">SLA Previsto</span>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      {searchedOrder.status === 'CONCLUIDO' ? 'Atendimento Finalizado' : 'Dentro do Prazo'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Not Found state */}
            {searchNotFound && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                <AlertTriangle size={32} className="text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Protocolo não localizado</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Não encontramos nenhuma ordem com o protocolo informado. Verifique se os números foram digitados corretamente.
                </p>
              </div>
            )}

          </div>
        )}

      </main>

      {/* 3. FOOTER */}
      <footer className="py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <p>Prefeitura Municipal de Gestão Urbana • zelo. Portal de Atendimento Direto</p>
      </footer>

    </div>
  );
}
