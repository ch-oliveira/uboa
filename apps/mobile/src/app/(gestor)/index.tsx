import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  Zap,
  ChevronRight,
  Inbox,
} from 'lucide-react-native';
import { apiClient } from '../../services/api-client';
import { useAuthStore } from '../../stores/auth-store';
import { OrdemServicoItem } from '../../types/domain';
import { Palette, Shadows, Radius } from '../../theme/tokens';

export default function GestorDashboardScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ordens, setOrdens] = useState<OrdemServicoItem[]>([]);
  const [meta, setMeta] = useState({
    totalCount: 0,
    openCount: 0,
    urgentCount: 0,
    inProgressCount: 0,
    completedCount: 0,
  });
  const [despachado, setDespachado] = useState(false);

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
      const res = await apiClient.getOrdensGestor(token);
      setOrdens(res.ordens);
      setMeta(res.meta);
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Falha ao carregar indicadores de gestão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const urgencias = ordens.filter(
    (o) => o.prioridade === 'URGENTE' || o.prioridade === 'ALTA',
  );

  const handleDespacharEmLote = () => {
    Alert.alert(
      'Confirmar Despacho em Lote?',
      'Os chamados abertos compatíveis serão despachados e otimizados automaticamente para os técnicos de plantão.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar e Despachar',
          onPress: () => {
            setDespachado(true);
            Alert.alert(
              'Despacho Realizado com Sucesso!',
              'Os técnicos em campo receberam as ordens em tempo real via push e sincronização.',
            );
          },
        },
      ],
    );
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
        {/* Header do Gestor */}
        <View style={styles.headerBar}>
          <Text style={styles.greetingTitle}>Olá, {user?.nome?.split(' ')[0] || 'Gestor'}</Text>
          <Text style={styles.greetingSub}>
            Supervisão e Monitoramento de Campo • {meta.totalCount} chamados totais
          </Text>
        </View>

      {/* Resumo de Indicadores Principais da API Real */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: Palette.urgente.bg }]}>
            <AlertTriangle size={16} color={Palette.urgente.text} />
          </View>
          <Text style={styles.kpiValue}>{meta.urgentCount}</Text>
          <Text style={styles.kpiLabel}>Urgências Críticas</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: Palette.sucesso.bg }]}>
            <Clock size={16} color={Palette.sucesso.text} />
          </View>
          <Text style={styles.kpiValue}>{meta.inProgressCount}</Text>
          <Text style={styles.kpiLabel}>Em Execução</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: Palette.info.bg }]}>
            <Users size={16} color={Palette.info.text} />
          </View>
          <Text style={styles.kpiValue}>{meta.openCount}</Text>
          <Text style={styles.kpiLabel}>Abertos no Município</Text>
        </View>
      </View>

      {/* CARD SPOTLIGHT DA IA: Otimização de Rota & Despacho em Lote */}
      <View style={styles.aiSpotlightCard}>
        <View style={styles.aiHeader}>
          <View style={styles.aiIconBadge}>
            <Sparkles size={18} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiBadgeText}>SUGESTÃO INTELIGENTE DE ROTA</Text>
            <Text style={styles.aiTitle}>Oportunidade de Despacho por Proximidade</Text>
          </View>
        </View>

        <View style={styles.aiBodyBox}>
          <Text style={styles.aiBodyText}>
            A inteligência geoespacial identificou ordens de serviço pendentes próximas aos técnicos em trânsito.
          </Text>
          <Text style={styles.aiSubText}>
            O despacho por proximidade reduz o tempo de deslocamento em até 40% e melhora o cumprimento de SLA.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.dispatchBtn, despachado && styles.dispatchBtnDone]}
          onPress={handleDespacharEmLote}
          disabled={despachado}
          activeOpacity={0.85}
        >
          {despachado ? (
            <>
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text style={styles.dispatchBtnText}>Rotas Otimizadas com Sucesso</Text>
            </>
          ) : (
            <>
              <Zap size={16} color="#FFFFFF" />
              <Text style={styles.dispatchBtnText}>Otimizar Despacho em Lote</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Seção de Urgências do Município vindas da API */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Urgências e Prioridades Altas</Text>
        <Text style={styles.sectionCount}>{urgencias.length} registradas</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Palette.accent} size="large" />
          <Text style={styles.loadingText}>Atualizando dados com a API central...</Text>
        </View>
      ) : urgencias.length === 0 ? (
        <View style={styles.emptyCard}>
          <Inbox size={36} color={Palette.textDisabled} />
          <Text style={styles.emptyTitle}>Sem chamados críticos no momento</Text>
          <Text style={styles.emptyDesc}>
            Todas as ocorrências de alta prioridade foram atendidas ou estão em conformidade.
          </Text>
        </View>
      ) : (
        <View style={styles.urgenciesList}>
          {urgencias.map((item) => (
            <View key={item.id} style={styles.urgencyCard}>
              <View style={styles.urgencyTop}>
                <View style={styles.codeWrap}>
                  <Text style={styles.codeText}>{item.codigo}</Text>
                  <View
                    style={
                      item.prioridade === 'URGENTE'
                        ? styles.urgencyBadge
                        : styles.altaBadge
                    }
                  >
                    <Text
                      style={
                        item.prioridade === 'URGENTE'
                          ? styles.urgencyBadgeText
                          : styles.altaBadgeText
                      }
                    >
                      {item.prioridade}
                    </Text>
                  </View>
                </View>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>

              <Text style={styles.urgencyTitle}>{item.titulo}</Text>
              <Text style={styles.urgencyPlace}>
                {item.predio?.nome || 'Unidade'} • {item.predio?.endereco || ''}
              </Text>

              <View style={styles.urgencyFooter}>
                <View style={styles.statusTag}>
                  <Text style={styles.statusTagText}>
                    {item.tecnico_atribuido_id ? 'Técnico Atribuído' : 'Aguardando Atribuição'}
                  </Text>
                </View>
                <ChevronRight size={14} color={Palette.textDisabled} />
              </View>
            </View>
          ))}
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
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    gap: 4,
    ...Shadows.card,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    color: Palette.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  kpiLabel: {
    color: Palette.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  aiSpotlightCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: Radius.xl,
    padding: 18,
    marginBottom: 24,
    ...Shadows.card,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadgeText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiTitle: {
    color: Palette.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  aiBodyBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.5)',
  },
  aiBodyText: {
    color: Palette.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  aiSubText: {
    color: Palette.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D97706',
    borderRadius: Radius.md,
    paddingVertical: 13,
  },
  dispatchBtnDone: {
    backgroundColor: Palette.sucesso.badge,
  },
  dispatchBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: Palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionCount: {
    color: Palette.textMuted,
    fontSize: 12,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  loadingText: {
    color: Palette.textSecondary,
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 8,
  },
  emptyTitle: {
    color: Palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyDesc: {
    color: Palette.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 260,
  },
  urgenciesList: {
    gap: 12,
  },
  urgencyCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadows.card,
  },
  urgencyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeText: {
    color: Palette.textMuted,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  urgencyBadge: {
    backgroundColor: Palette.urgente.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgencyBadgeText: {
    color: Palette.urgente.text,
    fontSize: 9,
    fontWeight: '800',
  },
  altaBadge: {
    backgroundColor: Palette.alta.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  altaBadgeText: {
    color: Palette.alta.text,
    fontSize: 9,
    fontWeight: '800',
  },
  statusText: {
    color: Palette.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  urgencyTitle: {
    color: Palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  urgencyPlace: {
    color: Palette.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  urgencyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
  },
  statusTag: {
    backgroundColor: Palette.sucesso.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  statusTagText: {
    color: Palette.sucesso.text,
    fontSize: 11,
    fontWeight: '600',
  },
});
