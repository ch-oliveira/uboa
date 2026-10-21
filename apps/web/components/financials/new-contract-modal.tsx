'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  DollarSign, 
  FileText, 
  Building,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import type { ContratoItem } from '@/app/kanban/data';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContractCreated: (contract: ContratoItem) => void;
}

export function NewContractModal({
  isOpen,
  onClose,
  onContractCreated,
}: NewContractModalProps) {
  const [numeroContrato, setNumeroContrato] = useState('');
  const [numeroEmpenho, setNumeroEmpenho] = useState('');
  const [empresaContratada, setEmpresaContratada] = useState('');
  const [cnpjContratada, setCnpjContratada] = useState('');
  const [categoriaPadrao, setCategoriaPadrao] = useState('GERAL');
  const [valorTotalEmpenhado, setValorTotalEmpenhado] = useState<number>(100000);
  const [objeto, setObjeto] = useState('');
  const [vigenciaInicio, setVigenciaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [vigenciaFim, setVigenciaFim] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  function formatBRL(val?: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  }

  function formatCNPJ(value: string) {
    const raw = value.replace(/\D/g, '').slice(0, 14);
    if (raw.length <= 2) return raw;
    if (raw.length <= 5) return `${raw.slice(0, 2)}.${raw.slice(2)}`;
    if (raw.length <= 8) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`;
    if (raw.length <= 12) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8)}`;
    return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!numeroContrato.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Informe o número do contrato administrativo.' });
      return;
    }
    if (!numeroEmpenho.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Informe o número da nota de empenho global.' });
      return;
    }
    if (!empresaContratada.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Informe a razão social da empresa terceirizada.' });
      return;
    }
    if (valorTotalEmpenhado <= 0) {
      setFeedbackMsg({ type: 'error', text: 'O valor empenhado deve ser maior que zero.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await apiClient.createContract({
        numeroContrato: numeroContrato.trim().toUpperCase(),
        numeroEmpenho: numeroEmpenho.trim().toUpperCase(),
        empresaContratada: empresaContratada.trim(),
        cnpjContratada: cnpjContratada.trim() || undefined,
        objeto: objeto.trim() || undefined,
        categoriaPadrao,
        valorTotalEmpenhado: Number(valorTotalEmpenhado),
        vigenciaInicio: vigenciaInicio ? new Date(vigenciaInicio).toISOString() : undefined,
        vigenciaFim: vigenciaFim ? new Date(vigenciaFim).toISOString() : undefined,
      });

      if (res.success && res.contract) {
        onContractCreated(res.contract);
        onClose();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Erro ao cadastrar contrato.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Falha de comunicação ao salvar novo contrato público.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
              <Briefcase size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Novo Contrato de Manutenção</h3>
              <p className="text-[11px] text-slate-400">Termo de contrato e empenho global de manutenção predial</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">

          {feedbackMsg && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              feedbackMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {feedbackMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Linha 1: Número do Contrato e Empenho */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Número do Contrato: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={numeroContrato}
                onChange={(e) => setNumeroContrato(e.target.value)}
                placeholder="Ex: 018/2026"
                className="w-full text-xs font-mono uppercase text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nota de Empenho: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={numeroEmpenho}
                onChange={(e) => setNumeroEmpenho(e.target.value)}
                placeholder="Ex: 2026NE00018"
                className="w-full text-xs font-mono uppercase text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Linha 2: Razão Social e CNPJ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Empresa Terceirizada: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={empresaContratada}
                onChange={(e) => setEmpresaContratada(e.target.value)}
                placeholder="Ex: Alvorada Engenharia Ltda"
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                CNPJ da Contratada:
              </label>
              <input
                type="text"
                value={cnpjContratada}
                onChange={(e) => setCnpjContratada(formatCNPJ(e.target.value))}
                placeholder="00.000.000/0001-00"
                className="w-full text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Linha 3: Categoria e Valor Total */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Especialidade Técnica:
              </label>
              <select
                value={categoriaPadrao}
                onChange={(e) => setCategoriaPadrao(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                <option value="GERAL">Geral / Multidisciplinar</option>
                <option value="ELETRICA">Elétrica</option>
                <option value="HIDRAULICA">Hidráulica</option>
                <option value="ALVENARIA">Obras Civis & Alvenaria</option>
                <option value="PINTURA">Pintura Predial</option>
                <option value="CLIMATIZACAO">Ar Condicionado & AVAC</option>
                <option value="TELHADO">Telhado & Calhas</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Valor Total Empenhado (R$): <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={valorTotalEmpenhado}
                onChange={(e) => setValorTotalEmpenhado(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Linha 4: Vigência Contratual */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Início da Vigência:</label>
              <input
                type="date"
                value={vigenciaInicio}
                onChange={(e) => setVigenciaInicio(e.target.value)}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-mono cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Fim da Vigência:</label>
              <input
                type="date"
                value={vigenciaFim}
                onChange={(e) => setVigenciaFim(e.target.value)}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-mono cursor-pointer"
              />
            </div>
          </div>

          {/* Linha 5: Objeto da Contratação */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Objeto Sucinto da Licitação:
            </label>
            <textarea
              rows={2}
              value={objeto}
              onChange={(e) => setObjeto(e.target.value)}
              placeholder="Ex: Contratação de empresa especializada para prestação de serviços continuados de manutenção preventiva e corretiva predial."
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Prévia do Saldo Inicial */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-medium">Saldo Inicial do Empenho:</span>
            <span className="font-mono font-bold text-emerald-900 text-sm">
              {formatBRL(valorTotalEmpenhado)}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs rounded-xl h-9 px-4 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0A2540] hover:bg-[#07192C] text-white text-xs font-semibold rounded-xl h-9 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Cadastrar Contrato</span>
                </>
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
