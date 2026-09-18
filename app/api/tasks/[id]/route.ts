import { NextRequest, NextResponse } from 'next/server';
import { getTask, updateTask, deleteTask } from '@/lib/tasksStore';

// Protegido por middleware.ts (requiere cookie de sesión válida).

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const task = getTask(params.id);
  if (!task) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json({ task });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: { title?: string; done?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim().length === 0)) {
    return NextResponse.json({ error: 'title inválido' }, { status: 400 });
  }
  if (body.done !== undefined && typeof body.done !== 'boolean') {
    return NextResponse.json({ error: 'done inválido' }, { status: 400 });
  }

  const task = updateTask(params.id, { title: body.title?.trim(), done: body.done });
  if (!task) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json({ task });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = deleteTask(params.id);
  if (!ok) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
