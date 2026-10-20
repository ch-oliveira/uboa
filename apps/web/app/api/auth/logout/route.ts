import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'zelo_auth_token_v1';

function getBackendApiUrl(): string {
  const url = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api').trim().replace(/[\r\n]+/g, '');
  return url.replace(/\/+$/, '');
}

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  // Notifica o backend se houver token para revogar a sessão (token_version)
  if (token) {
    try {
      await fetch(`${getBackendApiUrl()}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignora falhas de rede no logout remoto
    }
  }

  // Deleta o cookie HttpOnly
  cookieStore.delete(COOKIE_NAME);

  return NextResponse.json({
    success: true,
    message: 'Sessão encerrada com sucesso.',
  });
}
