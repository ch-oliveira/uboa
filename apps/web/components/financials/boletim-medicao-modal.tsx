'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Printer,
  Calendar,
  Percent,
  Package,
  Wrench,
  CheckCircle2,
  Clock,
  Building2,
  Hash,
  Loader2,
  Eye,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import type { ContratoItem } from '@/app/kanban/data';

export interface BoletimMedicaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: ContratoItem | null;
  onBoletimCreated?: () => void;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function formatBRL(val?: number): string {
  return (val || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function BoletimMedicaoModal({
  isOpen,
  onClose,
  contract,
  onBoletimCreated,
}: BoletimMedicaoModalProps) {
  const currentDate = new Date();
  const [mesCompetencia, setMesCompetencia] = useState<number>(currentDate.getMonth() + 1);
  const [anoCompetencia, setAnoCompetencia] = useState<number>(currentDate.getFullYear());
  const [bdiPercentual, setBdiPercentual] = useState<number>(Number(contract?.bdiPadrao || 20));
  const [observacoes, setObservacoes] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'preview' | 'sinapi' | 'historico'>('preview');
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [historicoBoletins, setHistoricoBoletins] = useState<any[]>([]);
  const [isLoadingHistorico, setIsLoadingHistorico] = useState(false);
  const [selectedBoletimParaImpressao, setSelectedBoletimParaImpressao] = useState<any | null>(null);

  useEffect(() => {
    if (contract && isOpen) {
      setBdiPercentual(Number(contract.bdiPadrao || 20));
      loadPreview();
      loadHistorico();
    }
  }, [contract, isOpen, mesCompetencia, anoCompetencia, bdiPercentual]);

  async function loadPreview() {
    if (!contract) return;
    setIsLoadingPreview(true);
    setErrorMessage('');
    try {
      const res = await apiClient.getBoletimPreview(contract.id, {
        mes: mesCompetencia,
        ano: anoCompetencia,
        bdiPercentual,
      });
      if (res?.success && res.data) {
        setPreviewData(res.data);
      } else {
        setErrorMessage(res?.message || 'Erro ao carregar prévia de medição.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha na comunicação com o servidor.');
    } finally {
      setIsLoadingPreview(false);
    }
  }

  async function loadHistorico() {
    if (!contract) return;
    setIsLoadingHistorico(true);
    try {
      const res = await apiClient.getAllBoletins(contract.id);
      if (res?.success && Array.isArray(res.data)) {
        setHistoricoBoletins(res.data);
      }
    } catch {
      // Ignora erro de histórico offline
    } finally {
      setIsLoadingHistorico(false);
    }
  }

  async function handleCreateBoletim() {
    if (!contract) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await apiClient.createBoletim(contract.id, {
        mesCompetencia,
        anoCompetencia,
        bdiPercentual,
        observacoes,
      });
      if (res?.success) {
        setSuccessMessage(`Boletim ${res.data?.numeroBoletim} emitido com sucesso!`);
        await loadPreview();
        await loadHistorico();
        if (onBoletimCreated) onBoletimCreated();
      } else {
        setErrorMessage(res?.message || 'Erro ao consolidar boletim.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao processar medição.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVisualizarImpressao(bmId: string) {
    try {
      const res = await apiClient.getBoletimById(bmId);
      if (res?.success && res.data) {
        setSelectedBoletimParaImpressao(res.data);
      }
    } catch (err: any) {
      alert('Erro ao carregar boletim para impressão: ' + (err?.message || err));
    }
  }

  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-foreground/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="px-5 py-4 border-b border-border/80 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  Boletim de Medição Mensal Consolidado
                </h2>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  SINAPI + BDI
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contrato: <span className="font-semibold text-foreground">{contract.numeroContrato}</span> •{' '}
                Empenho: <span className="font-mono text-foreground">{contract.numeroEmpenho}</span> •{' '}
                <span className="truncate max-w-[250px] inline-block align-bottom">{contract.empresaContratada}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Filtros e Competência */}
        <div className="px-5 py-3 border-b border-border/70 bg-card flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-muted-foreground" />
              <span className="font-semibold text-foreground">Competência:</span>
              <select
                value={mesCompetencia}
                onChange={(e) => setMesCompetencia(Number(e.target.value))}
                className="bg-muted/40 border border-border rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer"
              >
                {MONTHS.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={anoCompetencia}
                onChange={(e) => setAnoCompetencia(Number(e.target.value))}
                className="bg-muted/40 border border-border rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <Percent size={14} className="text-muted-foreground" />
              <span className="font-semibold text-foreground">Taxa BDI:</span>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={bdiPercentual}
                  onChange={(e) => setBdiPercentual(Number(e.target.value))}
                  className="w-16 bg-muted/40 border border-border rounded-l-lg px-2 py-1 text-xs font-mono font-bold text-center"
                />
                <span className="bg-muted border border-l-0 border-border px-2 py-1 rounded-r-lg text-xs font-bold text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Abas */}
          <div className="inline-flex p-1 bg-muted/60 rounded-xl border border-border/70 text-xs gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'preview' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Medição Deste Mês
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sinapi')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'sinapi' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Itens & Peças (SINAPI)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('historico')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'historico' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Boletins Fechados ({historicoBoletins.length})
            </button>
          </div>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {isLoadingPreview ? (
            <div className="py-16 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Loader2 size={24} className="animate-spin text-primary" />
              <span>Consolidando ordens certificadas e apurando taxas de BDI...</span>
            </div>
          ) : activeTab === 'preview' ? (
            <div className="space-y-4">
              {/* Cards de Totais da Medição */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[10px] uppercase font-bold">Materiais (SINAPI)</span>
                    <Package size={14} className="text-blue-600" />
                  </div>
                  <p className="text-base font-bold font-mono text-foreground">
                    {formatBRL(previewData?.valorMateriais)}
                  </p>
                </div>

                <div className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[10px] uppercase font-bold">Mão de Obra</span>
                    <Wrench size={14} className="text-purple-600" />
                  </div>
                  <p className="text-base font-bold font-mono text-foreground">
                    {formatBRL(previewData?.valorMaoDeObra)}
                  </p>
                </div>

                <div className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[10px] uppercase font-bold">BDI ({bdiPercentual}%)</span>
                    <Percent size={14} className="text-amber-600" />
                  </div>
                  <p className="text-base font-bold font-mono text-amber-700 dark:text-amber-400">
                    + {formatBRL(previewData?.valorBdi)}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                    <span className="text-[10px] uppercase font-bold">Total Liquidado</span>
                    <Coins size={14} className="text-emerald-600" />
                  </div>
                  <p className="text-lg font-bold font-mono text-emerald-800 dark:text-emerald-300">
                    {formatBRL(previewData?.valorTotal)}
                  </p>
                </div>
              </div>

              {/* Alerta de Conformidade com o TCE e Lei 14.133 */}
              {previewData?.ordensPendentesCount > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      Atenção Fiscal ({previewData.ordensPendentesCount} ordem(ns) pendente(s) de atesto):
                    </span>{' '}
                    Existem ordens de serviço concluídas neste mês que ainda aguardam o aceite digital do diretor da unidade escolar/saúde.
                    Conforme a Lei Federal 14.133/2021, elas <strong>foram excluídas desta medição</strong> até a regularização do atesto.
                  </div>
                </div>
              )}

              {/* Tabela de Ordens Aprovadas para este Boletim */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground uppercase tracking-wide text-[11px]">
                    Ordens Certificadas no Período ({previewData?.ordensAprovadasCount || 0})
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Saldo remanescente após este boletim: <strong className="font-mono text-foreground">{formatBRL(previewData?.saldoRemanescenteAposBoletim)}</strong>
                  </span>
                </div>

                {previewData?.ordensAprovadas?.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Código</th>
                          <th className="py-2.5 px-3">Unidade / Objeto</th>
                          <th className="py-2.5 px-3">Atestado Por</th>
                          <th className="py-2.5 px-3 text-right">Materiais</th>
                          <th className="py-2.5 px-3 text-right">Mão de Obra</th>
                          <th className="py-2.5 px-3 text-right">Custo Direto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {previewData.ordensAprovadas.map((o: any) => (
                          <tr key={o.id} className="hover:bg-muted/20">
                            <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                              {o.codigo}
                            </td>
                            <td className="py-2.5 px-3">
                              <p className="font-semibold text-foreground truncate max-w-[200px]" title={o.titulo}>
                                {o.titulo}
                              </p>
                              <span className="text-[10px] text-muted-foreground">
                                {o.predioNome}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1 text-[11px] text-emerald-800 dark:text-emerald-400 font-medium">
                                <ShieldCheck size={13} className="shrink-0 text-emerald-600" />
                                <span>{o.atestadoPorNome || 'Diretora da Unidade'}</span>
                              </div>
                              {o.parecerAtesto && (
                                <p className="text-[10px] text-muted-foreground truncate max-w-[180px]" title={o.parecerAtesto}>
                                  "{o.parecerAtesto}"
                                </p>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {formatBRL(o.custoMateriais)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {formatBRL(o.custoMaoDeObra)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                              {formatBRL(o.custoTotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    Nenhuma ordem de serviço com atesto digital aprovado encontrada para a competência selecionada.
                  </div>
                )}
              </div>

              {/* Observações do Fiscal */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-foreground">
                  Parecer Técnico / Observações do Fiscal do Contrato (opcional):
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Medição mensal referente às manutenções corretivas e preventivas executadas conforme cronograma físico-financeiro aprovado."
                  rows={2}
                  className="w-full bg-muted/30 border border-border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          ) : activeTab === 'sinapi' ? (
            /* Tab Itens & Peças Consumidas (SINAPI) */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground uppercase tracking-wide text-[11px]">
                  Consolidado de Peças e Insumos Faturados
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Total: {formatBRL(previewData?.valorMateriais)}
                </span>
              </div>

              {previewData?.materiaisConsolidados?.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Item / Código de Referência</th>
                        <th className="py-2.5 px-3 text-center">Unidade</th>
                        <th className="py-2.5 px-3 text-right">Qtd Consumida</th>
                        <th className="py-2.5 px-3 text-right">Preço Unitário</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {previewData.materiaisConsolidados.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-semibold text-foreground">
                            {item.descricao}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            {item.unidadeMedida}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            {item.quantidade}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {formatBRL(item.precoUnitario)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                            {formatBRL(item.precoTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  Nenhum item de almoxarifado ou peça discriminada nas ordens aprovadas deste período.
                </div>
              )}
            </div>
          ) : (
            /* Tab Histórico de Boletins Emitidos */
            <div className="space-y-3">
              <span className="font-bold text-foreground uppercase tracking-wide text-[11px] block">
                Boletins Oficiais Consolidados para Este Contrato
              </span>

              {isLoadingHistorico ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Carregando histórico de boletins...
                </div>
              ) : historicoBoletins.length > 0 ? (
                <div className="space-y-2">
                  {historicoBoletins.map((bm: any) => (
                    <div
                      key={bm.id}
                      className="p-3.5 bg-muted/20 border border-border/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">
                            {bm.numeroBoletim}
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                            {MONTHS[bm.mesCompetencia - 1]}/{bm.anoCompetencia}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({bm.ordensCount} OSs medidas)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>Fiscal: <strong>{bm.fiscalResponsavel?.nome || 'Fiscal de Obras'}</strong></span>
                          <span>•</span>
                          <span className="font-mono truncate max-w-[220px]" title={bm.hashIntegridade}>
                            Hash: {bm.hashIntegridade?.slice(0, 16)}...
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <span className="text-[10px] text-muted-foreground block uppercase">Valor Total</span>
                          <span className="text-sm font-bold text-foreground">
                            {formatBRL(bm.valorTotal)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleVisualizarImpressao(bm.id)}
                          className="h-8 px-2.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer size={13} />
                          <span>Imprimir</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  Nenhum boletim de medição emitido anteriormente para este contrato.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="px-5 py-3.5 border-t border-border/80 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Auditoria e Liquidação vinculada ao TCE / Lei 14.133</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold rounded-xl h-9 px-4 cursor-pointer"
            >
              Fechar
            </Button>

            <Button
              type="button"
              disabled={isSubmitting || isLoadingPreview || !previewData?.ordensAprovadas?.length}
              onClick={handleCreateBoletim}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl h-9 px-4.5 flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Consolidando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Consolidar e Travar Boletim Oficial</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Visualização de Impressão de Boletim Oficial */}
      {selectedBoletimParaImpressao && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-black p-6 sm:p-8 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wide">
                  Boletim de Medição Oficial — Lei 14.133/21
                </h3>
                <p className="text-xs text-gray-600">
                  Prefeitura Municipal • Secretaria de Obras e Serviços Urbanos
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-emerald-700 text-white rounded-xl text-xs h-8 px-3 flex items-center gap-1"
                >
                  <Printer size={13} />
                  <span>Imprimir</span>
                </Button>
                <button
                  onClick={() => setSelectedBoletimParaImpressao(null)}
                  className="p-1 text-gray-400 hover:text-black rounded"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block">Número do Boletim:</span>
                <strong className="font-mono text-sm">{selectedBoletimParaImpressao.numeroBoletim}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Competência:</span>
                <strong className="text-sm">
                  {MONTHS[selectedBoletimParaImpressao.mesCompetencia - 1]}/{selectedBoletimParaImpressao.anoCompetencia}
                </strong>
              </div>
              <div>
                <span className="text-gray-500 block">Contrato / Empenho:</span>
                <strong className="font-mono">
                  {selectedBoletimParaImpressao.contrato?.numeroContrato} (NE: {selectedBoletimParaImpressao.contrato?.numeroEmpenho})
                </strong>
              </div>
              <div>
                <span className="text-gray-500 block">Empresa Contratada:</span>
                <strong>{selectedBoletimParaImpressao.contrato?.empresaContratada}</strong>
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-100 border-b font-bold text-[11px] text-gray-700">
                  <tr>
                    <th className="py-2 px-3">Código</th>
                    <th className="py-2 px-3">Unidade</th>
                    <th className="py-2 px-3">Atestado Por</th>
                    <th className="py-2 px-3 text-right">Materiais</th>
                    <th className="py-2 px-3 text-right">Mão de Obra</th>
                    <th className="py-2 px-3 text-right">Total Direto</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {selectedBoletimParaImpressao.ordensServico?.map((o: any) => (
                    <tr key={o.id}>
                      <td className="py-2 px-3 font-mono font-bold">{o.codigo}</td>
                      <td className="py-2 px-3">{o.predioNome}</td>
                      <td className="py-2 px-3">{o.atestadoPorNome || 'Diretor(a)'}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatBRL(o.custoMateriais)}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatBRL(o.custoMaoDeObra)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">{formatBRL(o.custoTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4 text-xs">
              <div className="space-y-1">
                <p><strong>Custo Direto:</strong> {formatBRL(selectedBoletimParaImpressao.valorDireto)}</p>
                <p><strong>Taxa BDI:</strong> {selectedBoletimParaImpressao.bdiPercentual}% ({formatBRL(selectedBoletimParaImpressao.valorBdi)})</p>
                <p className="text-sm font-bold text-emerald-800">
                  <strong>Total Liquidado:</strong> {formatBRL(selectedBoletimParaImpressao.valorTotal)}
                </p>
              </div>
              <div className="text-right text-[10px] text-gray-500 font-mono space-y-1">
                <p>Hash SHA-256 de Autenticidade:</p>
                <p className="break-all">{selectedBoletimParaImpressao.hashIntegridade}</p>
              </div>
            </div>

            <div className="border-t pt-6 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t border-gray-400 pt-2">
                <p className="font-bold">{selectedBoletimParaImpressao.fiscalResponsavel?.nome || 'Fiscal do Contrato'}</p>
                <p className="text-gray-500 text-[10px]">Fiscal de Manutenção Predial / Engenharia</p>
              </div>
              <div className="border-t border-gray-400 pt-2">
                <p className="font-bold">{selectedBoletimParaImpressao.contrato?.empresaContratada}</p>
                <p className="text-gray-500 text-[10px]">Responsável Técnico da Empreiteira</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
