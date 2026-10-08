import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/auth-store';

export default function IndexPage() {
  const { isAuthenticated, activeRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (activeRole === 'GESTOR' || activeRole === 'ADMIN') {
    return <Redirect href="/(gestor)" />;
  }

  return <Redirect href="/(tecnico)" />;
}
