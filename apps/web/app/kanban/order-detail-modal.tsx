'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Wrench, 
  Trash2, 
  Save, 
  Send,
  Building2,
  AlertTriangle,
  ThumbsUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { COLUMNS, PREDIOS, TECNICOS, type OrdemServico, type Prioridade, type StatusOS } from './data';
import { getPriorityBadge } from '@/lib/badges';

interface Props {
  order: OrdemServico | null;
  onClose: () => void;
  onUpdate: (updatedOrder: OrdemServico) => void | Promise<any>;
  onDelete: (orderId: string) => void | Promise<any>;
}

export function OrderDetailModal({ order, onClose, onUpdate, onDelete }: Props) {
  const { user, role } = useAuth();
  const isSolicitante = role === 'SOLICITANTE';

  const [titulo, setTitulo] = useState('');
  const [predio, setPredio] = useState('');
  const [prioridade, setPrioridade] = useState<Prioridade>('MEDIA');
  const [status, setStatus] = useState<StatusOS>('TRIAGEM');
  const [tecnico, setTecnico] = useState('');
  const [descricao, setDescricao] = useState('');
  const [newComment, setNewComment] = useState('');
  const [historico, setHistorico] = useState<{ data: string; descricao: string; autor: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (order) {
      setTitulo(order.titulo);
      setPredio(order.predio);
      setPrioridade(order.prioridade);
      setStatus(order.status);
      setTecnico(order.tecnico || '');
      setDescricao(order.descricao || '');
      setHistorico(order.historico || []);
      setIsSaving(false);
      setIsValidating(false);
    }
  }, [order]);

  if (!order) return null;

  async function handleSave() {
    if (!order) return;
    setIsSaving(true);
    const updated: OrdemServico = {
      ...order,
      titulo,
      predio,
      prioridade,
      status,
      tecnico: tecnico || undefined,
      descricao: descricao || undefined,
      historico,
    };
    try {
      await onUpdate(updated);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleValidateOrder() {
    if (!order) return;
    setIsValidating(true);
    const now = new Date();
    const formatted = `${now.getDate()} Set, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const validationItem = {
      data: formatted,
      descricao: `Serviço validado e aceito com sucesso pela unidade por ${user?.nome || 'Solicitante'}.`,
      autor: `${user?.nome || 'Solicitante'} (Unidade)`,
    };
    const updated: OrdemServico = {
      ...order,
      status: 'CONCLUIDO',
      historico: [validationItem, ...historico],
    };
    try {
      await onUpdate(updated);
      onClose();
    } finally {
      setIsValidating(false);
    }
  }

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !order) return;

    const now = new Date();
    const formatted = `${now.getDate()} Set, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const authorName = user?.nome ? `${user.nome} (Você)` : 'Mariana Alves (Você)';
    const item = {
      data: formatted,
      descricao: newComment.trim(),
      autor: authorName,
    };

    const newHist = [item, ...historico];
    setHistorico(newHist);
    setNewComment('');

    // Se for solicitante, sincroniza a anotação imediatamente com a ordem
    if (isSolicitante) {
      onUpdate({
        ...order,
        historico: newHist,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold px-2.5 py-1 bg-[#1D6FEB]/10 text-[#1D6FEB] rounded-md tracking-wider">
              {order.id}
            </span>
            <span className="text-xs text-slate-400 font-medium">Aberto em {order.dataAbertura}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Lixeira visível apenas para Gestores e Técnicos */}
            {!isSolicitante && (
              <button
                onClick={() => {
                  if (confirm(`Deseja realmente excluir a ordem ${order.id}?`)) {
                    onDelete(order.id);
                    onClose();
                  }
                }}
                title="Excluir chamado"
                className="text-slate-400 hover:text-red-600 rounded-lg p-1.5 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}

            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Título do Chamado */}
          {isSolicitante ? (
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Título do Chamado
              </span>
              <h2 className="text-xl font-black text-slate-900 leading-snug">
                {order.titulo}
              </h2>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Título do Chamado
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full text-lg font-bold text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-[#1D6FEB] focus:outline-none transition-colors py-1"
              />
            </div>
          )}

          {/* Status da Ordem de Serviço */}
          {isSolicitante ? (
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status do Atendimento
              </span>
              
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                    order.status === 'CONCLUIDO' ? 'bg-emerald-500' :
                    order.status === 'EM_EXECUCAO' ? 'bg-blue-600 animate-pulse' :
                    order.status === 'AGENDADO' ? 'bg-amber-500' :
                    order.status === 'AGUARDANDO' ? 'bg-purple-600' : 'bg-slate-400'
                  }`} />
                  <div>
                    <span className="text-sm font-extrabold text-slate-900">
                      {COLUMNS.find((c) => c.id === order.status)?.title || order.status}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {order.status === 'TRIAGEM' && 'A solicitação está sendo avaliada tecnicamente pela Secretaria de Obras.'}
                      {order.status === 'AGENDADO' && 'A visita técnica foi programada para atendimento na sua unidade.'}
                      {order.status === 'EM_EXECUCAO' && 'A equipe de manutenção está em campo realizando o serviço.'}
                      {order.status === 'AGUARDANDO' && 'O técnico finalizou o reparo e aguarda a conferência e validação da escola.'}
                      {order.status === 'CONCLUIDO' && 'Chamado encerrado e validado com sucesso.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão de aceite para a diretora caso o chamado esteja aguardando validação */}
              {order.status === 'AGUARDANDO' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div>
                    <span className="text-xs font-bold text-purple-900">Validar Conclusão do Reparo</span>
                    <p className="text-[11px] text-purple-700 mt-0.5">
                      O serviço foi concluído pela equipe? Confirme para dar o aceite formal.
                    </p>
                  </div>
                  <Button
                    type="button"
                    disabled={isValidating}
                    onClick={handleValidateOrder}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-9 px-4 shrink-0 shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Validando...</span>
                      </>
                    ) : (
                      <>
                        <ThumbsUp size={14} />
                        <span>Confirmar e Dar Aceite</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Status da Ordem de Serviço
              </label>
              <div className="grid grid-cols-5 gap-2">
                {COLUMNS.map((col) => {
                  const isActive = status === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setStatus(col.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 text-center ${
                        isActive
                          ? 'bg-[#1D6FEB] text-white border-[#1D6FEB] shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : col.dotColor}`} />
                      <span className="truncate w-full">{col.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadados: Unidade, Prioridade, Solicitante e Técnico */}
          {isSolicitante ? (
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <Building2 size={14} className="text-[#1D6FEB]" />
                  Unidade
                </span>
                <span className="text-xs font-bold text-slate-800">{order.predio}</span>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Prioridade
                </span>
                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(order.prioridade)}`}>
                  {order.prioridade}
                </span>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <User size={14} className="text-slate-400" />
                  Solicitante
                </span>
                <span className="text-xs font-bold text-slate-800">{order.solicitante}</span>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <Wrench size={14} className="text-[#1D6FEB]" />
                  Técnico Designado
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {order.tecnico || 'Pendente de escala pela prefeitura'}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <Building2 size={14} className="text-[#1D6FEB]" />
                  Unidade
                </label>
                <select
                  value={predio}
                  onChange={(e) => setPredio(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1D6FEB]"
                >
                  {PREDIOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Prioridade
                </label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1D6FEB]"
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <User size={14} className="text-slate-400" />
                  Solicitante
                </label>
                <div className="text-xs font-bold text-slate-800 py-1">{order.solicitante}</div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <Wrench size={14} className="text-[#1D6FEB]" />
                  Técnico Responsável
                </label>
                <select
                  value={tecnico}
                  onChange={(e) => setTecnico(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1D6FEB]"
                >
                  <option value="">Nenhum (Pendente)</option>
                  {TECNICOS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Descrição do Problema */}
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Descrição do Problema
            </span>
            {isSolicitante ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 leading-relaxed">
                {order.descricao || 'Nenhuma observação detalhada informada.'}
              </div>
            ) : (
              <textarea
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva detalhes adicionais ou instruções de manutenção..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 focus:border-[#1D6FEB] focus:bg-white transition-all resize-none"
              />
            )}
          </div>

          {/* Activity / Comments Timeline */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Linha do Tempo e Apontamentos
            </label>

            {/* Add note input */}
            <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder={isSolicitante ? 'Adicionar observação sobre o local ou atendimento...' : 'Adicionar nota técnica ou observação...'}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1D6FEB] focus:bg-white"
              />
              <Button type="submit" size="sm" className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white rounded-xl h-9 px-3">
                <Send size={14} className="mr-1" />
                Registrar
              </Button>
            </form>

            {/* Timeline list */}
            <div className="space-y-3 border-l-2 border-slate-200 pl-4 ml-2">
              {historico.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum apontamento registrado ainda.</p>
              ) : (
                historico.map((h, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#1D6FEB] ring-4 ring-white" />
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                      <span className="font-bold text-slate-700">{h.autor}</span>
                      <span>{h.data}</span>
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {h.descricao}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          {isSolicitante ? (
            <div className="w-full flex justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-slate-200 text-slate-700 font-bold text-xs px-6 h-9"
              >
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-slate-200 text-slate-600 text-xs"
              >
                Fechar sem salvar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white rounded-xl font-semibold shadow-sm px-6 text-xs h-10 flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
