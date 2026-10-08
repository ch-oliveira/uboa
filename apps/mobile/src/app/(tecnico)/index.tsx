import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { useNetworkStore } from '../../stores/network-store';
import { apiClient } from '../../services/api-client';
import { sqliteService } from '../../database/sqlite-service';
import { OrdemServicoItem, OportunidadeProximidade } from '../../types/domain';
import { Palette, Shadows, Radius } from '../../theme/tokens';
import {
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Circle,
  Pause,
  Inbox,
  AlertTriangle,
  CheckCircle2,
  Play,
} from 'lucide-react-native';

type TipoFiltro = 'URGENTES' | 'EXECUCAO' | 'TODAS' | 'CONCLUIDAS';

function ordenarOrdens(lista: OrdemServicoItem[]): OrdemServicoItem[] {
  const statusWeight: Record<string, number> = {
    EM_EXECUCAO: 1, // Em atendimento primeiro absoluto
    AGUARDANDO: 2,  // Pausado
    EM_TRIAGEM: 3,  // Em triagem
    RECEBIDO: 4,    // Recebido
    AGENDADO: 5,    // Agendado
    CONCLUIDO: 10,  // Concluído no final
    CANCELADO: 11,  // Cancelado no final
  };

  const priorityWeight: Record<string, number> = {
    URGENTE: 1,
    ALTA: 2,
    MEDIA: 3,
    BAIXA: 4,
  };

  return [...lista].sort((a, b) => {
    // 1. Concluídas e Canceladas sempre no fim da exibição
    const aFinalizada = a.status === 'CONCLUIDO' || a.status === 'CANCELADO';
    const bFinalizada = b.status === 'CONCLUIDO' || b.status === 'CANCELADO';
    if (aFinalizada && !bFinalizada) return 1;
    if (!aFinalizada && bFinalizada) return -1;

    // 2. Quem está em atendimento no momento vem no topo
    const sA = statusWeight[a.status] || 99;
    const sB = statusWeight[b.status] || 99;
    if (sA !== sB) return sA - sB;

    // 3. Prioridade operacional (URGENTE > ALTA > MEDIA > BAIXA)
    const pA = priorityWeight[a.prioridade] || 99;
    const pB = priorityWeight[b.prioridade] || 99;
    if (pA !== pB) return pA - pB;

    // 4. Data de abertura mais recente
    return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
  });
}

