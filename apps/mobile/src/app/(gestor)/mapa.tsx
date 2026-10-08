import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MapPin, Shield } from 'lucide-react-native';
import { Palette, Shadows, Radius } from '../../theme/tokens';

const EQUIPES_CAMPO = [
  {
    id: 'tec-1',
    nome: 'Carlos Eduardo Lima',
    especialidade: 'ELETRICA',
    status: 'EM_ATENDIMENTO',
    local: 'UBS Dra. Zilda Arns',
    endereco: 'Av. Paulista, 1500 - Bela Vista',
    distanciaBase: '2.4 km da Base Central',
  },
  {
    id: 'tec-2',
    nome: 'Marcos Silva',
    especialidade: 'HIDRAULICA',
    status: 'EM_DESLOCAMENTO',
    local: 'A caminho de: EMEF Santos Dumont',
    endereco: 'Rua Bela Cintra, 890 - Consolação',
    distanciaBase: '3.1 km da Base Central',
  },
  {
    id: 'tec-3',
    nome: 'Roberto Souza',
    especialidade: 'ALVENARIA',
    status: 'DISPONIVEL',
    local: 'Base Operacional Central',
    endereco: 'Rua da Mooca, 1200 - Centro',
    distanciaBase: 'Na Base Central',
  },
];

export default function GestorMapaScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Radar Municipal Limpo */}
      <View style={styles.radarCard}>
        <View style={styles.radarHeader}>
          <Shield size={16} color={Palette.accent} />
          <Text style={styles.radarTitle}>Georreferenciamento de Equipes (PostGIS)</Text>
        </View>

        <View style={styles.radarVisual}>
          <View style={styles.radarCircleOuter}>
            <View style={styles.radarCircleInner}>
              <View style={styles.radarCenterPin}>
                <Text style={styles.radarCenterText}>BASE</Text>
              </View>
            </View>
          </View>
          <Text style={styles.radarNote}>
            3 equipes operacionais ativas com ponto georreferenciado
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Técnicos em Atividade no Município</Text>

      <View style={styles.list}>
        {EQUIPES_CAMPO.map((t) => {
          const isAtendimento = t.status === 'EM_ATENDIMENTO';
          const isDeslocamento = t.status === 'EM_DESLOCAMENTO';

          return (
            <View key={t.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.tecNome}>{t.nome}</Text>
                  <Text style={styles.tecSpec}>Especialidade: {t.especialidade}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    isAtendimento
                      ? styles.badgeAtendimento
                      : isDeslocamento
                        ? styles.badgeDeslocamento
                        : styles.badgeDisponivel,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isAtendimento
                        ? { color: Palette.sucesso.text }
                        : isDeslocamento
                          ? { color: Palette.alta.text }
                          : { color: Palette.info.text },
                    ]}
                  >
                    {isAtendimento
                      ? 'Em Serviço'
                      : isDeslocamento
                        ? 'Em Deslocamento'
                        : 'Disponível'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.localRow}>
                  <MapPin size={14} color={Palette.textMuted} />
                  <Text style={styles.localText}>{t.local}</Text>
                </View>
                <Text style={styles.distanciaText}>{t.distanciaBase}</Text>
              </View>
            </View>
          );
        })}
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
    padding: 20,
    paddingBottom: 40,
  },
  radarCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 20,
    ...Shadows.card,
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  radarTitle: {
    color: Palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  radarVisual: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  radarCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: Palette.info.border,
    backgroundColor: Palette.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: Palette.accent,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCenterPin: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  radarCenterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  radarNote: {
    color: Palette.textSecondary,
    fontSize: 12,
    marginTop: 14,
  },
  sectionTitle: {
    color: Palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tecNome: {
    color: Palette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  tecSpec: {
    color: Palette.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  badgeAtendimento: {
    backgroundColor: Palette.sucesso.bg,
  },
  badgeDeslocamento: {
    backgroundColor: Palette.alta.bg,
  },
  badgeDisponivel: {
    backgroundColor: Palette.info.bg,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  localRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  localText: {
    color: Palette.textSecondary,
    fontSize: 12,
  },
  distanciaText: {
    color: Palette.textMuted,
    fontSize: 11,
  },
});
