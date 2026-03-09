import { useCallback, useMemo, useRef, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import type { AdminEventSessionRow } from '@/components/schedule/types';
import { formatTimeRu, pad2 } from '@/lib/sessions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type ScheduleGridRangeSelection = Set<string>;

type Props = {
  fromDateKey: string;
  days: number;
  hoursStart: number;
  hoursEnd: number;
  sessions: AdminEventSessionRow[];
  selection: ScheduleGridRangeSelection;
  selectedSessionId: string | null;
  onToggleCell: (key: string) => void;
  onSelectCell: (key: string) => void;
  onDeselectCell: (key: string) => void;
  onSelectSession: (session: AdminEventSessionRow) => void;
  onMoveSession?: (sessionId: string, newDateKey: string, newHour: number) => void;
};

type HourAgg = {
  sessions: AdminEventSessionRow[];
};

function buildDateKeys(fromDateKey: string, days: number): string[] {
  const result: string[] = [];
  const [y, m, d] = fromDateKey.split('-').map((v) => Number.parseInt(v, 10));
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return result;
  const base = new Date(y, m - 1, d, 0, 0, 0, 0);
  for (let i = 0; i < days; i += 1) {
    const dt = new Date(base);
    dt.setDate(base.getDate() + i);
    const key = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
    result.push(key);
  }
  return result;
}

function buildHours(): number[] {
  const hours: number[] = [];
  for (let h = 0; h <= 23; h += 1) hours.push(h);
  return hours;
}

function formatDateKeyRu(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', weekday: 'short' });
}

export function ScheduleGridRange({ fromDateKey, days, hoursStart, hoursEnd, sessions, selection, selectedSessionId, onToggleCell, onSelectCell, onDeselectCell, onSelectSession, onMoveSession }: Props) {
  const dateKeys = useMemo(() => buildDateKeys(fromDateKey, days), [fromDateKey, days]);
  const hours = useMemo(() => buildHours(), []);

  const [isDragging, setIsDragging] = useState(false);
  const dragModeRef = useRef<'select' | 'deselect' | null>(null);

  const [dragSession, setDragSession] = useState<{ sessionId: string; originKey: string } | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  const rangeLabel = useMemo(() => {
    if (!dateKeys.length) return '';
    const start = new Date(`${dateKeys[0]}T00:00:00`);
    const end = new Date(`${dateKeys[dateKeys.length - 1]}T00:00:00`);
    const startLabel = start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    const endLabel = end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    return `${startLabel} — ${endLabel}`;
  }, [dateKeys]);

  const aggByKey = useMemo(() => {
    const map = new Map<string, HourAgg>();
    for (const s of sessions) {
      const d = new Date(s.startsAt);
      const dateKey = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      const hour = d.getHours();
      const key = `${dateKey}|${hour}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { sessions: [s] });
      } else {
        map.set(key, { sessions: [...existing.sessions, s] });
      }
    }
    return map;
  }, [sessions]);

  const handlePointerDown = useCallback((e: React.PointerEvent, cellKey: string) => {
    if (e.button === 2) {
      e.preventDefault();
      dragModeRef.current = 'deselect';
      setIsDragging(true);
      onDeselectCell(cellKey);
      return;
    }
    if (e.button === 0) {
      dragModeRef.current = 'select';
      setIsDragging(true);
      onSelectCell(cellKey);
    }
  }, [onSelectCell, onDeselectCell]);

  const handlePointerOver = useCallback((cellKey: string) => {
    if (!isDragging || !dragModeRef.current) return;
    if (dragModeRef.current === 'select') {
      onSelectCell(cellKey);
    } else {
      onDeselectCell(cellKey);
    }
  }, [isDragging, onSelectCell, onDeselectCell]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragModeRef.current = null;
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleSessionDragStart = useCallback((e: React.DragEvent, sessionId: string, originKey: string, hasSold: boolean) => {
    if (hasSold) { e.preventDefault(); return; }
    e.dataTransfer.effectAllowed = 'move';
    setDragSession({ sessionId, originKey });
  }, []);

  const handleCellDragOver = useCallback((e: React.DragEvent, cellKey: string) => {
    if (!dragSession) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell(cellKey);
  }, [dragSession]);

  const handleCellDragLeave = useCallback(() => { setDragOverCell(null); }, []);

  const handleCellDrop = useCallback((e: React.DragEvent, cellKey: string) => {
    e.preventDefault();
    setDragOverCell(null);
    if (!dragSession || !onMoveSession) return;
    if (cellKey === dragSession.originKey) { setDragSession(null); return; }
    const [dateKey, hourStr] = cellKey.split('|');
    onMoveSession(dragSession.sessionId, dateKey, Number.parseInt(hourStr, 10));
    setDragSession(null);
  }, [dragSession, onMoveSession]);

  const handleDragEnd = useCallback(() => {
    setDragSession(null);
    setDragOverCell(null);
  }, []);

  return (
    <div
      className="mt-4 rounded-lg border border-border select-none"
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-3.5 w-3.5" />
          <span>Сетка по дням и часам</span>
          {rangeLabel && <span className="text-[11px]">{rangeLabel}</span>}
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Выбранный час
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            Уже есть сеансы
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-t border-border text-[11px]">
          <thead>
            <tr>
              <th className="w-20 border-r border-border bg-muted/50 px-1 py-1 text-left text-[10px] font-medium text-muted-foreground">
                Дата
              </th>
              {hours.map((h) => (
                <th key={h} className="border-r border-border bg-muted/50 px-0 py-1 text-center text-[10px] font-medium text-muted-foreground">
                  {pad2(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dateKeys.map((dateKey) => (
              <tr key={dateKey}>
                <td className="border-r border-t border-border bg-muted/50 px-2 py-1 text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatDateKeyRu(dateKey)}
                </td>
                {hours.map((h) => {
                  const cellKey = `${dateKey}|${h}`;
                  const agg = aggByKey.get(cellKey);
                  const selected = selection.has(cellKey);
                  const hasSessions = !!agg;
                  const isDropTarget = dragOverCell === cellKey;
                  const sessionCount = agg?.sessions.length ?? 0;

                  return (
                    <td
                      key={h}
                      className={`relative border-t border-r border-border px-0.5 py-0.5 align-top min-w-[44px] ${isDropTarget ? 'bg-primary/20' : ''}`}
                      onDragOver={(e) => handleCellDragOver(e, cellKey)}
                      onDragLeave={handleCellDragLeave}
                      onDrop={(e) => handleCellDrop(e, cellKey)}
                    >
                      {hasSessions ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`grid gap-0.5 ${agg.sessions.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {agg.sessions.map((s) => {
                                const isActive = selectedSessionId === s.id;
                                const sold = s.soldCount ?? 0;
                                const cap = s.capacity ?? '∞';
                                const hasSold = sold > 0;
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    draggable={!hasSold}
                                    onDragStart={(e) => handleSessionDragStart(e, s.id, cellKey, hasSold)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => onSelectSession(s)}
                                    className={`flex items-center justify-center rounded border px-0.5 py-0.5 text-[9px] transition-colors ${
                                      isActive
                                        ? 'border-primary bg-primary/20 text-primary ring-1 ring-primary'
                                        : s.isCancelled
                                          ? 'border-destructive/40 bg-destructive/5 text-destructive line-through'
                                          : 'border-muted-foreground/40 bg-muted text-foreground hover:bg-muted/80'
                                    } ${!hasSold ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                  >
                                    <span className="flex flex-col items-center leading-tight">
                                      <span>{formatTimeRu(s.startsAt)}</span>
                                      <span className="text-[8px] opacity-70">{sold} / {cap}</span>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span className="text-[11px]">
                              {agg.sessions.map((s) => `${formatTimeRu(s.startsAt)} — ${s.soldCount ?? 0}/${s.capacity ?? '∞'}`).join(', ')}
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <button
                          type="button"
                          className={`flex h-8 w-full items-center justify-center rounded border text-[10px] transition-colors ${
                            selected
                              ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
                              : 'border-dashed border-border text-muted-foreground/30 hover:border-primary/50 hover:text-primary'
                          }`}
                          onPointerDown={(e) => handlePointerDown(e, cellKey)}
                          onPointerOver={() => handlePointerOver(cellKey)}
                          onDragOver={(e) => handleCellDragOver(e, cellKey)}
                          onDragLeave={handleCellDragLeave}
                          onDrop={(e) => handleCellDrop(e, cellKey)}
                        >
                          {selected ? <span className="font-medium">+</span> : null}
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
