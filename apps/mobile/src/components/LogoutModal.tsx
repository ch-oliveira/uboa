import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LogOut, AlertTriangle } from 'lucide-react-native';
import { Palette, Shadows, Radius } from '../theme/tokens';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutModal({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Ícone de Destaque */}
          <View style={styles.iconCircle}>
            <LogOut size={22} color={Palette.urgente.text} />
          </View>

          {/* Conteúdo Informativo */}
          <Text style={styles.title}>Encerrar Sessão?</Text>
          <Text style={styles.message}>
            Tem certeza que deseja sair da sua conta institucional? Suas ordens de serviço sincronizadas
            e o histórico local permanecerão armazenados com segurança no dispositivo.
          </Text>

          {/* Botões de Ação */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmText}>Sim, Sair</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadows.card,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Palette.urgente.bg,
    borderWidth: 1,
    borderColor: Palette.urgente.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: Palette.primary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: Palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Palette.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    backgroundColor: Palette.urgente.text,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
