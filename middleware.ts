import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from './lib/session';

// Rutas protegidas por sesión. El endpoint /api/tasks/unsafe-demo se excluye
// deliberadamente para servir como ejemplo de endpoint SIN seguridad.
const PROTECTED_PREFIXES = ['/api/tasks', '/dashboard'];
const PUBLIC_EXCEPTIONS = ['/api/tasks/unsafe-demo'];

// Endpoints públicos por diseño (infraestructura de autenticación): no pasan
// por el middleware porque son el mecanismo para obtener/verificar la sesión,
// pero manejan su propia validación internamente. No son un hueco de seguridad.
// Usado por scripts/security-check.mjs para no marcarlos como falso positivo.
export const PUBLIC_BY_DESIGN = ['/api/auth/login', '/api/auth/logout', '/api/auth/me'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicException = PUBLIC_EXCEPTIONS.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isProtected || isPublicException) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/tasks/:path*', '/dashboard/:path*'],
};
