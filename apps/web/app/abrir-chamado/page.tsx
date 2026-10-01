'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  UploadCloud,
  Trash2,
  Share2,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders, type OrdemServico } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';
import { getPriorityBadge, getStatusBadge } from '@/lib/badges';
import { Logo } from '@/components/logo';

type ActiveView = 'novo' | 'consultar';

type SpecialtyType = 'hidraulica' | 'eletrica' | 'alvenaria' | 'acessibilidade' | 'telhado' | 'geral';

const SPECIALTIES: {
  id: SpecialtyType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  { 
    id: 'hidraulica', 
    label: 'Hidráulica', 
    description: 'Vazamentos, torneiras, canos e reservatórios',
    icon: <Droplets size={20} className="text-blue-500" /> 
  },
  { 
    id: 'eletrica', 
    label: 'Elétrica', 
    description: 'Iluminação, tomadas, disjuntores e quadros',
    icon: <Zap size={20} className="text-amber-500" /> 
  },
  { 
    id: 'alvenaria', 
    label: 'Alvenaria / Pintura', 
    description: 'Paredes, reboco, trincas, piso e pintura',
    icon: <Paintbrush size={20} className="text-emerald-500" /> 
  },
  { 
    id: 'acessibilidade', 
    label: 'Acessibilidade & Portas', 
    description: 'Rampas, corrimãos, fechaduras e esquadrias',
    icon: <DoorOpen size={20} className="text-purple-500" /> 
  },
  { 
    id: 'telhado', 
    label: 'Cobertura / Calhas', 
    description: 'Goteiras, telhas danificadas e infiltrações',
    icon: <Layers size={20} className="text-cyan-600" /> 
  },
  { 
    id: 'geral', 
    label: 'Zeladoria Geral', 
    description: 'Mobiliário, vidros, áreas externas e outros',
    icon: <Wrench size={20} className="text-slate-500" /> 
  },
];

