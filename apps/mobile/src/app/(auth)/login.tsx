import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { Palette, Shadows, Radius } from '../../theme/tokens';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Informe seu e-mail institucional.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Informe sua senha de acesso.');
      return;
    }

    try {
      await login(email.trim(), password);
      const role = useAuthStore.getState().activeRole;
      if (role === 'GESTOR' || role === 'ADMIN') {
        router.replace('/(gestor)');
      } else {
        router.replace('/(tecnico)');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Falha ao autenticar. Verifique sua conexão e credenciais.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Institucional */}
          <View style={styles.brandHeader}>
            <View style={styles.badgePill}>
              <Shield size={14} color={Palette.accent} />
              <Text style={styles.badgeText}>ZELADORIA PREDIAL URBANA</Text>
            </View>
            <Text style={styles.brandTitle}>Predial</Text>
            <Text style={styles.brandSubtitle}>
              Operações de campo e gestão integrada de manutenção pública municipal
            </Text>
          </View>

          {/* Card de Autenticação */}
          <View style={styles.authCard}>
            <Text style={styles.formTitle}>Acesse sua conta</Text>
            <Text style={styles.formSubtitle}>
              Entre com as credenciais corporativas fornecidas pela administração.
            </Text>

            {/* Mensagem de Erro Inline */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color={Palette.urgente.text} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Input E-mail */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-mail institucional</Text>
              <View style={styles.inputWrapper}>
                <Mail size={16} color={Palette.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIcon}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="usuario@urboa.gov.br"
                  placeholderTextColor={Palette.textDisabled}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Input Senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha de acesso</Text>
              <View style={styles.inputWrapper}>
                <Lock size={16} color={Palette.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputWithIcon, { paddingRight: 40 }]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  placeholderTextColor={Palette.textDisabled}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus={true}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={16} color={Palette.textMuted} />
                  ) : (
                    <Eye size={16} color={Palette.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão de Submissão */}
            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Entrar no Aplicativo</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Nota de Segurança e Conformidade */}
          <View style={styles.footerNote}>
            <Lock size={12} color={Palette.textMuted} />
            <Text style={styles.footerText}>
              Acesso protegido por autenticação JWT e criptografia de ponta a ponta
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 32,
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.accentSubtle,
    borderWidth: 1,
    borderColor: Palette.info.border,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    marginBottom: 12,
  },
  badgeText: {
    color: Palette.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandTitle: {
    color: Palette.primary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  brandSubtitle: {
    color: Palette.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 300,
    lineHeight: 18,
  },
  authCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadows.card,
  },
  formTitle: {
    color: Palette.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  formSubtitle: {
    color: Palette.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 18,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.urgente.bg,
    borderWidth: 1,
    borderColor: Palette.urgente.border,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: Palette.urgente.text,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  inputWithIcon: {
    backgroundColor: Palette.surfaceSecondary,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    paddingLeft: 42,
    paddingRight: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 4,
    zIndex: 1,
  },
  primaryBtn: {
    backgroundColor: Palette.accent,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    ...Shadows.card,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
    paddingHorizontal: 16,
  },
  footerText: {
    color: Palette.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
});
