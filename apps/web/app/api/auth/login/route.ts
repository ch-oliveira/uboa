import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'zelo_auth_token_v1';

function getBackendApiUrl(): string {
  const url = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api').trim().replace(/[\r\n]+/g, '');
  return url.replace(/\/+$/, '');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = `${getBackendApiUrl()}/auth/login`;

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Credenciais inválidas. Verifique seu e-mail e senha.',
        },
        { status: res.status || 401 }
      );
    }

    const token = data.data?.token || data.token;
    const user = data.data?.user || data.user;

    const cookieStore = await cookies();
    if (token) {
      cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 dias
      });
    }

    return NextResponse.json({
      success: true,
      user,
      message: data.message || 'Login realizado com sucesso.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Falha ao conectar com o servidor de autenticação.',
      },
      { status: 500 }
    );
  }
}
