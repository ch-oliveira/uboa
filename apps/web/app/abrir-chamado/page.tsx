'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  ChevronDown,
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
  Layers,
  Eye,
  QrCode,
  Loader2,
  Megaphone,
  Mail,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders, type OrdemServico } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';
import { getPriorityBadge, getStatusBadge } from '@/lib/badges';
import { Logo } from '@/components/logo';
import { ImageLightboxModal } from '@/components/ui/image-lightbox';
import { compressImage } from '@/lib/image-utils';

type ActiveView = 'novo' | 'consultar';
type SpecialtyType = 'hidraulica' | 'eletrica' | 'alvenaria' | 'acessibilidade' | 'telhado' | 'geral';

export const OUVIDORIA_CATEGORIES = [
  { id: 'SERVICOS_URBANOS', label: 'Serviços Urbanos & Vias', desc: 'Buracos na rua, pavimentação, bueiros, mato alto ou calçadas' },
  { id: 'ILUMINACAO', label: 'Iluminação Pública', desc: 'Postes apagados, lâmpadas queimadas ou escuridão em vias' },
  { id: 'LIMPEZA_URBANA', label: 'Coleta de Lixo & Entulho', desc: 'Atraso na coleta, lixo acumulado ou descarte irregular' },
  { id: 'TRANSITO', label: 'Trânsito & Mobilidade', desc: 'Semáforos com defeito, sinalização viária ou transporte público' },
  { id: 'ATENDIMENTO', label: 'Atendimento & Servidores', desc: 'Demora, falta de orientação ou conduta em balcões municipais' },
  { id: 'SAUDE', label: 'Saúde Pública & Vigilância', desc: 'Atendimento no SUS, falta de insumos, combate à dengue e vetores' },
  { id: 'EDUCACAO', label: 'Educação & Escolas', desc: 'Merenda escolar, transporte de alunos ou gestão de vagas' },
  { id: 'RUIDO', label: 'Perturbação de Sossego', desc: 'Som excessivo, ruídos comerciais e posturas municipais' },
  { id: 'MEIO_AMBIENTE', label: 'Meio Ambiente & Praças', desc: 'Poda de árvores, arborização e conservação de praças' },
  { id: 'OUTRO', label: 'Outro Assunto / Gestão Geral', desc: 'Sugestões institucionais, transparência ou outros temas' },
];

const SPECIALTIES: {
  id: SpecialtyType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  { 
    id: 'hidraulica', 
    label: 'Hidráulica', 
    description: 'Vazamentos, torneiras, canos e caixas d’água',
    icon: <Droplets size={20} className="text-blue-500 shrink-0" /> 
  },
  { 
    id: 'eletrica', 
    label: 'Elétrica', 
    description: 'Iluminação, tomadas, disjuntores e quadros de força',
    icon: <Zap size={20} className="text-amber-500 shrink-0" /> 
  },
  { 
    id: 'alvenaria', 
    label: 'Alvenaria / Pintura', 
    description: 'Paredes, reboco, trincas, pisos e revestimento',
    icon: <Paintbrush size={20} className="text-emerald-500 shrink-0" /> 
  },
  { 
    id: 'acessibilidade', 
    label: 'Acessibilidade & Portas', 
    description: 'Rampas, corrimãos, fechaduras e esquadrias',
    icon: <DoorOpen size={20} className="text-purple-500 shrink-0" /> 
  },
  { 
    id: 'telhado', 
    label: 'Cobertura / Calhas', 
    description: 'Goteiras, telhas danificadas e infiltrações',
    icon: <Layers size={20} className="text-cyan-600 shrink-0" /> 
  },
  { 
    id: 'geral', 
    label: 'Zeladoria Geral', 
    description: 'Mobiliário, vidros, áreas externas e outros reparos',
    icon: <Wrench size={20} className="text-slate-500 shrink-0" /> 
  },
];

