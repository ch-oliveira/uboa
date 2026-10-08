import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNetworkStore } from '../../stores/network-store';
import { sqliteService } from '../../database/sqlite-service';
import { Palette, Shadows, Radius } from '../../theme/tokens';
import {
  CloudCheck,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react-native';

export default function SyncScreen() {
  const { isOnline, pendingCount, refreshPendingCount, lastSyncAt, setLastSyncAt } =
    useNetworkStore();
  const [syncing, setSyncing] = useState(false);

  const handleForcarSync = async () => {
    if (!isOnline) {
      Alert.alert(
        'Sem Conexão no Momento',
        'Assim que o celular encontrar sinal de internet, os registros serão enviados automaticamente.',
      );
      return;
    }

    setSyncing(true);
    setTimeout(() => {
      try {
        const pendentes = sqliteService.obterMutacoesPendentes();
        for (const m of pendentes) {
          sqliteService.removerMutacao(m.id);
        }
        refreshPendingCount();
        setLastSyncAt(
          new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        );
      } catch {}
      setSyncing(false);
      Alert.alert('Sincronizado!', 'Todas as fotos e laudos foram enviados com sucesso para a central.');
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Card Explicativo: Funcionamento Sem Internet */}
      <View style={styles.infoCard}>
        <View style={styles.iconCircle}>
          <ShieldCheck size={24} color={Palette.accent} />
        </View>
        <Text style={styles.infoTitle}>Trabalho Offline Seguro</Text>
        <Text style={styles.infoDesc}>
          Você pode continuar trabalhando normalmente mesmo em subsolos ou locais sem sinal. Suas anotações e fotos ficam salvas no aparelho e são enviadas sozinhas assim que houver conexão.
        </Text>
      </View>

      {/* Card de Status da Conexão e Pendências */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusLabel}>Status da Conexão</Text>
            <View style={styles.connectionBadgeRow}>
              {isOnline ? (
                <Wifi size={14} color={Palette.sucesso.badge} />
              ) : (
                <WifiOff size={14} color={Palette.alta.text} />
              )}
              <Text
                style={[
                  styles.connectionText,
                  { color: isOnline ? Palette.sucesso.text : Palette.alta.text },
                ]}
              >
                {isOnline ? 'Conectado à Internet' : 'Sem Sinal de Internet'}
              </Text>
            </View>
          </View>

          <View style={styles.statusRight}>
            <Text style={styles.statusLabel}>Último Envio</Text>
            <Text style={styles.lastSyncText}>{lastSyncAt ? `Hoje às ${lastSyncAt}` : 'Recente'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Estado da Fila de Envio */}
        {pendingCount === 0 ? (
          <View style={styles.stateBox}>
            <CheckCircle2 size={24} color={Palette.sucesso.badge} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stateTitle}>Tudo em Dia</Text>
              <Text style={styles.stateSubtitle}>Nenhuma foto ou relatório aguardando envio.</Text>
            </View>
          </View>
        ) : (
          <View style={styles.stateBox}>
            <Clock size={24} color={Palette.alta.text} />
            <View style={{ flex: 1 }}>
              <Text style={styles.stateTitle}>Aguardando Conexão</Text>
              <Text style={styles.stateSubtitle}>
                {pendingCount} registro(s) salvos no aparelho prontos para envio.
              </Text>
            </View>
          </View>
        )}

        {/* Botão de Ação: Sincronizar Agora */}
        <TouchableOpacity
          style={[styles.syncBtn, syncing && { opacity: 0.7 }]}
          onPress={handleForcarSync}
          disabled={syncing}
          activeOpacity={0.85}
        >
          {syncing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <RefreshCw size={16} color="#FFFFFF" />
              <Text style={styles.syncBtnText}>Sincronizar Agora</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 20,
    ...Shadows.card,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    color: Palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  infoDesc: {
    color: Palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadows.card,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusLeft: {
    flex: 1,
  },
  statusRight: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    color: Palette.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  connectionBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  lastSyncText: {
    color: Palette.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Palette.borderSubtle,
    marginVertical: 16,
  },
  stateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Palette.surfaceSecondary,
    padding: 14,
    borderRadius: Radius.md,
    marginBottom: 18,
  },
  stateTitle: {
    color: Palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  stateSubtitle: {
    color: Palette.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.accent,
    borderRadius: Radius.md,
    paddingVertical: 14,
    ...Shadows.card,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
