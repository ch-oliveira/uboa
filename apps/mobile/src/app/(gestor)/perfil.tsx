import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { useNetworkStore } from '../../stores/network-store';
import { LogoutModal } from '../../components/LogoutModal';
import { Palette, Shadows, Radius } from '../../theme/tokens';
import {
  User,
  Shield,
  Smartphone,
  Database,
  Bell,
  MapPin,
  Sparkles,
  Info,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Phone,
  Mail,
  Building2,
} from 'lucide-react-native';

export default function GestorPerfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isOnline } = useNetworkStore();

  // Estados de Configurações do Gestor
  const [notificacoesSla, setNotificacoesSla] = useState(true);
  const [sugestoesIaProximidade, setSugestoesIaProximidade] = useState(true);
  const [radarTempoReal, setRadarTempoReal] = useState(true);
  const [modalLogoutVisivel, setModalLogoutVisivel] = useState(false);

  const handleConfirmarLogout = () => {
    setModalLogoutVisivel(false);
    logout();
    router.replace('/(auth)/login');
  };

  const iniciais = (user?.nome || 'Gestor Municipal')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD HERO DO PERFIL DO GESTOR */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{iniciais}</Text>
          </View>

          <Text style={styles.profileName}>{user?.nome || 'Gestor Municipal'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'gestor.predial@urboa.gov.br'}</Text>

          <View style={styles.roleBadge}>
            <Shield size={12} color={Palette.accent} />
            <Text style={styles.roleBadgeText}>
              Supervisão de Campo • {user?.role || 'GESTOR'}
            </Text>
          </View>

          {/* Dados de Contato e Lotação Institucional */}
          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
              <Building2 size={13} color={Palette.textMuted} />
              <Text style={styles.contactText}>Secretaria de Obras</Text>
            </View>
            <View style={styles.contactDivider} />
            <View style={styles.contactItem}>
              <CheckCircle2 size={13} color={Palette.sucesso.badge} />
              <Text style={styles.contactText}>Acesso Master Ativo</Text>
            </View>
          </View>
        </View>



        {/* PREFERÊNCIAS DE SUPERVISÃO E GESTÃO */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>Configurações de Supervisão</Text>
          <View style={styles.optionsCard}>
            <View style={styles.optionRow}>
              <View style={styles.optionIconBox}>
                <Bell size={18} color={Palette.urgente.text} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Alertas Críticos de SLA</Text>
                <Text style={styles.optionSubtitle}>
                  Avisos imediatos quando chamados urgentes estiverem a menos de 2h do estouro de prazo
                </Text>
              </View>
              <Switch
                value={notificacoesSla}
                onValueChange={setNotificacoesSla}
                trackColor={{ false: Palette.border, true: Palette.accent }}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.optionRow}>
              <View style={styles.optionIconBox}>
                <Sparkles size={18} color={Palette.accent} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Sugestões de Otimização por Proximidade</Text>
                <Text style={styles.optionSubtitle}>
                  Agrupamento automático de chamados vizinhos por competência técnica
                </Text>
              </View>
              <Switch
                value={sugestoesIaProximidade}
                onValueChange={setSugestoesIaProximidade}
                trackColor={{ false: Palette.border, true: Palette.accent }}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.optionRow}>
              <View style={styles.optionIconBox}>
                <MapPin size={18} color={Palette.sucesso.badge} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Radar de Equipes em Tempo Real</Text>
                <Text style={styles.optionSubtitle}>
                  Atualização contínua do mapa de geolocalização dos técnicos de plantão
                </Text>
              </View>
              <Switch
                value={radarTempoReal}
                onValueChange={setRadarTempoReal}
                trackColor={{ false: Palette.border, true: Palette.accent }}
              />
            </View>
          </View>
        </View>

        {/* AUDITORIA E SISTEMA */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>Conformidade e Sistema</Text>
          <View style={styles.optionsCard}>
            <View style={styles.optionRow}>
              <View style={styles.optionIconBox}>
                <Smartphone size={18} color={Palette.textSecondary} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Versão do Aplicativo</Text>
                <Text style={styles.optionSubtitle}>Predial Mobile Gestor v1.2.0 • Build 57</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() =>
                Alert.alert(
                  'Diretrizes de Governança e TCE',
                  'Este módulo municipal cumpre os requisitos de transparência e prestação de contas dos Tribunais de Contas: rastreabilidade de despachos, vedação de exclusão de chamados e integridade de métricas de SLA.',
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.optionIconBox}>
                <Info size={18} color={Palette.textSecondary} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Normas de Governança e TCE</Text>
                <Text style={styles.optionSubtitle}>Padrões de fiscalização e auditoria municipal</Text>
              </View>
              <ChevronRight size={16} color={Palette.textDisabled} />
            </TouchableOpacity>
          </View>
        </View>

        {/* BOTÃO DE LOGOUT COM CONFIRMAÇÃO */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setModalLogoutVisivel(true)}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={Palette.urgente.text} />
          <Text style={styles.logoutButtonText}>Encerrar Sessão de Gestor</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL DE CONFIRMAÇÃO DE LOGOUT */}
      <LogoutModal
        visible={modalLogoutVisivel}
        onClose={() => setModalLogoutVisivel(false)}
        onConfirm={handleConfirmarLogout}
      />
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
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  profileCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadows.card,
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: Radius.full,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Shadows.card,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileName: {
    color: Palette.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  profileEmail: {
    color: Palette.textSecondary,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.accentSubtle,
    borderWidth: 1,
    borderColor: Palette.info.border,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    marginBottom: 16,
  },
  roleBadgeText: {
    color: Palette.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    width: '100%',
    justifyContent: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactDivider: {
    width: 1,
    height: 12,
    backgroundColor: Palette.border,
  },
  contactText: {
    color: Palette.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    gap: 8,
  },
  sectionHeaderTitle: {
    color: Palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
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
  statLabel: {
    color: Palette.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  statValue: {
    color: Palette.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  optionsCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadows.card,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  optionIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    color: Palette.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  optionSubtitle: {
    color: Palette.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
  separator: {
    height: 1,
    backgroundColor: Palette.borderSubtle,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.urgente.bg,
    borderWidth: 1,
    borderColor: Palette.urgente.border,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    marginTop: 4,
  },
  logoutButtonText: {
    color: Palette.urgente.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
