'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ThumbsUp, 
  User, 
  Building2, 
  Star, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OrdemServico, HistoricoItem } from '@/app/kanban/data';
import { useAuth } from '@/context/auth-context';

/**
 * Propriedades do modal de validação e aceite formal de ordem de serviço.
 */
export interface ValidacaoReparoModalProps {
  /** Indica se o modal está visível */
  isOpen: boolean;
  /** Callback para fechamento do modal sem mutação */
  onClose: () => void;
  /** Ordem de serviço a ser auditada e validada */
  order: OrdemServico | null;
  /**
   * Callback invocado quando a unidade aprova formalmente a conclusão do reparo.
   * Transiciona o status para `CONCLUIDO` e gera registro de auditoria com avaliação.
   *
   * @param order - Ordem de serviço atualizada com histórico de aceite
   * @param feedback - Observação ou elogio opcional registrado pela unidade
   * @param rating - Nota de satisfação de 1 a 5 estrelas atribuída à intervenção
   */
  onConfirmApproval: (order: OrdemServico, feedback?: string, rating?: number) => void;
  /**
   * Callback invocado quando a unidade aponta inconformidade ou recusa o reparo.
   * Retorna o status para `EM_EXECUCAO` e registra a contestação técnica formal.
   *
   * @param order - Ordem de serviço com histórico de contestação
   * @param reason - Motivo categorizado da recusa
   * @param details - Detalhamento obrigatório da pendência constatada no local
   */
  onConfirmDispute: (order: OrdemServico, reason: string, details: string) => void;
}

/**
 * Modal de validação e aceite formal de intervenção predial para o perfil `SOLICITANTE`.
 * 
 * Implementa o guardrail de auditoria pública conforme diretrizes da NBR 5674 e Tribunal de Contas:
 * - Permite aprovar o reparo com atribuição de nota (1-5 estrelas) e observações.
 * - Permite contestar a intervenção caso o problema persista ou haja dano/sujeira,
 *   exigindo justificativa mínima de 8 caracteres e reencaminhando a OS para execução.
 */
