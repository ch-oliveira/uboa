'use client';

import { useState, useEffect, useRef } from 'react';
import { OrdemServico } from '@/app/kanban/data';
import { analyzeTriageUrbi, UrbiTriageResult } from '@/lib/triage-engine';
import { apiClient } from '@/lib/api-client';

export type TriageSource = 'local' | 'loading' | 'gemini' | 'fallback';

export interface SemanticTriageState {
  triage: UrbiTriageResult;
  source: TriageSource;
  confidence: 'ALTA' | 'MEDIA' | 'BAIXA' | null;
  isAnalyzing: boolean;
  isDone: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Cache de sessão (módulo singleton — persiste entre re-renders e re-mounts)
// Chave: fingerprint do chamado. Valor: resultado semântico já resolvido.
// Evita chamar a API para o mesmo chamado duas vezes enquanto o browser estiver aberto.
// ---------------------------------------------------------------------------
const triageCache = new Map<string, {
  triage: UrbiTriageResult;
  confidence: 'ALTA' | 'MEDIA' | 'BAIXA';
}>();

// In-flight: evita duas requisições simultâneas para o mesmo fingerprint
// (React Strict Mode monta/desmonta/remonta o componente em dev)
const inFlight = new Map<string, Promise<void>>();

function buildFingerprint(order: Partial<OrdemServico>): string {
  // Usa campos estáveis e semanticamente relevantes, incluindo quantidade de fotos anexadas.
  return [
    order.id ?? '',
    (order.titulo ?? '').trim(),
    (order.descricao ?? '').trim().slice(0, 200), // cap para evitar chaves gigantes
    (order.predio ?? '').trim(),
    String(order.fotos?.length ?? 0),
  ].join('\x00'); // null-byte como separador (nunca aparece em texto normal)
}

/**
 * useUrbiSemanticTriage
 *
 * Otimizações de latência:
 * 1. Cache de módulo → mesmo chamado reaberto retorna instantaneamente
 * 2. in-flight dedup → React StrictMode / múltiplos renders nunca disparam 2x
 * 3. Debounce de 250ms → aguarda objeto do chamado estabilizar antes de chamar API
 * 4. fingerprint estável → campos dinâmicos (historico, status) não re-disparam
 * 5. Guard de valor vazio → não dispara se titulo/predio ainda não chegaram
 */
export function useUrbiSemanticTriage(order: Partial<OrdemServico>): SemanticTriageState {
  const localTriage = analyzeTriageUrbi(order);

  const [state, setState] = useState<SemanticTriageState>(() => {
    // Inicialização preguiçosa: se o cache já tiver o resultado, começa com ele
    const fp = buildFingerprint(order);
    const cached = triageCache.get(fp);
    if (cached) {
      return {
        triage: cached.triage,
        source: 'gemini',
        confidence: cached.confidence,
        isAnalyzing: false,
        isDone: true,
        error: null,
      };
    }
    return {
      triage: localTriage,
      source: 'local',
      confidence: null,
      isAnalyzing: false,
      isDone: false,
      error: null,
    };
  });

  const lastFpRef = useRef<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    // Guard: espera o objeto ter campos mínimos antes de qualquer coisa
    if (!order.titulo?.trim() || !order.predio?.trim()) return;

    const fp = buildFingerprint(order);

    // 1. Cache hit → sem loading, sem API call
    const cached = triageCache.get(fp);
    if (cached) {
      if (lastFpRef.current !== fp) {
        lastFpRef.current = fp;
        setState({
          triage: cached.triage,
          source: 'gemini',
          confidence: cached.confidence,
          isAnalyzing: false,
          isDone: true,
          error: null,
        });
      }
      return;
    }

    // 2. Fingerprint idêntico já está sendo processado ou foi processado
    if (lastFpRef.current === fp) return;

    // 3. Debounce: aguarda 250ms de estabilidade dos campos antes de disparar
    //    Cancela o timer anterior se os campos ainda estiverem mudando
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;

      // Re-verifica após o debounce (pode ter chegado ao cache nesse intervalo)
      const cachedNow = triageCache.get(fp);
      if (cachedNow) {
        lastFpRef.current = fp;
        if (mountedRef.current) {
          setState({
            triage: cachedNow.triage,
            source: 'gemini',
            confidence: cachedNow.confidence,
            isAnalyzing: false,
            isDone: true,
            error: null,
          });
        }
        return;
      }

      lastFpRef.current = fp;

      // 4. In-flight dedup: se já existe uma Promise ativa para este fingerprint,
      //    apenas assiste o resultado sem lançar nova requisição
      if (inFlight.has(fp)) {
        setState((prev) => ({ ...prev, source: 'loading', isAnalyzing: true, isDone: false }));
        await inFlight.get(fp);
        const resolved = triageCache.get(fp);
        if (resolved && mountedRef.current) {
          setState({
            triage: resolved.triage,
            source: 'gemini',
            confidence: resolved.confidence,
            isAnalyzing: false,
            isDone: true,
            error: null,
          });
        }
        return;
      }

      // 5. Mostra loading state com resultado local como placeholder
      const fresh = analyzeTriageUrbi(order);
      if (mountedRef.current) {
        setState({
          triage: fresh,
          source: 'loading',
          confidence: null,
          isAnalyzing: true,
          isDone: false,
          error: null,
        });
      }

      // 6. Lança a requisição e registra em in-flight
      let resolveInflight!: () => void;
      const promise = new Promise<void>((res) => { resolveInflight = res; });
      inFlight.set(fp, promise);

      try {
        const result = await apiClient.sendAiTriage({
          titulo: order.titulo!,
          descricao: order.descricao,
          predio: order.predio!,
          prioridade: order.prioridade,
          categoria: order.categoria,
          localizacao: order.localizacao,
          fotos: order.fotos,
        });

        if (result.success && result.provider === 'gemini') {
          const semantic: UrbiTriageResult = {
            suggestedPriority: result.suggestedPriority,
            requerConfirmacao: result.requerConfirmacao,
            dadosInformados: result.dadosInformados,
            possivelImpacto: result.possivelImpacto,
            perguntasEmAberto: result.perguntasEmAberto,
            criteriosMatriz: result.criteriosMatriz as UrbiTriageResult['criteriosMatriz'],
            fundamentacaoTecnica: result.fundamentacaoTecnica,
          };

          // Salva no cache antes de atualizar o estado
          triageCache.set(fp, { triage: semantic, confidence: result.confidence });

          if (mountedRef.current) {
            setState({
              triage: semantic,
              source: 'gemini',
              confidence: result.confidence,
              isAnalyzing: false,
              isDone: true,
              error: null,
            });
          }
        } else {
          if (mountedRef.current) {
            setState((prev) => ({
              ...prev,
              source: 'fallback',
              isAnalyzing: false,
              isDone: true,
              error: result.error || 'Motor semântico indisponível.',
            }));
          }
        }
      } catch {
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            source: 'fallback',
            isAnalyzing: false,
            isDone: true,
            error: 'Falha de conexão com o backend.',
          }));
        }
      } finally {
        inFlight.delete(fp);
        resolveInflight();
      }
    }, 250); // 250ms de debounce — campo estabiliza antes de chamar a API

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id, order.titulo, order.descricao, order.predio, order.prioridade]);

  return state;
}

/** Limpa o cache de sessão (útil após salvar alterações no chamado) */
export function invalidateTriageCache(orderId?: string) {
  if (orderId) {
    for (const key of triageCache.keys()) {
      if (key.startsWith(orderId + '\x00') || key.startsWith('\x00' + orderId)) {
        triageCache.delete(key);
      }
    }
  } else {
    triageCache.clear();
  }
}
