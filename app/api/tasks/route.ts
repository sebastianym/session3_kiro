import { NextRequest, NextResponse } from 'next/server';
import { listTasks, createTask } from '@/lib/tasksStore';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/session';

// Protegido por middleware.ts (requiere cookie de sesión válida).

async function getUser(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  return (session?.sub as string) ?? null;
}

export async function GET() {
  return NextResponse.json({ tasks: listTasks() });
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  let body: { title?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title || title.length > 200) {
    return NextResponse.json({ error: 'title es requerido (máx 200 caracteres)' }, { status: 400 });
  }

  const task = createTask(title, user);
  return NextResponse.json({ task }, { status: 201 });
}
