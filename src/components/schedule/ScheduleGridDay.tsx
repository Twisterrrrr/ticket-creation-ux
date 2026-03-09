import { useCallback, useMemo, useRef, useState } from 'react';
import { CalendarClock, Plus } from 'lucide-react';
import type { AdminEventSessionRow } from '@/components/schedule/types';
import { formatTimeRu, isoToDateInput } from '@/lib/sessions';

export type ScheduleGridSelection = Set<string>;

type Props = {
  date: string;
  sessions: AdminEventSessionRow[];
  selection: ScheduleGridSelection;
  onToggleSlot: (startsAtIso: string) => void;
  onSelectSlot: (startsAtIso: string) => void;
  onDeselectSlot: (startsAtIso: string) => void;
  onEditSession: (session: AdminEventSessionRow) => void;
};

const GRID_HOURS: number[] = [];
for (let h = 0; h <= 23; h += 1) GRID_HOURS.push(h);
const STEP_MINUTES = 15;

export function ScheduleGridDay({ date, sessions, selection, onToggleSlot, onSelectSlot, onDeselectSlot, onEditSession }: Props) {
  const minutesRows = useMemo(() => {
    const rows: number[] = [];
    for (let m = 0; m < 60; m += STEP_MINUTES) rows.push(m);
    return rows;
  }, []);

  const [hoverHour, setHoverHour] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragModeRef = useRef<'select' | 'deselect' | null>(null);

  const sessionsByKey = useMemo(() => {
    const map = new Map<string, AdminEventSessionRow>();
    for (const s of sessions) {
      if (isoToDateInput(s.startsAt) !== date) continue;
      const d = new Date(s.startsAt);
      const key = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, s);
    }
    return map;
  }, [sessions, date]);

  const makeIso = (hour: number, minute: number) =>
    new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`).toISOString();

  const handleCellClick = (hour: number, minute: number) => {
    const key = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const session = sessionsByKey.get(key);
    if (session) {
      onEditSession(session);
    }
  };

  const handlePointerDown = useCallback((e: React.PointerEvent, hour: number, minute: number) => {
    const key = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    if (sessionsByKey.has(key)) return;

    const iso = makeIso(hour, minute);

    if (e.button === 2) {
      e.preventDefault();
      dragModeRef.current = 'deselect';
      setIsDragging(true);
      onDeselectSlot(iso);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      return;
    }
    if (e.button === 0) {
      dragModeRef.current = 'select';
      setIsDragging(true);
      onSelectSlot(iso);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }
  }, [sessionsByKey, onSelectSlot, onDeselectSlot]);

  const handlePointerEnter = useCallback((hour: number, minute: number) => {
    if (!isDragging || !dragModeRef.current) return;
    const key = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    if (sessionsByKey.has(key)) return;
    const iso = makeIso(hour, minute);
    if (dragModeRef.current === 'select') {
      onSelectSlot(iso);
    } else {
      onDeselectSlot(iso);
    }
  }, [isDragging, sessionsByKey, onSelectSlot, onDeselectSlot]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragModeRef.current = null;
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const isSelected = (hour: number, minute: number) => {
    const iso = makeIso(hour, minute);
    return selection.has(iso);
  };

  const headerDateLabel = useMemo(() => {
    const d = new Date(`${date}T00:00:00`);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  }, [date]);

  return (
    <div
      className="mt-4 rounded-lg border border-border select-none"
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-3.5 w-3.5" />
          <span>Сетка за день</span>
          <span className="font-medium text-foreground">{headerDateLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Слот к созданию
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            Уже созданный сеанс
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-t border-border text-[11px]">
          <thead>
            <tr>
              <th className="w-16 border-r border-border bg-muted/50 px-2 py-1 text-left text-[10px] font-medium text-muted-foreground">
                Время
              </th>
              {GRID_HOURS.map((h) => (
                <th
                  key={h}
                  className="min-w-[56px] border-r border-border bg-muted/50 px-2 py-1 text-center text-[10px] font-medium text-muted-foreground"
                  onMouseEnter={() => setHoverHour(h)}
                  onMouseLeave={() => setHoverHour((prev) => (prev === h ? null : prev))}
                >
                  {h.toString().padStart(2, '0')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {minutesRows.map((minute) => (
              <tr key={minute}>
                <td className="border-r border-t border-border bg-muted/50 px-2 py-1 text-[10px] text-muted-foreground">
                  {minute.toString().padStart(2, '0')}
                </td>
                {GRID_HOURS.map((hour) => {
                  const key = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                  const session = sessionsByKey.get(key);
                  const selected = isSelected(hour, minute);

                  return (
                    <td
                      key={hour}
                      className={`border-t border-r border-border px-0.5 py-0.5 align-top ${hoverHour === hour ? 'bg-muted/30' : ''}`}
                    >
                      {session ? (
                        <button
                          type="button"
                          onClick={() => handleCellClick(hour, minute)}
                          className="flex h-7 w-full items-center justify-center rounded border border-muted-foreground/40 bg-muted text-foreground hover:bg-muted/80 text-[10px] transition-colors"
                          title={`${formatTimeRu(session.startsAt)} · ${session.capacity ?? '—'} мест · продано ${session.soldCount}`}
                        >
                          <span className="truncate">{formatTimeRu(session.startsAt)}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onPointerDown={(e) => handlePointerDown(e, hour, minute)}
                          onPointerEnter={() => handlePointerEnter(hour, minute)}
                          className={`flex h-7 w-full items-center justify-center rounded border text-[10px] transition-colors ${
                            selected
                              ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
                              : 'border-dashed border-border text-muted-foreground/30 hover:border-primary/50 hover:text-primary'
                          }`}
                          title="Создать слот"
                        >
                          {selected ? <Plus className="h-3 w-3" /> : null}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
