'use client';

import React, { useState } from 'react';
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PREDIOS, TECNICOS, type OrdemServico, type Prioridade, type StatusOS } from './data';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (order: OrdemServico) => void | Promise<any>;
  defaultPredio?: string;
  defaultSolicitante?: string;
}

export function NewOrderModal({ isOpen, onClose, onCreate, defaultPredio, defaultSolicitante }: Props) {
  const [titulo, setTitulo] = useState('');
  const [predio, setPredio] = useState<string>(defaultPredio || PREDIOS[0] || 'EMEF Paulo Freire');
  const [prioridade, setPrioridade] = useState<Prioridade>('MEDIA');
  const [status, setStatus] = useState<StatusOS>('TRIAGEM');
  const [solicitante, setSolicitante] = useState(defaultSolicitante || 'Mariana Alves');
  const [tecnico, setTecnico] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (defaultPredio) setPredio(defaultPredio);
      if (defaultSolicitante) setSolicitante(defaultSolicitante);
      setIsSubmitting(false);
    }
  }, [isOpen, defaultPredio, defaultSolicitante]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('Por favor, informe o título do chamado.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const randomId = `OS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const formattedDate = `${now.getDate()} Set, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: OrdemServico = {
      id: randomId,
      titulo: titulo.trim(),
      predio: predio || PREDIOS[0] || 'EMEF Paulo Freire',
      prioridade,
      status,
      dataAbertura: formattedDate,
      solicitante: solicitante.trim() || 'Gestão Municipal',
      tecnico: tecnico || undefined,
      descricao: descricao.trim() || undefined,
      historico: [
        {
          data: formattedDate,
          descricao: 'Chamado criado no painel da gestão.',
          autor: solicitante.trim() || 'Gestão Municipal',
        },
      ],
    };

    try {
      await onCreate(newOrder);
      setTitulo('');
      setDescricao('');
      setError('');
      onClose();
    } catch {
      setError('Ocorreu um erro ao registrar o chamado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1D6FEB]/10 flex items-center justify-center text-[#1D6FEB]">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">Novo Chamado de Manutenção</h2>
              <p className="text-xs text-slate-400">Preencha os dados para registrar a solicitação</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Título do Chamado *
            </label>
            <input
              type="text"
              placeholder="Ex: Vazamento no sanitário térreo"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 focus:border-[#1D6FEB] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Prédio / Unidade */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Unidade / Prédio *
            </label>
            <select
              value={predio}
              onChange={(e) => setPredio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 focus:border-[#1D6FEB] focus:bg-white transition-all font-medium cursor-pointer"
            >
              {PREDIOS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Grid: Prioridade e Coluna Inicial */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Prioridade
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 focus:border-[#1D6FEB] focus:bg-white transition-all font-medium cursor-pointer"
              >
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Coluna Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusOS)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 focus:border-[#1D6FEB] focus:bg-white transition-all font-medium cursor-pointer"
              >
                <option value="TRIAGEM">Triagem</option>
                <option value="AGENDADO">Agendado</option>
                <option value="EM_EXECUCAO">Em Execução</option>
                <option value="AGUARDANDO">Aguardando Conf.</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </div>
          </div>

          {/* Grid: Solicitante e Técnico */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Solicitante
              </label>
              <input
                type="text"
                value={solicitante}
                onChange={(e) => setSolicitante(e.target.value)}
                placeholder="Nome do solicitante"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 focus:border-[#1D6FEB] focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Designar Técnico
              </label>
              <select
                value={tecnico}
                onChange={(e) => setTecnico(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 focus:border-[#1D6FEB] focus:bg-white transition-all font-medium cursor-pointer"
              >
                <option value="">Nenhum (Pendente)</option>
                {TECNICOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Descrição / Observações
            </label>
            <textarea
              rows={3}
              placeholder="Descreva detalhes como localização exata, sintomas do defeito..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D6FEB]/20 focus:border-[#1D6FEB] focus:bg-white transition-all resize-none font-medium"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl border-slate-200 text-slate-600 font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#1D6FEB] hover:bg-[#1557BA] text-white rounded-xl font-semibold shadow-sm px-5 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Criando chamado...</span>
                </>
              ) : (
                'Criar Chamado'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
