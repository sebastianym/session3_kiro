// Store en memoria (sin BD). Se reinicia con cada restart del server.
// Suficiente para demo; en producción esto debe ser una base de datos real.

export interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  owner: string;
}

const tasks: Task[] = [
  { id: '1', title: 'Configurar repo y CI/CD', done: true, createdAt: new Date().toISOString(), owner: 'admin' },
  { id: '2', title: 'Conectar AWS MCP', done: false, createdAt: new Date().toISOString(), owner: 'admin' },
];

let nextId = 3;

export function listTasks(): Task[] {
  return tasks;
}

export function getTask(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export function createTask(title: string, owner: string): Task {
  const task: Task = {
    id: String(nextId++),
    title,
    done: false,
    createdAt: new Date().toISOString(),
    owner,
  };
  tasks.push(task);
  return task;
}

export function updateTask(id: string, updates: Partial<Pick<Task, 'title' | 'done'>>): Task | null {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  if (typeof updates.title === 'string') task.title = updates.title;
  if (typeof updates.done === 'boolean') task.done = updates.done;
  return task;
}

export function deleteTask(id: string): boolean {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
}
