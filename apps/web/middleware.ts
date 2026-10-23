import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'zelo_auth_token_v1';
const PUBLIC_PATHS = ['/login', '/landing', '/abrir-chamado', '/apresentacao'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // 1. Tratamento para chamadas de API (/api/...)
  if (pathname.startsWith('/api')) {
    // As rotas internas de auth (/api/auth/login, etc.) não precisam de injeção de token
    if (!pathname.startsWith('/api/auth')) {
      if (token) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('authorization', `Bearer ${token}`);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    }
    return NextResponse.next();
  }

  // 2. Verifica se a rota da UI é pública
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  // 3. Usuário NÃO autenticado tentando acessar rota restrita -> Redireciona imediatamente para /login
  if (!token && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Usuário JÁ autenticado tentando acessar a tela de /login -> Redireciona para a home /
  if (token && pathname === '/login') {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica em todas as rotas, exceto:
     * - Arquivos estáticos (_next/static, _next/image, favicon.ico, etc.)
     * - Imagens e fontes públicas
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