export function ValidacaoReparoModal({
  isOpen,
  onClose,
  order,
  onConfirmApproval,
  onConfirmDispute,
}: ValidacaoReparoModalProps) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'APROVAR' | 'CONTESTAR'>('APROVAR');
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  
  // Contestação state
  const [disputeReason, setDisputeReason] = useState<string>('Defeito persiste após o teste');
  const [disputeDetails, setDisputeDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen || !order) return null;

  const actorName = user?.nome || 'Profª Maria Clara';
  const unitName = order.predio || user?.predio || 'EMEF Paulo Freire';

  function handleApprove() {
    if (!order) return;
    setIsSubmitting(true);
    try {
      const now = new Date();
      const timeStr = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const logText = feedback.trim() 
        ? `Serviço vistoriado e aprovado com nota ${rating}/5 pela direção da unidade (${actorName}). Observação: "${feedback.trim()}".`
        : `Serviço vistoriado e aprovado com sucesso pela direção da unidade (${actorName}) com nota ${rating}/5.`;

      const updatedHistory: HistoricoItem[] = [
        ...(order.historico || []),
        {
          data: timeStr,
          descricao: logText,
          autor: `${actorName} (Direção da Unidade)`,
          tipo: 'STATUS',
        },
      ];

      const updatedOrder: OrdemServico = {
        ...order,
        status: 'CONCLUIDO',
        concluidoEm: new Date().toISOString(),
        historico: updatedHistory,
      };

      onConfirmApproval(updatedOrder, feedback, rating);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDispute() {
    if (!order) return;
    if (!disputeDetails.trim() || disputeDetails.trim().length < 8) {
      setErrorMessage('Por favor, informe detalhes da inconformidade para a equipe técnica (mínimo de 8 caracteres).');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const timeStr = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const logText = `Contestação registrada pela unidade (${actorName}): Motivo: [${disputeReason}]. Apontamento: "${disputeDetails.trim()}". Chamado retornado para a equipe de campo para saneamento.`;

      const updatedHistory: HistoricoItem[] = [
        ...(order.historico || []),
        {
          data: timeStr,
          descricao: logText,
          autor: `${actorName} (Direção da Unidade)`,
          tipo: 'EXCECAO',
        },
      ];

      // Volta a ordem para EM_EXECUCAO para o técnico sanar
      const updatedOrder: OrdemServico = {
        ...order,
        status: 'EM_EXECUCAO',
        historico: updatedHistory,
      };

      onConfirmDispute(updatedOrder, disputeReason, disputeDetails.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
              activeTab === 'APROVAR' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {activeTab === 'APROVAR' ? <ShieldCheck size={22} /> : <AlertTriangle size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-muted-foreground">{order.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Etapa de Aceite
                </span>
              </div>
              <h2 className="text-base font-bold text-foreground">
                {activeTab === 'APROVAR' ? 'Validação do Reparo pela Unidade' : 'Apontar Pendência ou Contestação'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Resumo do Chamado */}
        <div className="px-6 py-3 bg-muted/20 border-b border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Building2 size={13} className="text-primary shrink-0" />
            <span className="font-bold text-foreground">{unitName}</span>
          </div>
          {order.tecnico && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User size={13} className="text-muted-foreground" />
              <span>Executado por: <strong className="text-foreground">{order.tecnico}</strong></span>
            </div>
          )}
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Card do problema */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">{order.titulo}</h3>
            {order.descricao && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {order.descricao}
              </p>
            )}
          </div>

          {/* Abas de Decisão */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl border border-border">
            <button
              type="button"
              onClick={() => {
                setActiveTab('APROVAR');
                setErrorMessage('');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'APROVAR'
                  ? 'bg-card text-emerald-800 shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ThumbsUp size={14} className={activeTab === 'APROVAR' ? 'text-emerald-700' : ''} />
              <span>Aprovar Reparo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('CONTESTAR');
                setErrorMessage('');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'CONTESTAR'
                  ? 'bg-card text-amber-800 shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <RotateCcw size={14} className={activeTab === 'CONTESTAR' ? 'text-amber-700' : ''} />
              <span>Contestar / Pendência</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'APROVAR' ? (
            /* CONTEÚDO DA APROVAÇÃO */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                  Confirmação de Aceite da Unidade Escolar/Predial
                </p>
                <p className="text-emerald-900/80 leading-relaxed text-[11px]">
                  Ao validar, você declara que a equipe técnica concluiu a intervenção e as instalações estão liberadas para uso normal da unidade.
                </p>
              </div>

              {/* Avaliação por estrelas */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground">
                  Como avalia a qualidade do atendimento e limpeza do local?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      title={`${star} estrela(s)`}
                    >
                      <Star 
                        size={22} 
                        className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} 
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-muted-foreground ml-2">
                    {rating === 5 ? 'Excelente' : rating === 4 ? 'Muito bom' : rating === 3 ? 'Satisfatório' : 'Regular'}
                  </span>
                </div>
              </div>

              {/* Observação / Agradecimento */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-muted-foreground">
                  Observação ou elogio (opcional):
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Ex: Refletores testados e pátio limpo após a troca. Equipe pontual e prestativa."
                  className="w-full p-3 bg-muted/20 border border-border rounded-xl text-xs text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                />
              </div>
            </div>
          ) : (
            /* CONTEÚDO DA CONTESTAÇÃO / RECUSA */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle size={14} className="text-amber-700 shrink-0" />
                  O que impediu a conclusão a contento?
                </p>
                <p className="text-amber-900/80 leading-relaxed text-[11px]">
                  O chamado retornará para a etapa <strong>Em Campo</strong> e a Central de Zeladoria será informada da pendência para cobrar o técnico responsável.
                </p>
              </div>

              {/* Motivo da recusa */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  Tipo de inconformidade detectada:
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                >
                  <option value="Defeito persiste após o teste">Defeito persiste após o teste / Problema não foi resolvido</option>
                  <option value="Serviço incompleto ou peças pendentes">Serviço incompleto / Deixou peças ou acabamentos pendentes</option>
                  <option value="Sujeira, entulho ou resíduos deixados no local">Sujeira, entulho ou área de aula/atendimento sem limpeza</option>
                  <option value="Dano colateral provocado em outra instalação">Dano colateral provocado em outra instalação do prédio</option>
                  <option value="Equipe ausente / Técnico não compareceu">Equipe técnica não esteve na unidade para executar</option>
                </select>
              </div>

              {/* Detalhamento obrigatório */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  Detalhamento da pendência * (visível para o técnico e gestão):
                </label>
                <textarea
                  rows={3}
                  value={disputeDetails}
                  onChange={(e) => {
                    setDisputeDetails(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Descreva exatamente o que foi verificado. Ex: Ao ligar o interruptor do pátio, 2 refletores novos não acendem e há fiação solta próxima à calha."
                  className="w-full p-3 bg-muted/20 border border-border rounded-xl text-xs text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  Mínimo de 8 caracteres. Esse registro constará no relatório de auditoria municipal.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold px-4 cursor-pointer"
          >
            Cancelar
          </Button>

          {activeTab === 'APROVAR' ? (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-5 h-9 shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={15} />
              )}
              <span>Validar e Aprovar Serviço</span>
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleDispute}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold px-5 h-9 shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RotateCcw size={15} />
              )}
              <span>Registrar Contestação</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
