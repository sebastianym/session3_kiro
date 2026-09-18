'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  owner: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    const res = await fetch('/api/tasks');
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    const data = await res.json();
    setTasks(data.tasks || []);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Error al crear');
      return;
    }
    setTitle('');
    loadTasks();
  }

  async function toggleDone(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !task.done }),
    });
    loadTasks();
  }

  async function remove(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Tasks</h1>
        <button onClick={logout} style={{ background: 'none', border: '1px solid #334155', color: '#e2e8f0', padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>

      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea"
          style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0' }}
        />
        <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#6366f1', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
          Agregar
        </button>
      </form>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#1e293b',
              padding: 12,
              borderRadius: 8,
            }}
          >
            <input type="checkbox" checked={task.done} onChange={() => toggleDone(task)} />
            <span style={{ flex: 1, textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.6 : 1 }}>
              {task.title}
            </span>
            <button onClick={() => remove(task.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
