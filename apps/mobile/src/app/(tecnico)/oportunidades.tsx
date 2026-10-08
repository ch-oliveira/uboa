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
import { apiClient } from '../../services/api-client';
import { useAuthStore } from '../../stores/auth-store';
import { OportunidadeProximidade } from '../../types/domain';
import { Palette, Shadows, Radius } from '../../theme/tokens';
import {
  MapPin,
  Navigation,
  Plus,
  Check,
  Zap,
  Sparkles,
  Inbox,
} from 'lucide-react-native';

export default function OportunidadesScreen() {
  const { token } = useAuthStore();
  const [oportunidades, setOportunidades] = useState<OportunidadeProximidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assumidos, setAssumidos] = useState<Record<string, boolean>>({});
  const [assumindoId, setAssumindoId] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient.getOportunidadesProximidade(undefined, token);
      setOportunidades(data);
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Falha ao buscar oportunidades na região.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAssumir = (op: OportunidadeProximidade) => {
    Alert.alert(
      'Incluir na Rota de Hoje?',
      `Deseja adicionar a ordem "${op.titulo}" na unidade "${op.predioNome}" (${op.distanciaKm} km)? Esta ordem será atribuída a você no sistema municipal.`,
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Confirmar e Adicionar',
          onPress: async () => {
            setAssumindoId(op.osId);
            try {
              await apiClient.assumirOrdem(op.osId, token);
              setAssumidos((prev) => ({ ...prev, [op.osId]: true }));
              Alert.alert(
                'Ordem Atribuída com Sucesso!',
                'O chamado foi incluído na sua lista de atendimento e registrado na auditoria.',
              );
            } catch (err: any) {
              Alert.alert('Falha ao Assumir', err?.message || 'Não foi possível assumir esta OS.');
            } finally {
              setAssumindoId(null);
            }
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
              carregar();
            }}
            tintColor={Palette.accent}
          />
        }
      >
        {/* Banner de Roteamento Inteligente */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Sparkles size={20} color={Palette.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Otimização de Rota por Proximidade</Text>
            <Text style={styles.bannerDesc}>
              Chamados abertos compatíveis com sua especialidade próximos ao seu local de atendimento.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chamados Compatíveis na Região</Text>
          <Text style={styles.sectionCount}>{oportunidades.length} disponíveis</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Palette.accent} size="large" />
            <Text style={styles.loadingText}>Localizando chamados compatíveis na API...</Text>
          </View>
        ) : oportunidades.length === 0 ? (
          <View style={styles.emptyCard}>
            <Inbox size={40} color={Palette.textDisabled} />
            <Text style={styles.emptyTitle}>Nenhuma oportunidade próxima no momento</Text>
            <Text style={styles.emptyDesc}>
              Não foram encontrados chamados compatíveis abertos no raio de atendimento deste local.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {oportunidades.map((op) => {
              const jaAssumido = assumidos[op.osId];
              const isProcessing = assumindoId === op.osId;

              return (
                <View key={op.osId} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.distanceBadge}>
                      <Navigation size={12} color={Palette.accent} />
                      <Text style={styles.distanceText}>a {op.distanciaKm} km daqui</Text>
                    </View>

                    <View style={styles.matchBadge}>
                      <Zap size={12} color={Palette.sucesso.badge} />
                      <Text style={styles.matchText}>
                        {op.compatibilidade === 'EXATA' ? 'Especialidade Compatível' : 'Manutenção Geral'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.codeText}>{op.codigo}</Text>
                  <Text style={styles.titleText}>{op.titulo}</Text>

                  <View style={styles.unitRow}>
                    <MapPin size={14} color={Palette.textMuted} />
                    <Text style={styles.unitText}>{op.predioNome}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.actionBtn, jaAssumido && styles.actionBtnDone]}
                    onPress={() => !jaAssumido && handleAssumir(op)}
                    disabled={jaAssumido || isProcessing}
                    activeOpacity={0.8}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : jaAssumido ? (
                      <>
                        <Check size={16} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>Adicionado à Rota de Hoje</Text>
                      </>
                    ) : (
                      <>
                        <Plus size={16} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>Puxar para Minha Rota</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Palette.accentSubtle,
    borderWidth: 1,
    borderColor: Palette.info.border,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 20,
    ...Shadows.card,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    color: Palette.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  bannerDesc: {
    color: Palette.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
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
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    color: Palette.textSecondary,
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 8,
    marginTop: 12,
  },
  emptyTitle: {
    color: Palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyDesc: {
    color: Palette.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  list: {
    gap: 14,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.info.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  distanceText: {
    color: Palette.info.text,
    fontSize: 11,
    fontWeight: '700',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.sucesso.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  matchText: {
    color: Palette.sucesso.text,
    fontSize: 11,
    fontWeight: '700',
  },
  codeText: {
    color: Palette.textMuted,
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  titleText: {
    color: Palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  unitText: {
    color: Palette.textSecondary,
    fontSize: 13,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.accent,
    borderRadius: Radius.md,
    paddingVertical: 12,
    ...Shadows.card,
  },
  actionBtnDone: {
    backgroundColor: Palette.sucesso.badge,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
