#!/usr/bin/env node
/**
 * Auditoría estática de seguridad para endpoints de app/api.
 *
 * Regla: todo route.ts bajo app/api/** debe estar cubierto por el middleware
 * (PROTECTED_PREFIXES en middleware.ts) o estar explícitamente listado como
 * excepción pública (PUBLIC_EXCEPTIONS), a propósito y documentado.
 *
 * Uso:
 *   node scripts/security-check.mjs           -> reporte en consola, exit 1 si hay endpoints sin cubrir y sin excepción documentada
 *   node scripts/security-check.mjs --json     -> reporte en JSON (para CI)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, sep } from 'path';

const ROOT = process.cwd();
const API_DIR = join(ROOT, 'app', 'api');
const MIDDLEWARE_FILE = join(ROOT, 'middleware.ts');

function findRouteFiles(dir) {
  const results = [];
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      results.push(...findRouteFiles(full));
    } else if (entry === 'route.ts' || entry === 'route.js') {
      results.push(full);
    }
  }
  return results;
}

function toApiPath(routeFile) {
  const rel = relative(API_DIR, routeFile);
  const parts = rel.split(sep).slice(0, -1); // quita route.ts
  return '/api/' + parts.join('/');
}

function parseMiddlewareConfig() {
  let content = '';
  try {
    content = readFileSync(MIDDLEWARE_FILE, 'utf-8');
  } catch {
    return { protectedPrefixes: [], publicExceptions: [], publicByDesign: [] };
  }

  const protectedMatch = content.match(/PROTECTED_PREFIXES\s*=\s*\[([\s\S]*?)\]/);
  const exceptionsMatch = content.match(/PUBLIC_EXCEPTIONS\s*=\s*\[([\s\S]*?)\]/);
  const byDesignMatch = content.match(/PUBLIC_BY_DESIGN\s*=\s*\[([\s\S]*?)\]/);

  const extractStrings = (block) =>
    block
      ? [...block.matchAll(/['"`]([^'"`]+)['"`]/g)].map((m) => m[1])
      : [];

  return {
    protectedPrefixes: extractStrings(protectedMatch?.[1]),
    publicExceptions: extractStrings(exceptionsMatch?.[1]),
    publicByDesign: extractStrings(byDesignMatch?.[1]),
  };
}

function detectHttpMethods(fileContent) {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  return methods.filter((m) => new RegExp(`export\\s+async\\s+function\\s+${m}\\b`).test(fileContent));
}

function hasExplicitInsecureMarker(fileContent) {
  return /INSEGURO A PROP[ÓO]SITO|@insecure-by-design/i.test(fileContent);
}

function run() {
  const { protectedPrefixes, publicExceptions, publicByDesign } = parseMiddlewareConfig();
  const routeFiles = findRouteFiles(API_DIR);

  const report = routeFiles.map((file) => {
    const apiPath = toApiPath(file);
    const content = readFileSync(file, 'utf-8');
    const methods = detectHttpMethods(content);

    const isProtected = protectedPrefixes.some((p) => apiPath.startsWith(p));
    const isExplicitException = publicExceptions.some((p) => apiPath.startsWith(p));
    const isPublicByDesign = publicByDesign.some((p) => apiPath.startsWith(p));
    const isMarkedInsecure = hasExplicitInsecureMarker(content);

    let status;
    if (isPublicByDesign) {
      status = 'PUBLIC_BY_DESIGN'; // infraestructura de auth, valida credenciales/sesión internamente
    } else if (isProtected && !isExplicitException) {
      status = 'PROTECTED';
    } else if (isExplicitException && isMarkedInsecure) {
      status = 'PUBLIC_DOCUMENTED'; // excepción intencional y documentada en el código
    } else if (isExplicitException) {
      status = 'PUBLIC_UNDOCUMENTED'; // excepción en middleware pero sin advertencia en el código
    } else {
      status = 'UNPROTECTED'; // no cubierto por ningún prefijo protegido, riesgo real
    }

    return { apiPath, file: relative(ROOT, file), methods, status };
  });

  const problems = report.filter((r) => r.status === 'UNPROTECTED' || r.status === 'PUBLIC_UNDOCUMENTED');

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ report, problems, ok: problems.length === 0 }, null, 2));
  } else {
    console.log('Auditoría de seguridad de endpoints (app/api):\n');
    for (const r of report) {
      const icon =
        r.status === 'PROTECTED' || r.status === 'PUBLIC_BY_DESIGN'
          ? '✅'
          : r.status === 'PUBLIC_DOCUMENTED'
          ? '⚠️ '
          : '❌';
      console.log(`${icon} ${r.apiPath} [${r.methods.join(', ') || '?'}] -> ${r.status}`);
    }
    console.log('');
    if (problems.length > 0) {
      console.log(`${problems.length} endpoint(s) sin la seguridad adecuada:`);
      for (const p of problems) {
        console.log(`  - ${p.apiPath} (${p.file}) [${p.status}]`);
      }
    } else {
      console.log('Todos los endpoints están protegidos o documentados como excepción intencional.');
    }
  }

  process.exit(problems.length === 0 ? 0 : 1);
}

run();
