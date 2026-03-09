// Session utility functions

export type LockReason = 'SOLD' | 'PAST' | 'IMPORTED' | 'OTHER';

export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatDateRu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTimeRu(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function isoToTimeInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function buildIsoFromInputs(date: string, time: string): string {
  const local = new Date(`${date}T${time}:00`);
  if (Number.isNaN(local.getTime())) {
    throw new Error(`Invalid date/time: ${date} ${time}`);
  }
  return local.toISOString();
}

export function getSessionLockedMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return 'Действие недоступно';
}
