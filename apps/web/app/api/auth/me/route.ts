import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'zelo_auth_token_v1';

function getBackendApiUrl(): string {
  const url = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api').trim().replace(/[\r\n]+/g, '');
  return url.replace(/\/+$/, '');
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Não autenticado' },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${getBackendApiUrl()}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      cookieStore.delete(COOKIE_NAME);
      return NextResponse.json(
        { success: false, message: 'Sessão expirada ou inválida.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data.data || data.user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erro ao validar sessão.' },
      { status: 500 }
    );
  }
}