export default function TecnicoHomeScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  // Urgentes é a primeira aba conforme especificação de fluxo
  const [filtro, setFiltro] = useState<TipoFiltro>('URGENTES');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ordens, setOrdens] = useState<OrdemServicoItem[]>([]);
  const [oportunidades, setOportunidades] = useState<OportunidadeProximidade[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Tentar carregar do cache SQLite primeiro
      try {
        const cache = sqliteService.obterOrdensCache();
        if (cache.length > 0) {
          setOrdens(ordenarOrdens(cache));
        }
      } catch {}

      // 2. Buscar da API real com Token Bearer
      const remotas = await apiClient.getOrdensTecnico(token);
      const ordenadas = ordenarOrdens(remotas);
      setOrdens(ordenadas);

      try {
        sqliteService.salvarOrdensCache(ordenadas);
      } catch {}

      // 3. Buscar oportunidades na região da API real
      try {
        const ops = await apiClient.getOportunidadesProximidade(undefined, token);
        setOportunidades(ops);
      } catch {}
    } catch {
      // Se offline ou falha de rede, mantém o cache local
      try {
        const cache = sqliteService.obterOrdensCache();
        setOrdens(ordenarOrdens(cache));
      } catch {}
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Contagens para badges nas pílulas de filtro
  const countUrgentes = ordens.filter(
    (o) => (o.prioridade === 'URGENTE' || o.prioridade === 'ALTA') && o.status !== 'CONCLUIDO' && o.status !== 'CANCELADO',
  ).length;
  const countExecucao = ordens.filter((o) => o.status === 'EM_EXECUCAO').length;
  const countAtivas = ordens.filter((o) => o.status !== 'CONCLUIDO' && o.status !== 'CANCELADO').length;
  const countConcluidas = ordens.filter((o) => o.status === 'CONCLUIDO').length;

  const ordensFiltradas = ordens.filter((o) => {
    if (filtro === 'URGENTES') {
      return (o.prioridade === 'URGENTE' || o.prioridade === 'ALTA') && o.status !== 'CONCLUIDO' && o.status !== 'CANCELADO';
    }
    if (filtro === 'EXECUCAO') {
      return o.status === 'EM_EXECUCAO';
    }
    if (filtro === 'CONCLUIDAS') {
      return o.status === 'CONCLUIDO';
    }
    // 'TODAS': exibe todos os chamados (ativos primeiro, concluídos no fim graças à ordenação)
    return true;
  });

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'URGENTE':
        return Palette.urgente;
      case 'ALTA':
        return Palette.alta;
      default:
        return Palette.info;
    }
  };

  const formatarSla = (slaDate?: string | null) => {
    if (!slaDate) return null;
    const diffMs = new Date(slaDate).getTime() - Date.now();
    if (diffMs <= 0) return 'SLA Expirado';
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `SLA: ${hours}h ${minutes}m`;
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              carregarDados();
            }}
            tintColor={Palette.accent}
          />
        }
      >
        {/* Header Limpo: Saudação e Resumo sem poluição visual */}
        <View style={styles.headerBar}>
          <Text style={styles.greetingTitle}>Olá, {user?.nome?.split(' ')[0] || 'Técnico'}</Text>
          <Text style={styles.greetingSub}>
            {user?.especialidade || 'Manutenção'} • {countAtivas} {countAtivas === 1 ? 'chamado pendente' : 'chamados pendentes'} hoje
          </Text>
        </View>

        {/* CARD SPOTLIGHT: Chamados Próximos na Região por Proximidade */}
        {oportunidades.length > 0 ? (
          <TouchableOpacity
            style={styles.spotlightCard}
            onPress={() => router.push('/(tecnico)/oportunidades')}
            activeOpacity={0.88}
          >
            <View style={styles.spotlightIconWrap}>
              <Sparkles size={20} color={Palette.accent} />
            </View>
            <View style={styles.spotlightContent}>
              <View style={styles.spotlightBadgeRow}>
                <Text style={styles.spotlightBadge}>ROTA INTELIGENTE</Text>
                <Text style={styles.spotlightDistance}>
                  {oportunidades[0]?.distanciaKm || 1.2} km de distância
                </Text>
              </View>
              <Text style={styles.spotlightTitle}>
                {oportunidades.length} Ocorrência{oportunidades.length > 1 ? 's' : ''} na Região
              </Text>
              <Text style={styles.spotlightDesc} numberOfLines={2}>
                {oportunidades[0]?.titulo} na unidade {oportunidades[0]?.predioNome}. Deseja incluir
                na rota?
              </Text>
            </View>
            <ChevronRight size={18} color={Palette.accent} />
          </TouchableOpacity>
        ) : null}

        {/* ABAS / PÍLULAS DE FILTRO: URGENTES É A PRIMEIRA ABA */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {/* 1. ABA URGENTES */}
          <TouchableOpacity
            style={[styles.filterPill, filtro === 'URGENTES' && styles.filterPillActiveUrgente]}
            onPress={() => setFiltro('URGENTES')}
            activeOpacity={0.7}
          >
            <AlertTriangle
              size={13}
              color={filtro === 'URGENTES' ? '#FFFFFF' : Palette.urgente.text}
            />
            <Text
              style={[
                styles.filterPillText,
                filtro === 'URGENTES' ? styles.filterPillTextActive : { color: Palette.urgente.text },
              ]}
            >
              Urgentes ({countUrgentes})
            </Text>
          </TouchableOpacity>

          {/* 2. ABA EM ATENDIMENTO */}
          <TouchableOpacity
            style={[styles.filterPill, filtro === 'EXECUCAO' && styles.filterPillActive]}
            onPress={() => setFiltro('EXECUCAO')}
            activeOpacity={0.7}
          >
            <Play
              size={12}
              color={filtro === 'EXECUCAO' ? '#FFFFFF' : Palette.sucesso.text}
            />
            <Text
              style={[
                styles.filterPillText,
                filtro === 'EXECUCAO' ? styles.filterPillTextActive : { color: Palette.sucesso.text },
              ]}
            >
              Em Atendimento ({countExecucao})
            </Text>
          </TouchableOpacity>

          {/* 3. ABA TODOS */}
          <TouchableOpacity
            style={[styles.filterPill, filtro === 'TODAS' && styles.filterPillActive]}
            onPress={() => setFiltro('TODAS')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.filterPillText, filtro === 'TODAS' && styles.filterPillTextActive]}
            >
              Todos ({countAtivas})
            </Text>
          </TouchableOpacity>

          {/* 4. ABA CONCLUÍDOS */}
          <TouchableOpacity
            style={[styles.filterPill, filtro === 'CONCLUIDAS' && styles.filterPillActive]}
            onPress={() => setFiltro('CONCLUIDAS')}
            activeOpacity={0.7}
          >
            <CheckCircle2
              size={12}
              color={filtro === 'CONCLUIDAS' ? '#FFFFFF' : Palette.textMuted}
            />
            <Text
              style={[
                styles.filterPillText,
                filtro === 'CONCLUIDAS' && styles.filterPillTextActive,
              ]}
            >
              Concluídos ({countConcluidas})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Lista de Chamados Reais */}
        {loading && ordens.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Palette.accent} size="large" />
            <Text style={styles.loadingText}>Carregando chamados...</Text>
          </View>
        ) : ordensFiltradas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Inbox size={40} color={Palette.textDisabled} />
            <Text style={styles.emptyTitle}>
              {filtro === 'URGENTES'
                ? 'Nenhum chamado urgente pendente'
                : filtro === 'EXECUCAO'
                  ? 'Nenhum chamado em atendimento agora'
                  : filtro === 'CONCLUIDAS'
                    ? 'Nenhum chamado concluído ainda'
                    : 'Nenhum chamado pendente'}
            </Text>
            <Text style={styles.emptyDesc}>
              {filtro === 'URGENTES'
                ? 'Todas as ocorrências de alta prioridade estão controladas ou já foram finalizadas.'
                : filtro === 'EXECUCAO'
                  ? 'Selecione um chamado da lista para iniciar seu atendimento no local.'
                  : filtro === 'CONCLUIDAS'
                    ? 'Os chamados finalizados com laudo e fotos aparecerão aqui.'
                    : 'Você está com todos os atendimentos da sua escala em dia.'}
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {ordensFiltradas.map((item) => {
              const pStyle = getPriorityStyle(item.prioridade);
              const isEmExecucao = item.status === 'EM_EXECUCAO';
              const isPausado = item.status === 'AGUARDANDO';
              const isConcluido = item.status === 'CONCLUIDO';
              const slaFormatado = formatarSla(item.data_limite_sla);
              const codigoLimpo = item.codigo ? item.codigo.replace(/^OS-/, '') : item.id.slice(0, 6);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.orderCard,
                    isEmExecucao && styles.orderCardActive,
                    isConcluido && styles.orderCardCompleted,
                  ]}
                  onPress={() => router.push(`/(tecnico)/os/${item.id}`)}
                  activeOpacity={0.8}
                >
                  {/* Linha de Tags: Prioridade e Status */}
                  <View style={styles.tagsRow}>
                    <View
                      style={[
                        styles.tagBadge,
                        { backgroundColor: pStyle.bg, borderColor: pStyle.border },
                      ]}
                    >
                      <Text style={[styles.tagBadgeText, { color: pStyle.text }]}>
                        {item.prioridade}
                      </Text>
                    </View>

                    {slaFormatado && !isConcluido ? (
                      <View style={styles.slaBadge}>
                        <Clock size={11} color={Palette.textSecondary} />
                        <Text style={styles.slaText}>{slaFormatado}</Text>
                      </View>
                    ) : null}

                    {isEmExecucao ? (
                      <View style={styles.executingChip}>
                        <Circle size={6} fill={Palette.sucesso.badge} color={Palette.sucesso.badge} />
                        <Text style={styles.executingChipText}>Em Andamento</Text>
                      </View>
                    ) : isPausado ? (
                      <View style={styles.pausedChip}>
                        <Pause size={10} color={Palette.alta.text} />
                        <Text style={styles.pausedChipText}>Pausado</Text>
                      </View>
                    ) : isConcluido ? (
                      <View style={styles.completedChip}>
                        <CheckCircle2 size={11} color={Palette.sucesso.text} />
                        <Text style={styles.completedChipText}>Concluído</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Título do Chamado */}
                  <Text style={styles.cardTitle}>{item.titulo}</Text>

                  {/* Descrição com espaçamento e legibilidade */}
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.descricao || 'Sem descrição cadastrada.'}
                  </Text>

                  {/* Rodapé do Card: Localização e Código com divisor sutil */}
                  <View style={styles.cardFooter}>
                    <View style={styles.locationWrap}>
                      <MapPin size={13} color={Palette.textMuted} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {item.predio?.nome || 'Unidade Municipal'}
                      </Text>
                    </View>

                    <View style={styles.codeWrap}>
                      <Text style={styles.codeText}>Chamado #{codigoLimpo}</Text>
                      <ChevronRight size={13} color={Palette.textDisabled} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerBar: {
    marginBottom: 20,
  },
  greetingTitle: {
    color: Palette.primary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  greetingSub: {
    color: Palette.textSecondary,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '400',
  },
  spotlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.accentSubtle,
    borderWidth: 1,
    borderColor: Palette.info.border,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 22,
    gap: 14,
    ...Shadows.card,
  },
  spotlightIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightContent: {
    flex: 1,
  },
  spotlightBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  spotlightBadge: {
    color: Palette.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  spotlightDistance: {
    color: Palette.textMuted,
    fontSize: 11,
  },
  spotlightTitle: {
    color: Palette.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  spotlightDesc: {
    color: Palette.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    paddingRight: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  filterPillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  filterPillActiveUrgente: {
    backgroundColor: Palette.urgente.text,
    borderColor: Palette.urgente.text,
  },
  filterPillText: {
    color: Palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    color: Palette.textSecondary,
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 8,
    marginTop: 12,
  },
  emptyTitle: {
    color: Palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyDesc: {
    color: Palette.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadows.card,
  },
  orderCardActive: {
    borderColor: Palette.sucesso.badge,
    borderWidth: 1.5,
  },
  orderCardCompleted: {
    opacity: 0.72,
    backgroundColor: Palette.surfaceSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  slaText: {
    color: Palette.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  executingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.sucesso.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginLeft: 'auto',
  },
  executingChipText: {
    color: Palette.sucesso.text,
    fontSize: 11,
    fontWeight: '700',
  },
  pausedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.alta.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginLeft: 'auto',
  },
  pausedChipText: {
    color: Palette.alta.text,
    fontSize: 11,
    fontWeight: '700',
  },
  completedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.sucesso.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginLeft: 'auto',
  },
  completedChipText: {
    color: Palette.sucesso.text,
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    color: Palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 22,
    marginBottom: 6,
  },
  cardDesc: {
    color: Palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationText: {
    color: Palette.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  codeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  codeText: {
    color: Palette.accent,
    fontSize: 12,
    fontWeight: '700',
  },
});