export default function AbrirChamadoPage() {
  const { units, orders, addOrder } = useOrders();
  const { user } = useAuth();

  const [activeView, setActiveView] = useState<ActiveView>('novo');

  // Step wizard for New Order: 1 (Location) -> 2 (Occurrence & Photos) -> 3 (Requester) -> 4 (Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedUnit, setSelectedUnit] = useState<string>(units[0]?.nome || 'EMEF Paulo Freire');
  const [setorLocal, setSetorLocal] = useState<string>('');
  const [specialty, setSpecialty] = useState<SpecialtyType>('hidraulica');
  const [titulo, setTitulo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [isUrgente, setIsUrgente] = useState<boolean>(false);
  const [fotos, setFotos] = useState<string[]>([]);
  const [solicitanteNome, setSolicitanteNome] = useState<string>('');
  const [solicitanteCargo, setSolicitanteCargo] = useState<string>('Direção / Gestão Escolar');
  const [solicitanteTelefone, setSolicitanteTelefone] = useState<string>('');
  const [aceitaWhatsapp, setAceitaWhatsapp] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Auto preencher com perfil autenticado caso exista
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

  // Handle Photo Upload (Simulated previews from file)
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFotos((prev) => [...prev, event.target!.result as string].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  function handleRemovePhoto(index: number) {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  }

  // Handle Submit Order
  async function handleSubmit() {
    if (!titulo.trim() || !solicitanteNome.trim()) return;

    setIsSubmitting(true);

    const protocolNumber = `OS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const formattedDate = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: OrdemServico = {
      id: protocolNumber,
      titulo: titulo.trim(),
      predio: selectedUnit,
      categoria: SPECIALTIES.find((s) => s.id === specialty)?.label || 'Geral',
      dataAbertura: formattedDate,
      status: 'TRIAGEM',
      prioridade: isUrgente ? 'ALTA' : 'MEDIA',
      solicitante: `${solicitanteNome.trim()} (${solicitanteCargo})`,
      descricao: `${descricao.trim() ? descricao.trim() + ' | ' : ''}Local específico: ${setorLocal.trim() || 'Geral da unidade'} • Contato: ${solicitanteTelefone.trim() || 'Não informado'}`,
      fotos: fotos.length > 0 ? fotos : undefined,
    };

    try {
      await addOrder(newOrder);
      setGeneratedProtocol(protocolNumber);
      setCurrentStep(4);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Search Protocol
  async function handleSearchProtocol(query?: string) {
    const term = (query !== undefined ? query : searchQuery).trim().toUpperCase();
    if (!term) return;

    try {
      const res = await apiClient.getWorkOrder(term);
      if (res.success && res.order) {
        setSearchedOrder(res.order);
        setSearchNotFound(false);
      } else {
        setSearchedOrder(null);
        setSearchNotFound(true);
      }
    } catch {
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
    setIsUrgente(false);
    setFotos([]);
    setGeneratedProtocol(null);
  }

  // Unit detail info helper
  const currentUnitInfo = units.find((u) => u.nome === selectedUnit);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground font-sans">
      
      {/* 1. TOP HEADER INSTITUCIONAL */}
      <header className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 sm:h-18 flex items-center justify-between gap-3">
          <Logo href="/" size="md" textStyle="tecnologia" subtitle="Portal do Solicitante" />

          {/* View Switcher: Novo Chamado vs Consultar Protocolo */}
          <div className="flex items-center p-1 rounded-xl bg-muted border border-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveView('novo')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'novo' 
                  ? 'bg-card text-foreground shadow-xs font-bold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Novo Chamado
            </button>
            <button
              type="button"
              onClick={() => setActiveView('consultar')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'consultar' 
                  ? 'bg-card text-foreground shadow-xs font-bold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Consultar Protocolo
            </button>
          </div>

          <Link href="/" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5 h-9">
              <span>Painel Gestor</span>
              <ExternalLink size={13} />
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. BODY CONTENT */}
      <main className="flex-1 max-w-2xl sm:max-w-3xl w-full mx-auto px-4 py-6 sm:py-10">

        {/* VIEW 1: ABRIR NOVO CHAMADO */}
        {activeView === 'novo' && (
          <div className="space-y-6">

            {/* Stepper Header (Only when not finished) */}
            {currentStep < 4 && (
              <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                      {currentStep}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {currentStep === 1 && 'Etapa 1 de 3: Localização do Prédio'}
                      {currentStep === 2 && 'Etapa 2 de 3: Detalhes da Ocorrência'}
                      {currentStep === 3 && 'Etapa 3 de 3: Identificação do Solicitante'}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {Math.round((currentStep / 3) * 100)}% concluído
                  </span>
                </div>

                {/* Progress bar track */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>

                {/* Desktop Stepper Labels */}
                <div className="hidden sm:grid grid-cols-3 text-xs pt-1">
                  <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-primary/10 text-primary'}`}>
                      {currentStep > 1 ? <Check size={10} /> : '1'}
                    </span>
                    <span>1. Unidade & Setor</span>
                  </div>

                  <div className={`flex items-center gap-1.5 justify-center ${currentStep >= 2 ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${currentStep > 2 ? 'bg-emerald-600 text-white' : currentStep === 2 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {currentStep > 2 ? <Check size={10} /> : '2'}
                    </span>
                    <span>2. Ocorrência & Fotos</span>
                  </div>

                  <div className={`flex items-center gap-1.5 justify-end ${currentStep === 3 ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${currentStep === 3 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      3
                    </span>
                    <span>3. Solicitante</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: LOCALIZAÇÃO */}
            {currentStep === 1 && (
              <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Building2 size={18} />
                    </span>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                      Onde ocorreu o problema?
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Selecione o prédio público municipal e a sala ou setor específico para despacho da equipe técnica.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-primary" />
                        Prédio / Unidade Municipal *
                      </span>
                      <span className="text-[11px] font-normal text-muted-foreground">
                        {units.length} unidades cadastradas
                      </span>
                    </label>

                    <div className="relative">
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border text-sm font-semibold text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer appearance-none pr-10"
                      >
                        {units.map((u) => (
                          <option key={u.id} value={u.nome}>
                            {u.nome} ({u.tipo}) • {u.endereco.split('-')[0]}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>

                    {currentUnitInfo && (
                      <div className="mt-2.5 p-3 rounded-xl bg-muted/60 border border-border/80 flex items-start gap-2.5 text-xs text-muted-foreground">
                        <Building2 size={15} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">{currentUnitInfo.nome} <span className="font-normal text-muted-foreground">({currentUnitInfo.tipo})</span></p>
                          <p className="text-[11px] text-muted-foreground">{currentUnitInfo.endereco}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Local específico dentro da unidade (Opcional)
                    </label>
                    <input
                      type="text"
                      value={setorLocal}
                      onChange={(e) => setSetorLocal(e.target.value)}
                      placeholder="Ex: Bloco B, Banheiro Feminino, Sala 04, Cozinha / Refeitório"
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-card placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Indicar a sala ou pavimento agiliza o tempo de atendimento em até 40%.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    className="w-full sm:w-auto bg-primary hover:bg-secondary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl px-7 h-12 gap-2 shadow-xs cursor-pointer"
                  >
                    Avançar para Detalhes
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: OCORRÊNCIA E FOTOS */}
            {currentStep === 2 && (
              <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Wrench size={18} />
                    </span>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                      Qual é a necessidade de reparo?
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Selecione a categoria técnica, descreva o ocorrido e anexe fotos do local se estiver no celular.
                  </p>
                </div>

                {/* Categories Grid */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground">
                    Categoria Técnica da Manutenção *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SPECIALTIES.map((item) => {
                      const isSelected = specialty === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSpecialty(item.id)}
                          className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary/5 border-primary ring-1 ring-primary/20 shadow-xs'
                              : 'bg-card border-border hover:border-slate-300 text-foreground'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">{item.icon}</div>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {item.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Título Resumido da Ocorrência *
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ex: Vazamento sob a pia do refeitório ou Lâmpada piscando na sala 03"
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm font-semibold text-foreground bg-card placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Descrição Detalhada dos Sintomas
                    </label>
                    <textarea
                      rows={3}
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Descreva quando começou, se houve risco de choque ou alagamento, e detalhes que auxiliem o técnico a trazer as peças corretas..."
                      className="w-full px-4 py-3 rounded-xl border border-border text-xs sm:text-sm text-foreground bg-card placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Photo / Camera Evidence Upload */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Camera size={14} className="text-primary" />
                        Evidência Fotográfica do Problema (Opcional)
                      </span>
                      <span className="text-[11px] font-normal text-muted-foreground">
                        Até 4 fotos
                      </span>
                    </label>

                    <div className="p-4 rounded-xl bg-muted/40 border border-dashed border-border space-y-3">
                      {/* Photo Previews */}
                      {fotos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {fotos.map((imgSrc, idx) => (
                            <div key={idx} className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden border border-border bg-slate-100 group shadow-xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={imgSrc} alt={`Evidência ${idx + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-rose-600 text-white shadow-xs hover:bg-rose-700 transition-colors"
                                title="Remover foto"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {fotos.length < 4 && (
                        <div className="flex flex-col sm:flex-row items-center gap-2.5">
                          {/* Botão de Câmera (Mobile nativo) */}
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-card border border-border hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                          >
                            <Camera size={15} className="text-primary" />
                            <span>Tirar Foto com a Câmera</span>
                          </button>

                          {/* Botão de Galeria / Arquivo */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-card border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <UploadCloud size={15} />
                            <span>Carregar da Galeria / Arquivo</span>
                          </button>

                          <p className="text-[11px] text-muted-foreground text-center sm:text-left sm:ml-auto">
                            Recomendado para avaliação prévia
                          </p>
                        </div>
                      )}

                      {/* Hidden file inputs */}
                      <input 
                        ref={cameraInputRef} 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={handlePhotoUpload} 
                      />
                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={handlePhotoUpload} 
                      />
                    </div>
                  </div>

                  {/* Urgency Toggle */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border cursor-pointer select-none hover:bg-muted/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={isUrgente}
                      onChange={(e) => setIsUrgente(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <AlertTriangle size={13} className={isUrgente ? 'text-rose-600' : 'text-amber-500'} />
                        Esta ocorrência traz risco imediato à segurança ou funcionamento da unidade
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Marque apenas em situações de risco de choque, alagamento ativo ou interrupção de aulas/atendimentos.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl px-4 h-12 gap-2 cursor-pointer"
                  >
                    <ArrowLeft size={16} />
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
                    className="bg-primary hover:bg-secondary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl px-7 h-12 gap-2 shadow-xs cursor-pointer"
                  >
                    Identificar Solicitante
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: SOLICITANTE */}
            {currentStep === 3 && (
              <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary">
                      <User size={18} />
                    </span>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                      Quem está registrando o chamado?
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Necessário para envio de atualizações e confirmação com a equipe técnica na chegada à unidade.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                      <User size={14} className="text-primary" />
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={solicitanteNome}
                      onChange={(e) => setSolicitanteNome(e.target.value)}
                      placeholder="Ex: Profª Maria Clara da Silva"
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm font-semibold text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Função / Cargo na Unidade
                    </label>
                    <select
                      value={solicitanteCargo}
                      onChange={(e) => setSolicitanteCargo(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm font-medium text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="Direção / Gestão Escolar">Direção / Gestão Escolar</option>
                      <option value="Coordenação Pedagógica">Coordenação Pedagógica</option>
                      <option value="Professor(a) / Educador(a)">Professor(a) / Educador(a)</option>
                      <option value="Enfermeiro(a) / Coord. UBS">Enfermeiro(a) / Coord. UBS</option>
                      <option value="Servidor(a) Administrativo">Servidor(a) Administrativo</option>
                      <option value="Zeladoria / Apoio Operacional">Zeladoria / Apoio Operacional</option>
                      <option value="Cidadão / Usuário da Unidade">Cidadão / Usuário da Unidade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Phone size={14} className="text-primary" />
                      Telefone para Contato / WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={solicitanteTelefone}
                      onChange={(e) => setSolicitanteTelefone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm font-medium text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={aceitaWhatsapp}
                      onChange={(e) => setAceitaWhatsapp(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs font-medium text-foreground">
                      Aceito receber notificações automáticas sobre o andamento e conclusão desta ordem de serviço.
                    </span>
                  </label>

                  {/* Summary Preview Box */}
                  <div className="p-4 rounded-xl bg-muted/60 border border-border/80 space-y-2 text-xs">
                    <span className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
                      Resumo do Chamado a Ser Aberto
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-foreground">
                      <div><strong className="text-muted-foreground">Prédio:</strong> {selectedUnit}</div>
                      <div><strong className="text-muted-foreground">Especialidade:</strong> {SPECIALTIES.find((s) => s.id === specialty)?.label}</div>
                      <div className="sm:col-span-2"><strong className="text-muted-foreground">Título:</strong> {titulo}</div>
                      {fotos.length > 0 && (
                        <div className="sm:col-span-2 text-primary font-semibold">
                          ✓ {fotos.length} foto(s) anexada(s)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl px-4 h-12 gap-2 cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    Voltar
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !solicitanteNome.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl px-7 h-12 gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Send size={15} />
                    <span>{isSubmitting ? 'Registrando Chamado...' : 'Confirmar e Emitir Protocolo'}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: SUCESSO & PROTOCOLO */}
            {currentStep === 4 && generatedProtocol && (
              <div className="bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-sm text-center space-y-6 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={36} />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                    <ShieldCheck size={14} />
                    Ordem de Serviço Emitida com Sucesso
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Chamado Enviado para a Central
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    A equipe de engenharia e zeladoria municipal já recebeu a solicitação e iniciou a triagem operacional.
                  </p>
                </div>

                {/* Protocol Card */}
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-muted/60 border border-border space-y-3">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Número de Protocolo Oficial
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-black text-primary tracking-tight font-mono">
                      {generatedProtocol}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(generatedProtocol);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted shadow-xs transition-all cursor-pointer"
                      title="Copiar Protocolo"
                    >
                      {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedUnit} • Sujeito à triagem de urgência
                  </p>
                </div>

                {/* Flow Timeline */}
                <div className="max-w-md mx-auto text-left p-4 rounded-xl bg-muted/30 border border-border/80 space-y-3">
                  <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">Linha do Tempo Operacional</span>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2.5 text-emerald-600 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>1. Chamado registrado no sistema (Agora)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-primary font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0" />
                      <span>2. Em triagem pela central de zeladoria</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 shrink-0" />
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
                    className="w-full sm:w-auto bg-primary hover:bg-secondary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl h-12 px-6 gap-2 cursor-pointer shadow-xs"
                  >
                    <Search size={15} />
                    Acompanhar Status
                  </Button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Olá, abri o chamado ${generatedProtocol} para a unidade ${selectedUnit}: ${titulo}. Link para acompanhamento: ${typeof window !== 'undefined' ? window.location.origin : ''}/abrir-chamado`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 h-12 rounded-xl bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20 font-bold text-xs sm:text-sm border border-emerald-600/20 transition-all"
                  >
                    <Share2 size={15} />
                    Compartilhar no WhatsApp
                  </a>

                  <Button
                    variant="outline"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto border-border text-foreground hover:bg-muted font-bold text-xs sm:text-sm rounded-xl h-12 px-6 cursor-pointer"
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
            <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Search size={18} />
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                    Consultar Andamento de Chamado
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Digite o código de protocolo oficial fornecido na abertura para verificar o status e o responsável técnico.
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchProtocol()}
                    placeholder="Ex: OS-104921 ou digite o número"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border text-sm font-mono font-semibold text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <Button
                  onClick={() => handleSearchProtocol()}
                  className="bg-primary hover:bg-secondary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl h-11 px-6 gap-2 shrink-0 cursor-pointer shadow-xs"
                >
                  Consultar
                </Button>
              </div>

              {/* Quick suggestions */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <span className="text-muted-foreground font-semibold">Exemplos rápidos:</span>
                {orders.slice(0, 3).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(o.id);
                      handleSearchProtocol(o.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-mono text-[11px] font-bold border border-border transition-colors cursor-pointer"
                  >
                    {o.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Result Card */}
            {searchedOrder && (
              <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs space-y-6 animate-in slide-in-from-top-4 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-2xl font-black text-foreground font-mono">{searchedOrder.id}</span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadge(searchedOrder.status).style}`}>
                        {getStatusBadge(searchedOrder.status).label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Building2 size={13} className="text-primary" />
                      {searchedOrder.predio} • Aberto em {searchedOrder.dataAbertura}
                    </p>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-xl self-start sm:self-auto border ${getPriorityBadge(searchedOrder.prioridade)}`}>
                    Prioridade: {searchedOrder.prioridade}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-foreground">{searchedOrder.titulo}</h3>
                  {searchedOrder.descricao && (
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed bg-muted/40 p-4 rounded-xl border border-border/80">
                      {searchedOrder.descricao}
                    </p>
                  )}
                </div>

                {/* Status Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Solicitante</span>
                    <p className="text-xs font-bold text-foreground mt-0.5">{searchedOrder.solicitante}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Técnico Atribuído</span>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {searchedOrder.tecnico || 'Aguardando despacho da central'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Previsão / SLA</span>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">
                      {searchedOrder.status === 'CONCLUIDO' ? 'Atendimento Finalizado' : 'Dentro do Prazo'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Not Found state */}
            {searchNotFound && (
              <div className="bg-card rounded-2xl border border-border p-8 text-center space-y-3 shadow-xs">
                <AlertTriangle size={32} className="text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-foreground">Protocolo não localizado</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Não encontramos nenhuma ordem com o protocolo informado. Verifique se os números foram digitados corretamente.
                </p>
              </div>
            )}

          </div>
        )}

      </main>

      {/* 3. FOOTER INSTITUCIONAL */}
      <footer className="py-6 border-t border-border bg-card text-center text-xs text-muted-foreground mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Urboa Tecnologia • Sistema Integrado de Gestão Predial Urbana</p>
          <p className="text-[11px] text-muted-foreground/80">Canal Oficial de Atendimento e Zeladoria Municipal</p>
        </div>
      </footer>

    </div>
  );
}
