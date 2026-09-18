import { createHash } from 'crypto';

// Este módulo usa 'crypto' de Node y solo debe importarse en Node runtime
// (route handlers), nunca desde middleware.ts (Edge Runtime).

const AUTH_SALT = process.env.AUTH_SALT || 'dev-only-insecure-salt-change-me';
const DEMO_USER = process.env.DEMO_USER || 'admin';
const DEMO_PASSWORD_HASH = hashPassword(process.env.DEMO_PASSWORD || 'admin1234');

function hashPassword(password: string): string {
  return createHash('sha256').update(`${AUTH_SALT}:${password}`).digest('hex');
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/** Valida credenciales contra el usuario demo configurado por variables de entorno. */
export function verifyCredentials(username: string, password: string): boolean {
  if (!username || !password) return false;
  const actualHash = hashPassword(password);
  return username === DEMO_USER && timingSafeEqualStr(actualHash, DEMO_PASSWORD_HASH);
}
