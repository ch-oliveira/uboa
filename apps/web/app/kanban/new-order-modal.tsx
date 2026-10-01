'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  User, 
  ArrowRight, 
  FileText,
  Camera,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PREDIOS, type OrdemServico, type StatusOS } from './data';
import { useAuth } from '@/context/auth-context';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (order: OrdemServico) => void | Promise<any>;
  defaultPredio?: string;
  defaultSolicitante?: string;
  onOpenOrder?: (order: OrdemServico) => void;
  onStartTriage?: (order: OrdemServico) => void;
}

export function NewOrderModal({ 
  isOpen, 
  onClose, 
  onCreate, 
  defaultPredio, 
  defaultSolicitante,
  onOpenOrder,
  onStartTriage
}: Props) {
  const { user, role } = useAuth();
  const loggedUserName = user?.nome || 'Mariana Alves';

  // Form State
  const [predio, setPredio] = useState<string>(defaultPredio || '');
  const [localEspecifico, setLocalEspecifico] = useState('');
  const [tipoOcorrencia, setTipoOcorrencia] = useState('Geral');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  
  // Solicitante em nome de terceiros
  const [isOtherRequester, setIsOtherRequester] = useState(false);
  const [solicitanteNome, setSolicitanteNome] = useState(defaultSolicitante || '');
  
  // UI States
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrdemServico | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPredio(defaultPredio || '');
      setLocalEspecifico('');
      setTipoOcorrencia('Geral');
      setTitulo('');
      setDescricao('');
      setIsOtherRequester(Boolean(defaultSolicitante && defaultSolicitante !== loggedUserName));
      setSolicitanteNome(defaultSolicitante || '');
      setError('');
      setIsSubmitting(false);
      setCreatedOrder(null);
      setShowDiscardConfirm(false);
    }
  }, [isOpen, defaultPredio, defaultSolicitante, loggedUserName]);

  if (!isOpen) return null;

  const hasDraft = titulo.trim() || localEspecifico.trim() || descricao.trim();

  function handleAttemptClose() {
    if (createdOrder) {
      onClose();
      return;
    }
    if (hasDraft && !showDiscardConfirm) {
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!predio) {
      setError('Por favor, selecione a unidade ou prédio onde ocorreu o problema.');
      return;
    }
    if (!titulo.trim()) {
      setError('Por favor, descreva o que aconteceu no chamado.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const randomId = `OS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const formattedDate = `${now.getDate()} Set, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const author = isOtherRequester && solicitanteNome.trim() 
      ? `${solicitanteNome.trim()} (por ${loggedUserName})`
      : loggedUserName;

    const fullDescricao = [
      localEspecifico.trim() ? `Local específico: ${localEspecifico.trim()}` : '',
      tipoOcorrencia ? `Categoria inicial: ${tipoOcorrencia}` : '',
      descricao.trim() ? `Detalhes: ${descricao.trim()}` : ''
    ].filter(Boolean).join('\n\n');

    const newOrder: OrdemServico = {
      id: randomId,
      titulo: titulo.trim(),
      predio,
      prioridade: 'MEDIA', // Valor padrão interno de sistema; a prioridade real é atribuída na Triagem
      status: 'TRIAGEM' as StatusOS, // O chamado inicia sempre na etapa de triagem
      dataAbertura: formattedDate,
      solicitante: author,
      tecnico: undefined, // Designação de equipe pertence ao planejamento
      descricao: fullDescricao || undefined,
      historico: [
        {
          data: formattedDate,
          descricao: `Chamado registrado no sistema. Aguardando triagem operacional.`,
          autor: author,
        },
      ],
    };

    try {
      await onCreate(newOrder);
      setCreatedOrder(newOrder);
    } catch {
      setError('Ocorreu um erro ao registrar o chamado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="ds-card shadow-popover w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-muted/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-foreground text-base">Novo Chamado</h2>
              <p className="text-xs text-muted-foreground font-medium">
                {createdOrder ? 'Solicitação registrada com sucesso' : 'Registre o que aconteceu e onde'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleAttemptClose}
            className="text-muted-foreground hover:text-foreground rounded-md p-1.5 hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Confirmation Screen after Create */}
        {createdOrder ? (
          <div className="p-7 space-y-6 overflow-y-auto flex-1">
            <div className="p-5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                <h3 className="font-extrabold text-sm sm:text-base text-emerald-900">
                  Chamado #{createdOrder.id.replace(/^(os-|OS-)/i, '')} criado
                </h3>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                A solicitação foi registrada no fluxo oficial e está <strong>Aguardando triagem</strong> para definição de prioridade e prazo pela gestão.
              </p>
            </div>

            {/* Ticket Summary Card */}
            <div className="bg-input rounded-lg p-4.5 border border-border space-y-3 text-xs">
              <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-border">
                <div>
                  <span className="ds-label">Título da Ocorrência</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">{createdOrder.titulo}</p>
                </div>
                <span className="ds-badge bg-amber-50 border border-amber-200 text-amber-800">
                  Triagem pendente
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Local</span>
                  <p className="font-semibold text-foreground mt-0.5">{createdOrder.predio}</p>
                  {localEspecifico && <p className="text-[11px] text-muted-foreground">{localEspecifico}</p>}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Registrado por</span>
                  <p className="font-semibold text-foreground mt-0.5">{createdOrder.solicitante}</p>
                </div>
              </div>
            </div>

            {/* Actions for next step */}
            <div className="space-y-2.5 pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Próximos passos</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {onStartTriage && role !== 'SOLICITANTE' && (
                  <Button
                    type="button"
                    onClick={() => {
                      onStartTriage(createdOrder);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-bold text-xs py-3 px-4 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Iniciar triagem agora</span>
                    <ArrowRight size={14} />
                  </Button>
                )}

                {onOpenOrder && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onOpenOrder(createdOrder);
                    }}
                    className="rounded-md border-border text-foreground font-bold text-xs py-3 px-4 hover:bg-muted cursor-pointer"
                  >
                    <span>Abrir detalhes</span>
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="w-full text-muted-foreground hover:text-foreground text-xs font-semibold py-2 cursor-pointer"
              >
                Concluir e fechar
              </Button>
            </div>
          </div>
        ) : (
          /* Modal Body: Minimal Guided Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-md border border-red-200">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Alerta de Descarte se fechar preenchido */}
            {showDiscardConfirm && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-center justify-between gap-3 animate-in fade-in">
                <span>Você começou a preencher este chamado. Deseja realmente fechar e perder os dados?</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowDiscardConfirm(false)}
                    className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-bold text-amber-900 text-[11px] cursor-pointer"
                  >
                    Continuar
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            )}

            {/* SEÇÃO 1: ONDE ACONTECEU? */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] font-bold text-foreground uppercase tracking-wider">
                <span className="w-4 h-4 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-[9px]">1</span>
                <span>Onde aconteceu?</span>
              </div>

              {/* Unidade / Prédio */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Unidade / Prédio Municipal *
                </label>
                <select
                  value={predio}
                  onChange={(e) => {
                    setPredio(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-md text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all font-medium cursor-pointer"
                >
                  <option value="" disabled>Selecione o local...</option>
                  {PREDIOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Local específico dentro da unidade */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Local específico dentro do prédio
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: Banheiro térreo masculino, Sala 04, Pátio externo"
                    value={localEspecifico}
                    onChange={(e) => setLocalEspecifico(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded-md text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all font-medium"
                  />
                  <MapPin size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: O QUE ACONTECEU? */}
            <div className="space-y-2.5 pt-2.5 border-t border-border">
              <div className="flex items-center gap-2 text-[11px] font-bold text-foreground uppercase tracking-wider">
                <span className="w-4 h-4 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-[9px]">2</span>
                <span>O que aconteceu?</span>
              </div>

              {/* Categoria / Tipo */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Tipo de ocorrência
                </label>
                <select
                  value={tipoOcorrencia}
                  onChange={(e) => setTipoOcorrencia(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-md text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all font-medium cursor-pointer"
                >
                  <option value="Hidráulica">Hidráulica (vazamentos, pias, descargas, canos)</option>
                  <option value="Elétrica">Elétrica (iluminação, disjuntores, tomadas, fiação)</option>
                  <option value="Alvenaria e Pintura">Alvenaria e Pintura (infiltrações, reboco, portas)</option>
                  <option value="Acessibilidade">Acessibilidade (rampas, corrimãos, barras de apoio)</option>
                  <option value="Telhado e Calhas">Telhado e Calhas (goteiras, telhas quebradas)</option>
                  <option value="Geral">Geral / Outros reparos</option>
                </select>
              </div>

              {/* Título ou Descrição Curta */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Resumo da ocorrência *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Vazamento sob a pia da cozinha"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-md text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all font-medium"
                />
              </div>

              {/* Descrição Detalhada Opcional */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Observações adicionais (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Água começou a vazar durante a manhã, balde foi colocado no local..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-md text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background transition-all resize-none font-medium"
                />
              </div>
            </div>

            {/* SEÇÃO 3: QUEM RELATOU? */}
            <div className="space-y-2 pt-2.5 border-t border-border">
              <div className="flex items-center gap-2 text-[11px] font-bold text-foreground uppercase tracking-wider">
                <span className="w-4 h-4 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-[9px]">3</span>
                <span>Identificação do solicitante</span>
              </div>

              <div className="p-3 bg-muted/30 rounded-md border border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User size={15} className="text-primary" />
                  <span>Registrado por <strong>{loggedUserName}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOtherRequester(!isOtherRequester)}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  {isOtherRequester ? 'Registrar por mim' : 'Registrar por terceiro'}
                </button>
              </div>

              {isOtherRequester && (
                <div className="space-y-1 animate-in fade-in">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Nome e contato de quem informou o defeito
                  </label>
                  <input
                    type="text"
                    value={solicitanteNome}
                    onChange={(e) => setSolicitanteNome(e.target.value)}
                    placeholder="Ex: Diretor Carlos (11 98888-0000)"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>
              )}
            </div>

            {/* Nota de rodapé explicativa sobre triagem */}
            <div className="p-3 rounded-md bg-primary/10 border border-primary/20 flex items-start gap-2 text-[11px] text-primary leading-snug">
              <HelpCircle size={14} className="shrink-0 text-primary mt-0.5" />
              <span>Prioridade, equipe responsável e prazo de atendimento serão determinados na <strong>etapa de triagem</strong> pela gestão municipal.</span>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-border">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleAttemptClose}
                className="rounded-md border-border text-muted-foreground font-semibold cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-bold shadow-sm px-6 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  'Criar chamado'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

