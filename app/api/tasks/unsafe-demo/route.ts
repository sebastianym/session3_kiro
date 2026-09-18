import { NextResponse } from 'next/server';
import { listTasks } from '@/lib/tasksStore';

/**
 * ⚠️ ENDPOINT DE DEMOSTRACIÓN — INSEGURO A PROPÓSITO ⚠️
 *
 * Este endpoint existe únicamente para mostrar el hook de auditoría de seguridad
 * en acción. Está EXCLUIDO deliberadamente del middleware de autenticación
 * (ver middleware.ts -> PUBLIC_EXCEPTIONS).
 *
 * Problemas intencionales:
 * - Sin autenticación ni autorización.
 * - Sin rate limiting.
 * - Expone todas las tasks de todos los usuarios sin filtrar.
 *
 * NO usar este patrón en endpoints reales. NO desplegar a producción sin arreglarlo.
 */
export async function GET() {
  return NextResponse.json({
    warning: 'Este endpoint es inseguro a propósito (fines de demo).',
    tasks: listTasks(),
  });
}
