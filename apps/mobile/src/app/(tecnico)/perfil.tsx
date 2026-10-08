import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { useNetworkStore } from '../../stores/network-store';
import { LogoutModal } from '../../components/LogoutModal';
import { Palette, Shadows, Radius } from '../../theme/tokens';
import {
  User,
  Shield,
  Bell,
  BatteryCharging,
  LogOut,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
} from 'lucide-react-native';

export default function TecnicoPerfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { pendingCount } = useNetworkStore();

  // Estados de Preferências
  const [alertasSla, setAlertasSla] = useState(true);
  const [economiaBateria, setEconomiaBateria] = useState(false);
  const [modalLogoutVisivel, setModalLogoutVisivel] = useState(false);

  const handleConfirmarLogout = () => {
    setModalLogoutVisivel(false);
    logout();
    router.replace('/(auth)/login');
  };

  const iniciais = (user?.nome || 'Carlos Silva')
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
        {/* CARTÃO DE IDENTIFICAÇÃO DO TÉCNICO */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{iniciais}</Text>
          </View>

          <Text style={styles.profileName}>{user?.nome || 'Carlos Silva'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'carlos.tecnico@urboa.gov.br'}</Text>

          <View style={styles.roleBadge}>
            <Shield size={13} color={Palette.accent} />
            <Text style={styles.roleBadgeText}>
              Técnico de Manutenção • {user?.especialidade || 'Elétrica'}
            </Text>
          </View>

          {/* Dados de Contato e Matrícula */}
          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
              <Phone size={13} color={Palette.textMuted} />
              <Text style={styles.contactText}>{user?.telefone || '(11) 98765-4321'}</Text>
            </View>
            <View style={styles.contactDivider} />
            <View style={styles.contactItem}>
              <CheckCircle2 size={13} color={Palette.sucesso.badge} />
              <Text style={styles.contactText}>Matrícula Ativa</Text>
            </View>
          </View>
        </View>

        {/* STATUS DE SINCRONIZAÇÃO (AMIGÁVEL E SEM TERMOS TÉCNICOS) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>Envio de Informações</Text>
          <View style={styles.syncCard}>
            <View
              style={[
                styles.syncIconBox,
                pendingCount > 0 ? styles.syncIconPending : styles.syncIconSuccess,
              ]}
            >
              {pendingCount > 0 ? (
                <Clock size={20} color={Palette.alta.text} />
              ) : (
                <CheckCircle2 size={20} color={Palette.sucesso.badge} />
              )}
            </View>
            <View style={styles.syncTextWrap}>
              <Text style={styles.syncTitle}>
                {pendingCount > 0 ? 'Salvando no Telefone' : 'Tudo Atualizado'}
              </Text>
              <Text style={styles.syncSubtitle}>
                {pendingCount > 0
                  ? `${pendingCount} foto(s) ou registro(s) salvos no aparelho. O envio acontece sozinho quando tiver sinal.`
                  : 'Seus chamados, fotos e laudos estão salvos e sincronizados com a prefeitura.'}
              </Text>
            </View>
          </View>
        </View>

        {/* PREFERÊNCIAS DO APLICATIVO */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>Preferências</Text>
          <View style={styles.optionsCard}>
            <View style={styles.optionRow}>
              <View style={styles.optionIconBox}>
                <Bell size={18} color={Palette.accent} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Avisos sonoros para chamados urgentes</Text>
                <Text style={styles.optionSubtitle}>
                  Tocar alerta de áudio quando surgir um chamado de alta prioridade
                </Text>
              </View>
              <Switch
                value={alertasSla}
                onValueChange={setAlertasSla}
                trackColor={{ false: Palette.border, true: Palette.accent }}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.optionRow}>
              <View style={styles.optionIconBox}>
                <BatteryCharging size={18} color={Palette.sucesso.badge} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Economia de bateria em campo</Text>
                <Text style={styles.optionSubtitle}>
                  Otimiza o consumo do telefone durante o trabalho fora da base
                </Text>
              </View>
              <Switch
                value={economiaBateria}
                onValueChange={setEconomiaBateria}
                trackColor={{ false: Palette.border, true: Palette.accent }}
              />
            </View>
          </View>
        </View>

        {/* BOTÃO DE LOGOUT COM CONFIRMAÇÃO */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setModalLogoutVisivel(true)}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={Palette.urgente.text} />
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>

        {/* RODAPÉ DISCRETO */}
        <Text style={styles.footerText}>Urboa Predial • Versão 2.4</Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 24,
    ...Shadows.card,
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  profileName: {
    color: Palette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileEmail: {
    color: Palette.textSecondary,
    fontSize: 13,
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
    fontSize: 12,
    fontWeight: '600',
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
  contactText: {
    color: Palette.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  contactDivider: {
    width: 1,
    height: 14,
    backgroundColor: Palette.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderTitle: {
    color: Palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadows.card,
  },
  syncIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncIconSuccess: {
    backgroundColor: Palette.sucesso.bg,
  },
  syncIconPending: {
    backgroundColor: Palette.alta.bg,
  },
  syncTextWrap: {
    flex: 1,
  },
  syncTitle: {
    color: Palette.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  syncSubtitle: {
    color: Palette.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  optionsCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadows.card,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  optionIconBox: {
    width: 38,
    height: 38,
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    color: Palette.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: Palette.borderSubtle,
    marginVertical: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Palette.urgente.bg,
    borderWidth: 1,
    borderColor: Palette.urgente.border,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    marginTop: 8,
    marginBottom: 16,
  },
  logoutButtonText: {
    color: Palette.urgente.text,
    fontSize: 14,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    color: Palette.textDisabled,
    fontSize: 12,
    marginBottom: 10,
  },
});