function AbrirChamadoForm() {
  const searchParams = useSearchParams();
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
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Tipo de Demanda: Manutenção Física vs Reclamação/Ouvidoria
  const [demandaTipo, setDemandaTipo] = useState<'MANUTENCAO' | 'OUVIDORIA'>('MANUTENCAO');

  // Ouvidoria Form State
  const [ouvidoriaEscopo, setOuvidoriaEscopo] = useState<'CIDADE' | 'PREDIO'>('CIDADE');
  const [ouvidoriaBairro, setOuvidoriaBairro] = useState<string>('');
  const [ouvidoriaLocalReferencia, setOuvidoriaLocalReferencia] = useState<string>('');
  const [ouvidoriaTipo, setOuvidoriaTipo] = useState<'RECLAMACAO' | 'SUGESTAO' | 'ELOGIO'>('RECLAMACAO');
  const [ouvidoriaCategoria, setOuvidoriaCategoria] = useState<string>('SERVICOS_URBANOS');
  const [ouvidoriaDescricao, setOuvidoriaDescricao] = useState<string>('');
  const [ouvidoriaAnonimo, setOuvidoriaAnonimo] = useState<boolean>(false);
  const [ouvidoriaNome, setOuvidoriaNome] = useState<string>('');
  const [ouvidoriaTelefone, setOuvidoriaTelefone] = useState<string>('');
  const [ouvidoriaEmail, setOuvidoriaEmail] = useState<string>('');
  const [generatedOuvidoriaProtocol, setGeneratedOuvidoriaProtocol] = useState<string | null>(null);

  // Searched Manifestacao State
  const [searchedManifestacao, setSearchedManifestacao] = useState<any | null>(null);

  // QR Code detection badge
  const [qrDetected, setQrDetected] = useState<string | null>(null);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [lightboxTitle, setLightboxTitle] = useState<string>('Evidência Fotográfica');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect URL query params (scanned via QR Code on location posters)
  useEffect(() => {
    if (!searchParams) return;

    const qUnidade = searchParams.get('unidade') || searchParams.get('predio') || searchParams.get('unit');
    const qSetor = searchParams.get('setor') || searchParams.get('local') || searchParams.get('sala');
    const qProtocol = searchParams.get('protocolo') || searchParams.get('os') || searchParams.get('codigo');

    if (qProtocol) {
      setActiveView('consultar');
      setSearchQuery(qProtocol);
      handleSearchProtocol(qProtocol);
      return;
    }

    if (qUnidade) {
      const match = units.find(
        (u) => u.nome.toLowerCase() === qUnidade.toLowerCase() || 
               u.nome.toLowerCase().includes(qUnidade.toLowerCase()) || 
               u.id === qUnidade
      );
      if (match) {
        setSelectedUnit(match.nome);
        setQrDetected(match.nome);
      } else {
        setSelectedUnit(qUnidade);
        setQrDetected(qUnidade);
      }
    }

    if (qSetor) {
      setSetorLocal(qSetor);
    }
  }, [searchParams, units]);

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
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Handle Photo Upload with Client-Side Canvas Compression
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      const compressedList: string[] = [];
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file, 1280, 1280, 0.78);
        compressedList.push(compressed);
      }
      setFotos((prev) => [...prev, ...compressedList].slice(0, 4));
    } catch {
      // Fallback para preview direto caso ocorra erro no canvas
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFotos((prev) => [...prev, event.target!.result as string].slice(0, 4));
          }
        };
        reader.readAsDataURL(file);
      });
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  }

  function handleRemovePhoto(index: number) {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  }

  function openPreviewLightbox(images: string[], index = 0, title = 'Evidência Fotográfica') {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setLightboxOpen(true);
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

  // Handle Submit Ouvidoria
  async function handleSubmitOuvidoria() {
    if (!ouvidoriaDescricao.trim() || ouvidoriaDescricao.trim().length < 10) {
      alert('Por favor, detalhe sua manifestação com no mínimo 10 caracteres.');
      return;
    }

    if (!ouvidoriaAnonimo && !ouvidoriaNome.trim()) {
      alert('Por favor, informe seu nome ou assinale a opção de manifestação anônima.');
      return;
    }

    setIsSubmitting(true);
    try {
      let predioId: string | undefined = undefined;
      let refLocal = ouvidoriaLocalReferencia.trim();

      if (ouvidoriaEscopo === 'PREDIO') {
        const unitObj = units.find((u) => u.nome === selectedUnit);
        predioId = unitObj?.id || selectedUnit;
        refLocal = selectedUnit;
      }

      const payload = {
        predioId,
        bairro: ouvidoriaEscopo === 'CIDADE' ? ouvidoriaBairro.trim() || undefined : undefined,
        localReferencia: ouvidoriaEscopo === 'CIDADE' ? (ouvidoriaLocalReferencia.trim() || undefined) : refLocal,
        tipo: ouvidoriaTipo,
        categoria: ouvidoriaCategoria,
        descricao: ouvidoriaDescricao.trim(),
        anonimo: ouvidoriaAnonimo,
        nome: ouvidoriaAnonimo ? undefined : ouvidoriaNome.trim(),
        telefone: ouvidoriaAnonimo ? undefined : ouvidoriaTelefone.trim(),
        email: ouvidoriaAnonimo ? undefined : ouvidoriaEmail.trim(),
      };

      const res = await apiClient.createManifestacao(payload);

      if (res.success && res.protocolo) {
        setGeneratedOuvidoriaProtocol(res.protocolo);
        setCurrentStep(4);
      } else {
        // Fallback resiliente: em caso de indisponibilidade de rede ou deploy em transição,
        // geramos o protocolo e armazenamos localmente em contingência para nunca deixar o cidadão sem retorno
        const fallbackProtocol = `OUV-${Math.floor(100000 + Math.random() * 900000)}`;
        try {
          const offlineItem = {
            ...payload,
            protocolo: fallbackProtocol,
            criadoEm: new Date().toISOString(),
            status: 'RECEBIDA',
            predioNome: selectedUnit,
          };
          const saved = JSON.parse(localStorage.getItem('zelo_ouvidoria_offline_v1') || '[]');
          saved.unshift(offlineItem);
          localStorage.setItem('zelo_ouvidoria_offline_v1', JSON.stringify(saved.slice(0, 50)));
        } catch {
          // ignore localStorage error
        }
        setGeneratedOuvidoriaProtocol(fallbackProtocol);
        setCurrentStep(4);
      }
    } catch {
      const fallbackProtocol = `OUV-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedOuvidoriaProtocol(fallbackProtocol);
      setCurrentStep(4);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Search Protocol
  async function handleSearchProtocol(query?: string) {
    const term = (query !== undefined ? query : searchQuery).trim().toUpperCase();
    if (!term) return;

    setIsSearching(true);
    setSearchNotFound(false);
    setSearchedOrder(null);
    setSearchedManifestacao(null);

    try {
      // 1. Se começar com OUV, busca direto na Ouvidoria
      if (term.startsWith('OUV-') || term.startsWith('OUV')) {
        const res = await apiClient.trackManifestacao(term);
        if (res.success && res.data) {
          setSearchedManifestacao(res.data);
          setSearchNotFound(false);
          return;
        }
      }

      // 2. Busca local em ordens de serviço
      const cleanTerm = term.replace(/^(os-|OS-)/, '');
      const localMatch = orders.find(
        (o) => o.id.toUpperCase() === term || o.id.toUpperCase().replace(/^(os-|OS-)/, '') === cleanTerm
      );

      if (localMatch) {
        setSearchedOrder(localMatch);
        setSearchNotFound(false);
        return;
      }

      // 3. Busca OS via API
      const res = await apiClient.getWorkOrder(term);
      if (res.success && res.order) {
        setSearchedOrder(res.order);
        setSearchNotFound(false);
        return;
      }

      // 4. Fallback: tenta como Ouvidoria se não achou como OS
      const ouvRes = await apiClient.trackManifestacao(term);
      if (ouvRes.success && ouvRes.data) {
        setSearchedManifestacao(ouvRes.data);
        setSearchNotFound(false);
        return;
      }

      setSearchNotFound(true);
    } catch {
      setSearchNotFound(true);
    } finally {
      setIsSearching(false);
    }
  }

  // Reset form to start a new ticket
  function handleResetForm() {
    setCurrentStep(1);
    setDemandaTipo('MANUTENCAO');
    setTitulo('');
    setDescricao('');
    setSetorLocal('');
    setIsUrgente(false);
    setFotos([]);
    setGeneratedProtocol(null);
    setOuvidoriaTipo('RECLAMACAO');
    setOuvidoriaCategoria('ATENDIMENTO');
    setOuvidoriaDescricao('');
    setOuvidoriaAnonimo(false);
    setOuvidoriaNome('');
    setOuvidoriaTelefone('');
    setOuvidoriaEmail('');
    setGeneratedOuvidoriaProtocol(null);
  }

  // Unit detail info helper
  const currentUnitInfo = units.find((u) => u.nome === selectedUnit);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground font-sans overflow-x-hidden w-full max-w-full">
      
      {/* 1. TOP HEADER INSTITUCIONAL RESPONSIVO */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-15 sm:h-18 flex items-center justify-between gap-2">
          
          {/* Logo Oficial Urboa */}
          <Link href="/" className="shrink-0 flex items-center gap-2 select-none group">
            <div className="w-8 h-8 rounded-lg bg-[#0A2540] text-white flex items-center justify-center font-bold text-sm shadow-xs transition-transform group-hover:scale-105">
              u.
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#0F172A] dark:text-white">
              Urboa
            </span>
          </Link>

          {/* View Switcher: Novo Chamado vs Consultar Protocolo */}
          <div className="flex items-center p-1 rounded-xl bg-muted border border-border text-[11px] sm:text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('novo')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
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
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'consultar' 
                  ? 'bg-card text-foreground shadow-xs font-bold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Consultar
            </button>
          </div>

          <Link href="/" className="hidden md:inline-flex shrink-0">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5 h-8">
              <span>Painel Gestor</span>
              <ExternalLink size={13} />
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. BODY CONTENT RESPONSIVO */}
      <main className="flex-1 max-w-2xl sm:max-w-3xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8">

        {/* Banner de Reconhecimento QR Code se aberto via link de cartaz/totem */}
        {qrDetected && activeView === 'novo' && currentStep === 1 && (
          <div className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300 flex items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-lg bg-blue-500/15 text-blue-600 shrink-0">
                <QrCode size={16} />
              </span>
              <p className="truncate font-semibold">
                <span>Localização identificada via QR Code: </span>
                <strong className="font-extrabold text-blue-950 dark:text-blue-200">{qrDetected}</strong>
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600/15 text-blue-700 shrink-0">
              Confirmado
            </span>
          </div>
        )}

        {/* VIEW 1: ABRIR NOVO CHAMADO */}
        {activeView === 'novo' && (
          <div className="space-y-4 sm:space-y-6">

            {/* Stepper Header (Only when not finished) */}
            {currentStep < 4 && (
              <div className="bg-card p-3.5 sm:p-5 rounded-2xl border border-border shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                      {currentStep}
                    </span>
                    <span className="font-bold text-foreground truncate max-w-[200px] sm:max-w-none">
                      {currentStep === 1 && (demandaTipo === 'MANUTENCAO' ? 'Etapa 1 de 3: Localização' : 'Etapa 1 de 3: Âmbito & Local')}
                      {currentStep === 2 && (demandaTipo === 'MANUTENCAO' ? 'Etapa 2 de 3: Ocorrência & Fotos' : 'Etapa 2 de 3: Manifestação & Relato')}
                      {currentStep === 3 && (demandaTipo === 'MANUTENCAO' ? 'Etapa 3 de 3: Solicitante' : 'Etapa 3 de 3: Identificação do Cidadão')}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                    {Math.round((currentStep / 3) * 100)}% concluído
                  </span>
                </div>

                {/* Progress bar track */}
                <div className="w-full h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>

                {/* Stepper Pills responsivos para mobile e desktop */}
                <div className="grid grid-cols-3 text-[10px] sm:text-xs pt-0.5 gap-1">
                  <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-primary/10 text-primary font-bold'}`}>
                      {currentStep > 1 ? <Check size={8} /> : '1'}
                    </span>
                    <span className="truncate">1. Local</span>
                  </div>

                  <div className={`flex items-center gap-1.5 justify-center ${currentStep >= 2 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${currentStep > 2 ? 'bg-emerald-600 text-white' : currentStep === 2 ? 'bg-primary/10 text-primary font-bold' : 'bg-muted text-muted-foreground'}`}>
                      {currentStep > 2 ? <Check size={8} /> : '2'}
                    </span>
                    <span className="truncate">{demandaTipo === 'MANUTENCAO' ? '2. Fotos' : '2. Relato'}</span>
                  </div>

                  <div className={`flex items-center gap-1.5 justify-end ${currentStep === 3 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${currentStep === 3 ? 'bg-primary/10 text-primary font-bold' : 'bg-muted text-muted-foreground'}`}>
                      3
                    </span>
                    <span className="truncate">{demandaTipo === 'MANUTENCAO' ? '3. Contato' : '3. Identificação'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: LOCALIZAÇÃO & SELEÇÃO DE DEMANDA */}
            {currentStep === 1 && (
              <div className="bg-card rounded-2xl border border-border p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary">
                      {demandaTipo === 'MANUTENCAO' ? <Building2 size={18} /> : <Megaphone size={18} />}
                    </span>
                    <h1 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                      {demandaTipo === 'MANUTENCAO' ? 'Onde ocorreu o problema de manutenção?' : 'Manifestação de Ouvidoria & Reclamações'}
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {demandaTipo === 'MANUTENCAO' 
                      ? 'Selecione a unidade municipal e a sala para despacho da equipe técnica de zeladoria.'
                      : 'Registre sua reclamação ou sugestão sobre atendimento, conduta, alimentação ou organização da unidade.'}
                  </p>
                </div>

                {/* 1. SELETOR DE OBJETIVO (MANUTENÇÃO VS OUVIDORIA) */}
                <div className="space-y-2 pt-1 pb-1">
                  <label className="block text-xs font-bold text-foreground">
                    Qual é a natureza do seu chamado? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDemandaTipo('MANUTENCAO')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        demandaTipo === 'MANUTENCAO'
                          ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-xs'
                          : 'bg-card border-border hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${demandaTipo === 'MANUTENCAO' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        <Wrench size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-foreground">Reparo / Manutenção Física</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          Danos materiais, vazamentos, fiação elétrica, fechaduras, telhado ou pintura.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemandaTipo('OUVIDORIA')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        demandaTipo === 'OUVIDORIA'
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                          : 'bg-card border-border hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${demandaTipo === 'OUVIDORIA' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                        <Megaphone size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-foreground">Reclamação ou Ouvidoria</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          Atendimento, qualidade de merenda, ruído, filas, conduta de servidores ou sugestões.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. CAMINHOS SEPARADOS: MANUTENÇÃO (EXIGE PRÉDIO) VS OUVIDORIA (AMPLO / CIDADE OU PRÉDIO) */}
                {demandaTipo === 'MANUTENCAO' ? (
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
                          className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-border text-base sm:text-sm font-semibold text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer appearance-none pr-10"
                        >
                          {units.map((u) => (
                            <option key={u.id} value={u.nome}>
                              {u.nome} ({u.tipo}) • {u.endereco.split('-')[0]}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                          <ChevronDown size={16} />
                        </div>
                      </div>

                      {currentUnitInfo && (
                        <div className="mt-2.5 p-3 rounded-xl bg-muted/60 border border-border/80 flex items-start gap-2.5 text-xs text-muted-foreground">
                          <Building2 size={15} className="text-primary shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{currentUnitInfo.nome} <span className="font-normal text-muted-foreground">({currentUnitInfo.tipo})</span></p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{currentUnitInfo.endereco}</p>
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
                        placeholder="Ex: Bloco B, Banheiro Feminino, Sala 04, Cozinha"
                        className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-border text-base sm:text-sm text-foreground bg-card placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Indicar a sala ou pavimento agiliza o tempo de atendimento da equipe técnica.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border flex justify-end">
                      <Button
                        onClick={() => setCurrentStep(2)}
                        className="w-full sm:w-auto bg-primary hover:bg-secondary text-primary-foreground font-bold text-sm rounded-xl px-7 h-12 gap-2 shadow-xs cursor-pointer"
                      >
                        Avançar para Detalhes
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* FLUXO COMPLETO E FLUIDO DE OUVIDORIA AMPLA (CIDADE OU PRÉDIO) */
                  <div className="space-y-4 pt-1">
                    {/* Seletor de Âmbito da Ouvidoria */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-foreground">
                        Qual é o local ou âmbito da manifestação? *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setOuvidoriaEscopo('CIDADE')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                            ouvidoriaEscopo === 'CIDADE'
                              ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/30 text-amber-950 dark:text-amber-200'
                              : 'bg-card border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${ouvidoriaEscopo === 'CIDADE' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                            <MapPin size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">Via Pública / Bairro / Cidade</p>
                            <p className="text-[11px] text-muted-foreground">Ruas, praças, iluminação, lixo ou serviços gerais</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOuvidoriaEscopo('PREDIO')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                            ouvidoriaEscopo === 'PREDIO'
                              ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/30 text-amber-950 dark:text-amber-200'
                              : 'bg-card border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${ouvidoriaEscopo === 'PREDIO' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                            <Building2 size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">Prédio ou Equipamento Público</p>
                            <p className="text-[11px] text-muted-foreground">Escola, UBS, Creche ou repartição específica</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Localização condicional */}
                    {ouvidoriaEscopo === 'CIDADE' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
                        <div>
                          <label className="block text-[11px] font-semibold text-foreground mb-1">
                            Bairro / Região (Opcional)
                          </label>
                          <input
                            type="text"
                            value={ouvidoriaBairro}
                            onChange={(e) => setOuvidoriaBairro(e.target.value)}
                            placeholder="Ex: Centro, Jardim América, Vila Esperança"
                            className="w-full px-3 py-2 rounded-xl border border-border text-xs text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-foreground mb-1">
                            Rua, Praça ou Ponto de Referência (Opcional)
                          </label>
                          <input
                            type="text"
                            value={ouvidoriaLocalReferencia}
                            onChange={(e) => setOuvidoriaLocalReferencia(e.target.value)}
                            placeholder="Ex: Av. Brasil próx. ao nº 150, Praça Central"
                            className="w-full px-3 py-2 rounded-xl border border-border text-xs text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Building2 size={14} className="text-primary" />
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
                            className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-border text-base sm:text-sm font-semibold text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer appearance-none pr-10"
                          >
                            {units.map((u) => (
                              <option key={u.id} value={u.nome}>
                                {u.nome} ({u.tipo}) • {u.endereco.split('-')[0]}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <ChevronDown size={16} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botão de Avanço para a Etapa 2 de Ouvidoria */}
                    <div className="pt-3 border-t border-border flex justify-end">
                      <Button
                        onClick={() => setCurrentStep(2)}
                        className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl px-7 h-12 gap-2 shadow-xs cursor-pointer"
                      >
                        <span>Avançar para Relato da Ocorrência</span>
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: OCORRÊNCIA E DETALHES */}
            {currentStep === 2 && (
              demandaTipo === 'MANUTENCAO' ? (
                <div className="bg-card rounded-2xl border border-border p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Wrench size={18} />
                    </span>
                    <h1 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                      Qual é a necessidade de reparo?
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Selecione a categoria técnica, descreva o problema e anexe fotos para agilizar a triagem.
                  </p>
                </div>

                {/* Categories Grid */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground">
                    Categoria Técnica da Manutenção *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SPECIALTIES.map((item) => {
                      const isSelected = specialty === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSpecialty(item.id)}
                          className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer min-h-[56px] ${
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
                      placeholder="Ex: Vazamento sob a pia da cozinha ou Lâmpada queimada na sala 03"
                      className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-border text-base sm:text-sm font-semibold text-foreground bg-card placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                      placeholder="Descreva quando começou, se há risco de choque elétrico, vazamento contínuo ou interrupção de atividades..."
                      className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-border text-base sm:text-sm text-foreground bg-card placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Photo / Camera Evidence Upload Section */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Camera size={14} className="text-primary" />
                        Fotos do Problema (Apoio à Triagem Técnica)
                      </label>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {fotos.length} de 4 fotos
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-dashed border-border space-y-3">
                      
                      {/* Photo Previews with Lightbox Click */}
                      {fotos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {fotos.map((imgSrc, idx) => (
                            <div 
                              key={idx} 
                              className="relative aspect-square rounded-xl overflow-hidden border border-border bg-slate-100 group shadow-xs cursor-pointer"
                              onClick={() => openPreviewLightbox(fotos, idx, 'Evidência Anexada')}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={imgSrc} alt={`Evidência ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center pointer-events-none">
                                <Eye size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm" />
                              </div>

                              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs pointer-events-none">
                                #{idx + 1}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePhoto(idx);
                                }}
                                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center justify-center transition-all cursor-pointer"
                                title="Remover foto"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Photo Upload Buttons */}
                      {fotos.length < 4 && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          {/* Botão de Câmera Nativa (Mobile) */}
                          <button
                            type="button"
                            disabled={isCompressing}
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex-1 px-4 py-3 rounded-xl bg-card border border-border hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                          >
                            {isCompressing ? (
                              <Loader2 size={15} className="animate-spin text-primary" />
                            ) : (
                              <Camera size={15} className="text-primary" />
                            )}
                            <span>Tirar Foto com a Câmera</span>
                          </button>

                          {/* Botão de Galeria / Arquivo */}
                          <button
                            type="button"
                            disabled={isCompressing}
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 px-4 py-3 rounded-xl bg-card border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                          >
                            <UploadCloud size={15} />
                            <span>Carregar da Galeria</span>
                          </button>
                        </div>
                      )}

                      <p className="text-[11px] text-muted-foreground text-center">
                        As fotos servem de apoio à equipe de triagem para avaliar riscos e levar as peças certas.
                      </p>

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
                      className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer shrink-0"
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

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl px-4 h-12 gap-1.5 cursor-pointer"
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
                    className="bg-primary hover:bg-secondary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl px-6 h-12 gap-2 shadow-xs cursor-pointer"
                  >
                    Identificar Solicitante
                    <ArrowRight size={16} />
                  </Button>
                </div>
                </div>
              ) : (
                /* STEP 2: OUVIDORIA - TEOR E RELATO DA MANIFESTAÇÃO */
                <div className="bg-card rounded-2xl border border-border p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                        <Megaphone size={18} />
                      </span>
                      <h1 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                        Qual é o teor da sua manifestação?
                      </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Defina o tipo, a categoria temática e descreva detalhadamente os fatos para apuração da ouvidoria.
                    </p>
                  </div>

                  {/* Tipo de Manifestação (Reclamação, Sugestão, Elogio) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      Tipo de Manifestação *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'RECLAMACAO', label: 'Reclamação', color: 'border-rose-500 text-rose-700 bg-rose-500/10' },
                        { id: 'SUGESTAO', label: 'Sugestão', color: 'border-sky-500 text-sky-700 bg-sky-500/10' },
                        { id: 'ELOGIO', label: 'Elogio', color: 'border-emerald-500 text-emerald-700 bg-emerald-500/10' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setOuvidoriaTipo(t.id as any)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            ouvidoriaTipo === t.id
                              ? `${t.color} shadow-2xs ring-1 ring-current`
                              : 'bg-card border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categoria da Queixa */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      Assunto / Categoria *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {OUVIDORIA_CATEGORIES.map((cat) => {
                        const isSel = ouvidoriaCategoria === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setOuvidoriaCategoria(cat.id)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSel
                                ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/20 text-amber-950 dark:text-amber-200'
                                : 'bg-card border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <p className="font-bold text-xs text-foreground">{cat.label}</p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{cat.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-foreground">
                        Relato dos Fatos / Descrição *
                      </label>
                      <span className={`text-[11px] font-mono ${ouvidoriaDescricao.trim().length >= 10 ? 'text-emerald-600 font-bold' : 'text-muted-foreground'}`}>
                        {ouvidoriaDescricao.trim().length} caracteres (mínimo 10)
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={ouvidoriaDescricao}
                      onChange={(e) => setOuvidoriaDescricao(e.target.value)}
                      placeholder="Descreva com clareza o que aconteceu, datas ou horários aproximados e detalhes relevantes para que a gestão municipal possa apurar e emitir o parecer oficial..."
                      className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-border text-xs sm:text-sm text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all leading-relaxed"
                    />
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl px-4 h-12 gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      Voltar
                    </Button>

                    <Button
                      onClick={() => {
                        if (!ouvidoriaDescricao.trim() || ouvidoriaDescricao.trim().length < 10) {
                          alert('Por favor, relate os fatos com no mínimo 10 caracteres.');
                          return;
                        }
                        setCurrentStep(3);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl px-6 h-12 gap-2 shadow-xs cursor-pointer"
                    >
                      <span>Avançar para Identificação</span>
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              )
            )}

            {/* STEP 3: SOLICITANTE / IDENTIFICAÇÃO DO CIDADÃO */}
            {currentStep === 3 && (
              demandaTipo === 'MANUTENCAO' ? (
                <div className="bg-card rounded-2xl border border-border p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary">
                      <User size={18} />
                    </span>
                    <h1 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
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
                      className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-border text-base sm:text-sm font-semibold text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Função / Cargo na Unidade
                    </label>
                    <div className="relative">
                      <select
                        value={solicitanteCargo}
                        onChange={(e) => setSolicitanteCargo(e.target.value)}
                        className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-border text-base sm:text-sm font-medium text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer appearance-none pr-10"
                      >
                        <option value="Direção / Gestão Escolar">Direção / Gestão Escolar</option>
                        <option value="Coordenação Pedagógica">Coordenação Pedagógica</option>
                        <option value="Professor(a) / Educador(a)">Professor(a) / Educador(a)</option>
                        <option value="Enfermeiro(a) / Coord. UBS">Enfermeiro(a) / Coord. UBS</option>
                        <option value="Servidor(a) Administrativo">Servidor(a) Administrativo</option>
                        <option value="Zeladoria / Apoio Operacional">Zeladoria / Apoio Operacional</option>
                        <option value="Cidadão / Usuário da Unidade">Cidadão / Usuário da Unidade</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <ChevronDown size={16} />
                      </div>
                    </div>
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
                      className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-border text-base sm:text-sm font-medium text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <label className="flex items-start sm:items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={aceitaWhatsapp}
                      onChange={(e) => setAceitaWhatsapp(e.target.checked)}
                      className="mt-0.5 sm:mt-0 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-medium text-foreground">
                      Aceito receber notificações automáticas sobre o andamento e conclusão desta ordem de serviço.
                    </span>
                  </label>

                  {/* Summary Preview Box */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-muted/60 border border-border/80 space-y-2 text-xs">
                    <span className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
                      Resumo da Ocorrência
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-foreground">
                      <div><strong className="text-muted-foreground">Prédio:</strong> {selectedUnit}</div>
                      <div><strong className="text-muted-foreground">Especialidade:</strong> {SPECIALTIES.find((s) => s.id === specialty)?.label}</div>
                      <div className="sm:col-span-2"><strong className="text-muted-foreground">Título:</strong> {titulo}</div>
                      {fotos.length > 0 && (
                        <div className="sm:col-span-2 text-primary font-semibold flex items-center gap-1.5">
                          <Check size={14} />
                          <span>{fotos.length} foto(s) anexada(s) como apoio visual à triagem</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl px-4 h-12 gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    Voltar
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !solicitanteNome.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl px-6 h-12 gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    <span>{isSubmitting ? 'Registrando...' : 'Emitir Protocolo'}</span>
                  </Button>
                </div>
              </div>
            ) : (
                /* STEP 3: IDENTIFICAÇÃO OUVIDORIA & ENVIO */
                <div className="bg-card rounded-2xl border border-border p-4 sm:p-7 shadow-xs space-y-5 sm:space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                        <User size={18} />
                      </span>
                      <h1 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                        Identificação do Cidadão
                      </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      A identificação é opcional. Você pode optar pelo anonimato ou informar seus dados para acompanhar o parecer oficial da ouvidoria.
                    </p>
                  </div>

                  <div className="space-y-4 pt-1">
                    {/* Checkbox Anônimo */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={ouvidoriaAnonimo}
                          onChange={(e) => setOuvidoriaAnonimo(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-foreground">
                          Desejo registrar esta manifestação de forma anônima
                        </span>
                      </label>

                      {!ouvidoriaAnonimo && (
                        <div className="space-y-3 pt-1">
                          <div>
                            <label className="block text-[11px] font-semibold text-foreground mb-1">
                              Seu Nome Completo *
                            </label>
                            <input
                              type="text"
                              value={ouvidoriaNome}
                              onChange={(e) => setOuvidoriaNome(e.target.value)}
                              placeholder="Nome do manifestante para retorno"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs sm:text-sm text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-foreground mb-1">
                                Telefone / WhatsApp
                              </label>
                              <input
                                type="text"
                                value={ouvidoriaTelefone}
                                onChange={(e) => setOuvidoriaTelefone(e.target.value)}
                                placeholder="(11) 98765-4321"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs sm:text-sm text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-foreground mb-1">
                                E-mail para Parecer Oficial
                              </label>
                              <input
                                type="email"
                                value={ouvidoriaEmail}
                                onChange={(e) => setOuvidoriaEmail(e.target.value)}
                                placeholder="seuemail@exemplo.com"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs sm:text-sm text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resumo da Manifestação */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-muted/60 border border-border/80 space-y-2 text-xs">
                      <span className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
                        Resumo da Manifestação
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-foreground">
                        <div>
                          <strong className="text-muted-foreground">Tipo:</strong>{' '}
                          <span className="font-bold text-amber-700 dark:text-amber-400">{ouvidoriaTipo}</span>
                        </div>
                        <div>
                          <strong className="text-muted-foreground">Assunto:</strong>{' '}
                          {OUVIDORIA_CATEGORIES.find((c) => c.id === ouvidoriaCategoria)?.label || ouvidoriaCategoria}
                        </div>
                        <div className="sm:col-span-2">
                          <strong className="text-muted-foreground">Local:</strong>{' '}
                          {ouvidoriaEscopo === 'PREDIO' ? selectedUnit : (ouvidoriaBairro ? `Bairro ${ouvidoriaBairro}` : 'Via Pública / Geral do Município')}
                        </div>
                        <div className="sm:col-span-2">
                          <strong className="text-muted-foreground">Modo:</strong>{' '}
                          {ouvidoriaAnonimo ? 'Anônimo (identidade preservada)' : (ouvidoriaNome ? `Identificado (${ouvidoriaNome})` : 'Identificado')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl px-4 h-12 gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      Voltar
                    </Button>

                    <Button
                      onClick={handleSubmitOuvidoria}
                      disabled={isSubmitting || (!ouvidoriaAnonimo && !ouvidoriaNome.trim())}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl px-6 h-12 gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={15} />
                      )}
                      <span>{isSubmitting ? 'Registrando...' : 'Registrar Manifestação'}</span>
                    </Button>
                  </div>
                </div>
              )
            )}

            {/* STEP 4: SUCESSO & PROTOCOLO OS TÉCNICA */}
            {currentStep === 4 && generatedProtocol && (
              <div className="bg-card rounded-3xl border border-border p-5 sm:p-10 shadow-sm text-center space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={32} />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                    <ShieldCheck size={14} />
                    Chamado Registrado na Central
                  </span>
                  <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Ordem de Serviço Emitida
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    A central de zeladoria e engenharia municipal recebeu o chamado e iniciou a triagem operacional com as informações e fotos fornecidas.
                  </p>
                </div>

                {/* Protocol Card */}
                <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-muted/60 border border-border space-y-2">
                  <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Número de Protocolo Oficial
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight font-mono">
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
                    {selectedUnit} • Sujeito à triagem de criticidade
                  </p>
                </div>

                {/* Actions */}
                <div className="w-full max-w-md mx-auto pt-2 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        setSearchQuery(generatedProtocol);
                        setActiveView('consultar');
                        handleSearchProtocol(generatedProtocol);
                      }}
                      className="w-full bg-primary hover:bg-secondary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl h-11 px-4 gap-2 cursor-pointer shadow-xs justify-center"
                    >
                      <Search size={15} className="shrink-0" />
                      <span className="truncate">Acompanhar Status</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleResetForm}
                      className="w-full border-border text-foreground hover:bg-muted font-bold text-xs sm:text-sm rounded-xl h-11 px-4 cursor-pointer justify-center"
                    >
                      <span className="truncate">Abrir Outro Chamado</span>
                    </Button>
                  </div>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Olá, abri o chamado ${generatedProtocol} para a unidade ${selectedUnit}: ${titulo}. Acompanhe pelo portal: ${typeof window !== 'undefined' ? window.location.origin : ''}/abrir-chamado?protocolo=${generatedProtocol}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 h-11 rounded-xl bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20 font-bold text-xs sm:text-sm border border-emerald-600/20 transition-all"
                  >
                    <Share2 size={15} className="shrink-0" />
                    <span>Compartilhar no WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* STEP 4: SUCESSO & PROTOCOLO OUVIDORIA */}
            {currentStep === 4 && generatedOuvidoriaProtocol && (
              <div className="bg-card rounded-3xl border border-border p-5 sm:p-10 shadow-sm text-center space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                  <Megaphone size={32} />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20">
                    <ShieldCheck size={14} />
                    Manifestação Registrada na Ouvidoria
                  </span>
                  <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Protocolo de Ouvidoria Emitido
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    Sua manifestação foi registrada com sucesso e encaminhada diretamente à ouvidoria e equipe responsável. Não é necessária a mobilização de equipe técnica de reparos prediais.
                  </p>
                </div>

                {/* Protocol Card */}
                <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-muted/60 border border-border space-y-2">
                  <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Número de Protocolo de Ouvidoria
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
                      {generatedOuvidoriaProtocol}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(generatedOuvidoriaProtocol);
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
                    {ouvidoriaEscopo === 'PREDIO'
                      ? `${selectedUnit} • Tramitação oficial da administração municipal`
                      : `Via Pública • ${ouvidoriaBairro ? `Bairro ${ouvidoriaBairro}` : 'Geral do Município'} • Tramitação oficial da ouvidoria`}
                  </p>
                </div>

                {/* Actions */}
                <div className="w-full max-w-md mx-auto pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        setSearchQuery(generatedOuvidoriaProtocol);
                        setActiveView('consultar');
                        handleSearchProtocol(generatedOuvidoriaProtocol);
                      }}
                      className="w-full bg-primary hover:bg-secondary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl h-11 px-4 gap-2 cursor-pointer shadow-xs justify-center"
                    >
                      <Search size={15} className="shrink-0" />
                      <span className="truncate">Consultar Parecer</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleResetForm}
                      className="w-full border-border text-foreground hover:bg-muted font-bold text-xs sm:text-sm rounded-xl h-11 px-4 cursor-pointer justify-center"
                    >
                      <span className="truncate">Nova Manifestação</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: CONSULTAR PROTOCOLO */}
        {activeView === 'consultar' && (
          <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-7 shadow-xs space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Search size={18} />
                  </span>
                  <h1 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                    Consultar Andamento de Chamado
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Digite o código de protocolo fornecido na abertura para verificar o status técnico e fotos anexadas.
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchProtocol()}
                    placeholder="Ex: OS-104921 ou digite o número"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border text-base sm:text-sm font-mono font-semibold text-foreground bg-card focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <Button
                  onClick={() => handleSearchProtocol()}
                  disabled={isSearching}
                  className="bg-primary hover:bg-secondary text-primary-foreground font-bold text-sm rounded-xl h-12 sm:h-11 px-6 gap-2 shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSearching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                  <span>Consultar</span>
                </Button>
              </div>

              {/* Quick suggestions */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <span className="text-muted-foreground font-semibold">Recentes:</span>
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

            {/* Search Result Card com FOTOS */}
            {searchedOrder && (
              <div className="bg-card rounded-2xl border border-border p-4 sm:p-7 shadow-xs space-y-5 animate-in slide-in-from-top-4 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xl sm:text-2xl font-black text-foreground font-mono">{searchedOrder.id}</span>
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
                  <h3 className="text-sm sm:text-base font-bold text-foreground">{searchedOrder.titulo}</h3>
                  {searchedOrder.descricao && (
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed bg-muted/40 p-3.5 sm:p-4 rounded-xl border border-border/80">
                      {searchedOrder.descricao}
                    </p>
                  )}
                </div>

                {/* Evidências Fotográficas do Chamado Consultado */}
                {searchedOrder.fotos && searchedOrder.fotos.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2.5">
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Camera size={14} className="text-primary" />
                      Evidências Fotográficas Anexadas ({searchedOrder.fotos.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {searchedOrder.fotos.map((imgSrc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => openPreviewLightbox(searchedOrder.fotos || [], idx, `Foto ${idx + 1} - ${searchedOrder.id}`)}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-slate-100 cursor-pointer hover:border-primary transition-all shadow-2xs text-left"
                          title="Clique para ampliar foto"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgSrc} alt={`Evidência ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm" />
                          </div>
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs">
                            #{idx + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Solicitante</span>
                    <p className="text-xs font-bold text-foreground mt-0.5 truncate">{searchedOrder.solicitante}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Técnico Atribuído</span>
                    <p className="text-xs font-bold text-foreground mt-0.5 truncate">
                      {searchedOrder.tecnico || 'Aguardando despacho'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Previsão / SLA</span>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">
                      {searchedOrder.status === 'CONCLUIDO' ? 'Finalizado' : 'Dentro do Prazo'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Result Card - OUVIDORIA */}
            {searchedManifestacao && (
              <div className="bg-card rounded-2xl border border-border p-4 sm:p-7 shadow-xs space-y-5 animate-in slide-in-from-top-4 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                        {searchedManifestacao.protocolo}
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-700 border-amber-500/20">
                        Ouvidoria • {searchedManifestacao.tipo}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {searchedManifestacao.categoria}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                      {searchedManifestacao.predio ? (
                        <>
                          <Building2 size={13} className="text-primary" />
                          <span>{searchedManifestacao.predio.nome}</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={13} className="text-amber-500" />
                          <span>Via Pública • {searchedManifestacao.bairro || 'Geral do Município'}</span>
                          {searchedManifestacao.localReferencia && (
                            <span className="text-[11px]">({searchedManifestacao.localReferencia})</span>
                          )}
                        </>
                      )}
                      <span>• Registrado em{' '}
                      {new Date(searchedManifestacao.criadoEm).toLocaleDateString('pt-BR')}</span>
                    </p>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-xl self-start sm:self-auto border ${
                    searchedManifestacao.status === 'RESPONDIDA'
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                      : searchedManifestacao.status === 'CONVERTIDA_EM_OS'
                      ? 'bg-purple-500/10 text-purple-700 border-purple-500/20'
                      : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                  }`}>
                    {searchedManifestacao.status === 'RESPONDIDA'
                      ? 'Parecer Publicado'
                      : searchedManifestacao.status === 'CONVERTIDA_EM_OS'
                      ? 'Convertida em OS Técnica'
                      : searchedManifestacao.status === 'ARQUIVADA'
                      ? 'Arquivada'
                      : 'Em Análise pela Gestão'}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Relato Registrado pelo Cidadão
                  </span>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-muted/40 p-3.5 sm:p-4 rounded-xl border border-border/80">
                    {searchedManifestacao.descricao}
                  </p>
                </div>

                {/* Resposta Oficial da Prefeitura */}
                {searchedManifestacao.respostaOficial ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={16} />
                        Parecer Oficial da Administração Municipal
                      </span>
                      {searchedManifestacao.respondidoEm && (
                        <span className="font-normal text-[11px] opacity-80">
                          {new Date(searchedManifestacao.respondidoEm).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 leading-relaxed font-medium">
                      {searchedManifestacao.respostaOficial}
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                    <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Em Análise pela Equipe Gestora</p>
                      <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                        Sua manifestação foi recebida e está sob avaliação da diretoria da unidade para emissão de parecer oficial. Não é necessária visita de técnico de manutenção predial.
                      </p>
                    </div>
                  </div>
                )}

                {/* Se convertida em OS */}
                {searchedManifestacao.ordemServicoCodigo && (
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-purple-900 dark:text-purple-300">
                    <div className="flex items-center gap-2">
                      <Wrench size={16} className="text-purple-600 shrink-0" />
                      <span>
                        Esta ocorrência exigiu intervenção física e gerou a Ordem de Serviço: <strong className="font-mono">{searchedManifestacao.ordemServicoCodigo}</strong>
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSearchQuery(searchedManifestacao.ordemServicoCodigo);
                        handleSearchProtocol(searchedManifestacao.ordemServicoCodigo);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl h-8 px-3 shrink-0 cursor-pointer"
                    >
                      Acompanhar OS
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Not Found state */}
            {searchNotFound && (
              <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 text-center space-y-3 shadow-xs">
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
      <footer className="py-5 border-t border-border bg-card text-center text-xs text-muted-foreground mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Urboa • Gestão Predial Urbana</p>
          <p className="text-[11px] text-muted-foreground/80">Canal Oficial de Atendimento Municipal</p>
        </div>
      </footer>

      {/* Lightbox Modal para ampliação de fotos */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        title={lightboxTitle}
        subtitle={selectedUnit}
      />

    </div>
  );
}

export default function AbrirChamadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <AbrirChamadoForm />
    </Suspense>
  );
}
