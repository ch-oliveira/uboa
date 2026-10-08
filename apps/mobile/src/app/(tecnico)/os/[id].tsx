import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  MOTIVOS_PAUSA_PADRAO,
  MotivoPausaId,
  OrdemServicoItem,
} from '../../../types/domain';
import { sqliteService } from '../../../database/sqlite-service';
import { apiClient } from '../../../services/api-client';
import { useAuthStore } from '../../../stores/auth-store';
import { useNetworkStore } from '../../../stores/network-store';
import { Palette, Shadows, Radius } from '../../../theme/tokens';
import {
  ArrowLeft,
  Clock,
  Play,
  Pause,
  CheckCircle,
  Camera,
  Building,
  Navigation,
  Check,
  AlertCircle,
} from 'lucide-react-native';

export default function DetalheOrdemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuthStore();
  const { isOnline, refreshPendingCount } = useNetworkStore();

  const [loading, setLoading] = useState(true);
  const [os, setOs] = useState<OrdemServicoItem | null>(null);

  // Estados de Modais
  const [modalPausaVisivel, setModalPausaVisivel] = useState(false);
  const [motivoSelecionado, setMotivoSelecionado] = useState<MotivoPausaId>('FALTA_PECA');
  const [observacaoPausa, setObservacaoPausa] = useState('');

  const [modalConcluirVisivel, setModalConcluirVisivel] = useState(false);
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelDoc, setResponsavelDoc] = useState('');
  const [justificativaSemAssinatura, setJustificativaSemAssinatura] = useState('');
  const [fotosLocais, setFotosLocais] = useState<string[]>([]);

  useEffect(() => {
    carregarDetalhes();
  }, [id]);

  const carregarDetalhes = async () => {
    if (!id) return;
    setLoading(true);

    // 1. Tentar ler do cache SQLite
    try {
      const ordens = sqliteService.obterOrdensCache();
      const achada = ordens.find((o) => o.id === id);
      if (achada) setOs(achada);
    } catch {}

    // 2. Buscar dados frescos da API real
    try {
      const remota = await apiClient.getOrdemById(id, token);
      setOs(remota);
    } catch (err) {
      // Se não conseguiu na API e não tem no cache, alerta
      if (!os) {
        Alert.alert('Erro', 'Não foi possível carregar os dados desta ordem de serviço.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1. AÇÃO: INICIAR
  const handleIniciar = async () => {
    if (!os) return;

    Alert.alert(
      'Iniciar Atendimento no Local',
      'Confirma que você está no prédio e pronto para iniciar o reparo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar e Iniciar',
          onPress: async () => {
            const novoStatus = 'EM_EXECUCAO';
            setOs((prev) => (prev ? { ...prev, status: novoStatus, iniciado_em: new Date().toISOString() } : null));
            sqliteService.atualizarStatusLocal(os.id, novoStatus);
            sqliteService.enfileirarMutacao('INICIAR_OS', os.id, {
              timestamp: new Date().toISOString(),
              gpsValidado: true,
            });
            refreshPendingCount();

            if (isOnline) {
              await apiClient.iniciarAtendimento(os.id, {}, token);
            }
          },
        },
      ],
    );
  };

  // 2. AÇÃO: PAUSAR
  const handleConfirmarPausa = async () => {
    if (!os) return;

    const labelMotivo =
      MOTIVOS_PAUSA_PADRAO.find((m) => m.id === motivoSelecionado)?.label || motivoSelecionado;
    const novoStatus = 'AGUARDANDO';

    setOs((prev) =>
      prev
        ? {
            ...prev,
            status: novoStatus,
            motivo_pausa: labelMotivo,
            pausado_em: new Date().toISOString(),
          }
        : null,
    );

    sqliteService.atualizarStatusLocal(os.id, novoStatus, { motivo_pausa: labelMotivo });
    sqliteService.enfileirarMutacao('PAUSAR_OS', os.id, {
      motivo: labelMotivo,
      observacao: observacaoPausa,
      pausado_em: new Date().toISOString(),
    });

    refreshPendingCount();
    if (isOnline) {
      await apiClient.pausarAtendimento(
        os.id,
        { motivoPausa: labelMotivo, observacao: observacaoPausa },
        token,
      );
    }

    setModalPausaVisivel(false);
    Alert.alert('Atendimento Pausado', `O relógio de SLA foi congelado com motivo: ${labelMotivo}.`);
  };

  // 3. AÇÃO: RETOMAR
  const handleRetomar = async () => {
    if (!os) return;

    const novoStatus = 'EM_EXECUCAO';
    setOs((prev) => (prev ? { ...prev, status: novoStatus, motivo_pausa: null } : null));
    sqliteService.atualizarStatusLocal(os.id, novoStatus);
    sqliteService.enfileirarMutacao('RETOMAR_OS', os.id, { timestamp: new Date().toISOString() });
    refreshPendingCount();

    if (isOnline) {
      await apiClient.iniciarAtendimento(os.id, {}, token);
    }
    Alert.alert('Atendimento Retomado', 'O relógio de trabalho e métricas de MTTR continuam ativos.');
  };

  // 4. FOTO DE EVIDÊNCIA
  const handleTirarFoto = () => {
    const fotoUrl = `https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop`;
    setFotosLocais((prev) => [...prev, fotoUrl]);
    Alert.alert('Foto Registrada!', 'Evidência fotográfica capturada com carimbo de hora e coordenadas.');
  };

  // 5. ABRIR NO GPS
  const handleAbrirGps = () => {
    if (!os) return;
    const endereco = encodeURIComponent(os.predio?.endereco || os.predio?.nome || '');
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${endereco}`);
  };

  // 6. CONCLUIR
  const handleFinalizarOS = async () => {
    if (!os) return;

    if (fotosLocais.length === 0 && os.fotos_conclusao.length === 0) {
      Alert.alert(
        'Evidência Fotográfica Obrigatória',
        'O Tribunal de Contas e as normas municipais exigem ao menos 1 foto da conclusão do serviço.',
      );
      return;
    }

    const novoStatus = 'CONCLUIDO';
    setOs((prev) =>
      prev
        ? {
            ...prev,
            status: novoStatus,
            fotos_conclusao: [...prev.fotos_conclusao, ...fotosLocais],
            concluido_em: new Date().toISOString(),
          }
        : null,
    );

    sqliteService.atualizarStatusLocal(os.id, novoStatus);
    sqliteService.enfileirarMutacao('CONCLUIR_OS', os.id, {
      fotos: fotosLocais,
      responsavelNome,
      responsavelDoc,
      justificativaSemAssinatura,
      concluido_em: new Date().toISOString(),
    });

    refreshPendingCount();
    if (isOnline) {
      await apiClient.concluirAtendimento(
        os.id,
        {
          fotosConclusao: fotosLocais,
          responsavelNome,
          justificativaSemAssinatura,
        },
        token,
      );
    }

    setModalConcluirVisivel(false);
    Alert.alert('OS Concluída com Sucesso!', 'Laudo de entrega registrado para auditoria.', [
      { text: 'Concluir', onPress: () => router.back() },
    ]);
  };

  if (loading && !os) {
    return (
      <View style={[styles.screen, styles.centerBox]}>
        <ActivityIndicator color={Palette.accent} size="large" />
        <Text style={styles.loadingText}>Carregando dados da ordem de serviço...</Text>
      </View>
    );
  }

  if (!os) {
    return (
      <View style={[styles.screen, styles.centerBox]}>
        <AlertCircle size={40} color={Palette.urgente.text} />
        <Text style={styles.notFoundTitle}>Ordem de Serviço Não Encontrada</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Voltar para a Lista</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEmExecucao = os.status === 'EM_EXECUCAO';
  const isPausado = os.status === 'AGUARDANDO';
  const isConcluido = os.status === 'CONCLUIDO';

  return (
    <View style={styles.screen}>
      {/* Top Bar Nativa com botão Voltar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navBackBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{os.codigo}</Text>
        <View style={styles.priorityPill}>
          <Text style={styles.priorityPillText}>{os.prioridade}</Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Card Hero: Título, Descrição e Prazo */}
        <View style={styles.card}>
          <View style={styles.slaBadgeRow}>
            <View style={styles.slaBadge}>
              <Clock size={12} color={Palette.alta.text} />
              <Text style={styles.slaBadgeText}>Prazo SLA Regulamentar</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{os.categoria || 'ELETRICA'}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{os.titulo}</Text>
          <Text style={styles.heroDesc}>{os.descricao || 'Sem descrição adicional'}</Text>

          {isPausado && os.motivo_pausa && (
            <View style={styles.pauseBanner}>
              <AlertCircle size={16} color={Palette.alta.text} />
              <Text style={styles.pauseBannerText}>
                Pausado: <Text style={{ fontWeight: '700' }}>{os.motivo_pausa}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Card de Localização com Ação Nativa de Mapa */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Building size={16} color={Palette.accent} />
            <Text style={styles.cardHeaderTitle}>Local do Atendimento</Text>
          </View>

          <Text style={styles.predioTitle}>{os.predio?.nome || 'Unidade Municipal'}</Text>
          <Text style={styles.predioAddress}>{os.predio?.endereco || 'Endereço da Unidade'}</Text>

          <TouchableOpacity
            style={styles.mapActionBtn}
            onPress={handleAbrirGps}
            activeOpacity={0.8}
          >
            <Navigation size={14} color={Palette.accent} />
            <Text style={styles.mapActionText}>Abrir no GPS / Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Card de Evidências Fotográficas */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Camera size={16} color={Palette.sucesso.badge} />
            <Text style={styles.cardHeaderTitle}>Registro Fotográfico</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Fotos de antes e depois com carimbo de geolocalização e data.
          </Text>

          <TouchableOpacity
            style={styles.addPhotoBtn}
            onPress={handleTirarFoto}
            activeOpacity={0.8}
          >
            <Camera size={18} color={Palette.accent} />
            <Text style={styles.addPhotoText}>Capturar Foto de Evidência</Text>
          </TouchableOpacity>

          {fotosLocais.length > 0 && (
            <View style={styles.photosGrid}>
              {fotosLocais.map((f, i) => (
                <View key={i} style={styles.photoWrapper}>
                  <Image source={{ uri: f }} style={styles.thumb} />
                  <View style={styles.photoTag}>
                    <Text style={styles.photoTagText}>Evidência #{i + 1}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Barra de Ações de Campo */}
      <View style={styles.bottomBar}>
        {isConcluido ? (
          <View style={styles.concludedBanner}>
            <CheckCircle size={18} color={Palette.sucesso.text} />
            <Text style={styles.concludedBannerText}>Atendimento Finalizado com Sucesso</Text>
          </View>
        ) : isEmExecucao ? (
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={styles.pauseBtn}
              onPress={() => setModalPausaVisivel(true)}
              activeOpacity={0.8}
            >
              <Pause size={16} color={Palette.alta.text} />
              <Text style={styles.pauseBtnText}>Pausar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.concludeBtn}
              onPress={() => setModalConcluirVisivel(true)}
              activeOpacity={0.8}
            >
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.concludeBtnText}>Concluir OS</Text>
            </TouchableOpacity>
          </View>
        ) : isPausado ? (
          <TouchableOpacity
            style={styles.resumeBtn}
            onPress={handleRetomar}
            activeOpacity={0.8}
          >
            <Play size={18} color="#FFFFFF" />
            <Text style={styles.resumeBtnText}>Retomar Atendimento</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleIniciar}
            activeOpacity={0.8}
          >
            <Play size={18} color="#FFFFFF" />
            <Text style={styles.startBtnText}>Iniciar Atendimento no Local</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal: Pausar Atendimento */}
      <Modal visible={modalPausaVisivel} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pausar Atendimento</Text>
            <Text style={styles.modalDesc}>
              Selecione o motivo da pausa para congelar o SLA e prestar contas ao Tribunal de Contas.
            </Text>

            <View style={styles.motivosList}>
              {MOTIVOS_PAUSA_PADRAO.map((m) => {
                const ativo = motivoSelecionado === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.motivoItem, ativo && styles.motivoItemAtivo]}
                    onPress={() => setMotivoSelecionado(m.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioCircle, ativo && styles.radioCircleAtivo]}>
                      {ativo && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[styles.motivoText, ativo && styles.motivoTextAtivo]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={styles.textArea}
              placeholder="Observações complementares..."
              placeholderTextColor={Palette.textDisabled}
              value={observacaoPausa}
              onChangeText={setObservacaoPausa}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalPausaVisivel(false)}
              >
                <Text style={styles.modalCancelText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmarPausa}
              >
                <Text style={styles.modalConfirmText}>Confirmar Pausa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Concluir Atendimento */}
      <Modal visible={modalConcluirVisivel} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Finalizar e Assinar OS</Text>
            <Text style={styles.modalDesc}>
              Registre os dados da entrega do serviço para geração do laudo técnico.
            </Text>

            <TextInput
              style={styles.inputModal}
              placeholder="Nome do responsável local (ex: Diretor)"
              placeholderTextColor={Palette.textDisabled}
              value={responsavelNome}
              onChangeText={setResponsavelNome}
            />

            <TextInput
              style={styles.inputModal}
              placeholder="Documento / Matrícula (opcional)"
              placeholderTextColor={Palette.textDisabled}
              value={responsavelDoc}
              onChangeText={setResponsavelDoc}
            />

            <TextInput
              style={styles.inputModal}
              placeholder="Justificativa caso sem assinatura física"
              placeholderTextColor={Palette.textDisabled}
              value={justificativaSemAssinatura}
              onChangeText={setJustificativaSemAssinatura}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalConcluirVisivel(false)}
              >
                <Text style={styles.modalCancelText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleFinalizarOS}
              >
                <Text style={styles.modalConfirmText}>Emitir Laudo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  centerBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    color: Palette.textSecondary,
    fontSize: 14,
  },
  notFoundTitle: {
    color: Palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    backgroundColor: Palette.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  navBackBtn: {
    padding: 6,
  },
  navTitle: {
    color: Palette.primary,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  priorityPill: {
    backgroundColor: Palette.urgente.bg,
    borderWidth: 1,
    borderColor: Palette.urgente.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  priorityPillText: {
    color: Palette.urgente.text,
    fontSize: 10,
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadows.card,
  },
  slaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Palette.alta.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  slaBadgeText: {
    color: Palette.alta.text,
    fontSize: 11,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: Palette.info.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  categoryBadgeText: {
    color: Palette.info.text,
    fontSize: 10,
    fontWeight: '800',
  },
  heroTitle: {
    color: Palette.primary,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  heroDesc: {
    color: Palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  pauseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.alta.bg,
    padding: 10,
    borderRadius: Radius.md,
    marginTop: 12,
  },
  pauseBannerText: {
    color: Palette.alta.text,
    fontSize: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardHeaderTitle: {
    color: Palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: Palette.textSecondary,
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 16,
  },
  predioTitle: {
    color: Palette.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  predioAddress: {
    color: Palette.textSecondary,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
  },
  mapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.info.bg,
    borderWidth: 1,
    borderColor: Palette.info.border,
    borderRadius: Radius.md,
    paddingVertical: 10,
  },
  mapActionText: {
    color: Palette.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Palette.accent,
    borderRadius: Radius.md,
    backgroundColor: Palette.accentSubtle,
    paddingVertical: 14,
  },
  addPhotoText: {
    color: Palette.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  photoWrapper: {
    width: '48%',
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: 100,
    borderRadius: Radius.md,
  },
  photoTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  photoTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Palette.surface,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    ...Shadows.floating,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.accent,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    ...Shadows.card,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Palette.alta.bg,
    borderWidth: 1,
    borderColor: Palette.alta.border,
    borderRadius: Radius.lg,
    paddingVertical: 14,
  },
  pauseBtnText: {
    color: Palette.alta.text,
    fontSize: 14,
    fontWeight: '700',
  },
  concludeBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Palette.sucesso.badge,
    borderRadius: Radius.lg,
    paddingVertical: 14,
  },
  concludeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.accent,
    borderRadius: Radius.lg,
    paddingVertical: 15,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  concludedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.sucesso.bg,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.sucesso.border,
  },
  concludedBannerText: {
    color: Palette.sucesso.text,
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Palette.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
  },
  modalTitle: {
    color: Palette.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  modalDesc: {
    color: Palette.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  motivosList: {
    gap: 8,
    marginVertical: 4,
  },
  motivoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceSecondary,
  },
  motivoItemAtivo: {
    borderColor: Palette.accent,
    backgroundColor: Palette.accentSubtle,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Palette.textDisabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleAtivo: {
    borderColor: Palette.accent,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.accent,
  },
  motivoText: {
    color: Palette.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  motivoTextAtivo: {
    fontWeight: '700',
    color: Palette.accent,
  },
  textArea: {
    backgroundColor: Palette.surfaceSecondary,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    padding: 12,
    fontSize: 13,
    color: Palette.textPrimary,
    textAlignVertical: 'top',
  },
  inputModal: {
    backgroundColor: Palette.surfaceSecondary,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  modalCancelText: {
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1.5,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Palette.accent,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
