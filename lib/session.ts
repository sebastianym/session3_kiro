import { SignJWT, jwtVerify } from 'jose';

// Este módulo es seguro para Edge Runtime (usado por middleware.ts): solo
// depende de 'jose' (Web Crypto), sin módulos nativos de Node como 'crypto'.

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-only-insecure-secret-change-me';
const secretKey = new TextEncoder().encode(AUTH_SECRET);

export const SESSION_COOKIE = 'session_token';
const SESSION_TTL_SECONDS = 60 * 60; // 1 hora
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

export interface SessionPayload {
  sub: string;
  [key: string]: unknown;
}

/** Crea un JWT firmado (HS256) con expiración corta para la sesión. */
export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey);
}

/** Verifica un JWT de sesión. Devuelve el payload si es válido, null si no. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
