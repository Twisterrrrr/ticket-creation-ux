import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, LayoutGrid, List, Lock, Pencil, Plus, RefreshCcw, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { AdminEventSessionRow } from '@/components/schedule/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateRu, formatTimeRu, isoToDateInput, pad2 } from '@/lib/sessions';
import { ScheduleGridDay, type ScheduleGridSelection } from '@/components/schedule/ScheduleGridDay';
import { ScheduleGridRange, type ScheduleGridRangeSelection } from '@/components/schedule/ScheduleGridRange';
import { ScheduleBatchCreateDialog } from '@/components/schedule/ScheduleBatchCreateDialog';
import { ScheduleBatchCreateRangeDialog } from '@/components/schedule/ScheduleBatchCreateRangeDialog';
import { CreateSessionDialog } from '@/components/schedule/CreateSessionDialog';
import { EditSessionDialog } from '@/components/schedule/EditSessionDialog';
import { BulkEditTimeDialog } from '@/components/schedule/BulkEditTimeDialog';
import { DeleteSessionDialog } from '@/components/schedule/DeleteSessionDialog';
import { CancelSessionDialog } from '@/components/schedule/CancelSessionDialog';
import { MoveSessionDialog } from '@/components/schedule/MoveSessionDialog';
import { SessionActionBar } from '@/components/schedule/SessionActionBar';
import { DragLayer } from '@/components/schedule/DragLayer';
import { useSessionDrag } from '@/components/schedule/useSessionDrag';

const STORAGE_KEY = 'schedule-sessions';

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(from: string, to: string): number {
  const f = new Date(`${from}T00:00:00`).getTime();
  const t = new Date(`${to}T00:00:00`).getTime();
  return Math.max(1, Math.round((t - f) / 86400000) + 1);
}

function lockLabel(reason?: string) {
  switch (reason) {
    case 'SOLD': return 'Есть продажи';
    case 'PAST': return 'Прошло';
    default: return 'Заблокировано';
  }
}

function lockTooltip(reason?: string) {
  switch (reason) {
    case 'SOLD': return 'Нельзя менять/удалять: есть продажи.';
    case 'PAST': return 'Нельзя менять/удалять: сеанс уже прошёл.';
    default: return 'Действие недоступно.';
  }
}

function generateId() {
  return crypto.randomUUID();
}

export function ScheduleTab() {
  const [sessions, setSessions] = useState<AdminEventSessionRow[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const [from, setFrom] = useState<string>(() => isoToday());
  const [to, setTo] = useState<string>(() => addDaysIso(isoToday(), 14));
  const [rangePreset, setRangePreset] = useState<'day' | '7' | '14' | '30' | 'custom'>('14');
  const [editing, setEditing] = useState<AdminEventSessionRow | null>(null);
  const [deleting, setDeleting] = useState<AdminEventSessionRow | null>(null);
  const [stopping, setStopping] = useState<AdminEventSessionRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectionDay, setSelectionDay] = useState<ScheduleGridSelection>(new Set());
  const [selectionRange, setSelectionRange] = useState<ScheduleGridRangeSelection>(new Set());
  const [batchOpenDay, setBatchOpenDay] = useState(false);
  const [batchOpenRange, setBatchOpenRange] = useState(false);

  // Selected sessions for action bar (multi-select)
  const [selectedSessions, setSelectedSessions] = useState<AdminEventSessionRow[]>([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);


  // Move session dialog state
  const [moveDialog, setMoveDialog] = useState<{
    sessionId: string;
    sessionStartsAt: string;
    newDateKey: string;
    newHour: number;
  } | null>(null);

  const gridDetailMode = rangePreset === 'day' ? 'day' : 'range';

  const rangeDays = useMemo(() => {
    if (rangePreset === 'day') return 1;
    return diffDays(from, to);
  }, [from, to, rangePreset]);

  const rows = useMemo(() => {
    return sessions.filter((s) => {
      const d = isoToDateInput(s.startsAt);
      if (d < from || d > to) return false;
      if (!includeCancelled && s.isCancelled) return false;
      return true;
    });
  }, [sessions, from, to, includeCancelled]);

  const cancelledCount = useMemo(() => sessions.filter((s) => {
    const d = isoToDateInput(s.startsAt);
    return d >= from && d <= to && s.isCancelled;
  }).length, [sessions, from, to]);

  useEffect(() => { setSelectionDay(new Set()); }, [from]);
  useEffect(() => { setSelectionRange(new Set()); }, [from, rangeDays]);

  const gridConfig = useMemo(() => ({ slotMinutes: 15, slotPx: 24, dayStartHour: 0, dayEndHourExclusive: 24 }), []);
  const todayDateStr = isoToday();

  const intervalsForDay = useMemo(() => {
    return rows.filter((r) => isoToDateInput(r.startsAt) === todayDateStr).map((r) => ({
      sessionId: r.id,
      startMs: new Date(r.startsAt).getTime(),
      endMs: r.endsAt ? new Date(r.endsAt).getTime() : new Date(r.startsAt).getTime() + gridConfig.slotMinutes * 60_000,
      isCancelled: r.isCancelled,
      isLocked: !!r.locked,
    }));
  }, [rows, gridConfig.slotMinutes, todayDateStr]);

  const { drag, onSessionPointerDown, cancelDrag: _cancelDrag } = useSessionDrag({
    config: gridConfig,
    intervalsForDay,
    canDragSession: (sessionId) => {
      const s = rows.find((r) => r.id === sessionId);
      return !!s && !s.locked && !s.isCancelled;
    },
    getSessionById: (sessionId) => {
      const s = rows.find((r) => r.id === sessionId);
      if (!s) return null;
      const index = rows.findIndex((r) => r.id === sessionId);
      return {
        startIso: s.startsAt,
        endIso: s.endsAt ?? undefined,
        topPx: 240 + index * 40,
        leftPx: 200,
        widthPx: 260,
        heightPx: 32,
        dayDate: isoToDateInput(s.startsAt),
      };
    },
    onDropValid: (sessionId) => {
      const s = rows.find((r) => r.id === sessionId);
      if (s) setEditing(s);
    },
  });

  // Day grid handlers
  const handleSelectSlotDay = (startsAtIso: string) => {
    setSelectionDay((prev) => { const next = new Set(prev); next.add(startsAtIso); return next; });
  };
  const handleDeselectSlotDay = (startsAtIso: string) => {
    setSelectionDay((prev) => { const next = new Set(prev); next.delete(startsAtIso); return next; });
  };
  const handleToggleSlotDay = (startsAtIso: string) => {
    setSelectionDay((prev) => {
      const next = new Set(prev);
      next.has(startsAtIso) ? next.delete(startsAtIso) : next.add(startsAtIso);
      return next;
    });
  };

  // Range grid handlers
  const handleSelectCellRange = (key: string) => {
    setSelectionRange((prev) => { const next = new Set(prev); next.add(key); return next; });
  };
  const handleDeselectCellRange = (key: string) => {
    setSelectionRange((prev) => { const next = new Set(prev); next.delete(key); return next; });
  };
  const handleToggleCellRange = (key: string) => {
    setSelectionRange((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };


  // Select session (toggle multi-select for action bar)
  const handleSelectSession = (session: AdminEventSessionRow) => {
    setSelectedSessions((prev) => {
      const exists = prev.find((s) => s.id === session.id);
      if (exists) return prev.filter((s) => s.id !== session.id);
      return [...prev, session];
    });
  };

  // Move session handler (from grid drag-and-drop)
  const handleMoveSession = (sessionId: string, newDateKey: string, newHour: number) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    if ((session.soldCount ?? 0) > 0) {
      toast.error('Нельзя перенести сеанс с продажами');
      return;
    }
    setMoveDialog({ sessionId, sessionStartsAt: session.startsAt, newDateKey, newHour });
  };

  const confirmMoveSession = () => {
    if (!moveDialog) return;
    const { sessionId, newDateKey, newHour } = moveDialog;
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const oldDate = new Date(session.startsAt);
    const minutes = oldDate.getMinutes();
    const newIso = new Date(`${newDateKey}T${pad2(newHour)}:${pad2(minutes)}:00`).toISOString();
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, startsAt: newIso } : s));
    toast.success('Сеанс перенесён');
    setMoveDialog(null);
  };

  const addSession = (data: { startsAt: string; capacity?: number | null }) => {
    const newSession: AdminEventSessionRow = {
      id: generateId(),
      startsAt: data.startsAt,
      capacity: data.capacity,
      soldCount: 0,
      locked: false,
      isCancelled: false,
    };
    setSessions((prev) => [...prev, newSession]);
    toast.success('Сеанс создан');
  };

  const updateSession = (sessionId: string, data: { startsAt: string; capacity?: number | null }) => {
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, startsAt: data.startsAt, capacity: data.capacity } : s));
    toast.success('Сеанс обновлён');
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setSelectedSessions([]);
    toast.success('Сеанс удалён');
  };

  const cancelSession = (sessionId: string, reason?: string) => {
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, isCancelled: true, canceledAt: new Date().toISOString(), cancelReason: reason } : s));
    setSelectedSessions([]);
    toast.success('Сеанс отменён');
  };

  const bulkUpdateTime = (sessionIds: string[], newTime: string) => {
    setSessions((prev) => prev.map((s) => {
      if (!sessionIds.includes(s.id)) return s;
      const d = new Date(s.startsAt);
      const [h, m] = newTime.split(':').map(Number);
      d.setHours(h, m, 0, 0);
      return { ...s, startsAt: d.toISOString() };
    }));
    setSelectedSessions([]);
    toast.success(`Время изменено для ${sessionIds.length} сеансов`);
  };


  const handleBatchConfirmDay = (params: { capacityTotal?: number | null; isActive: boolean }) => {
    if (!selectionDay.size) { setBatchOpenDay(false); return; }
    const newSessions: AdminEventSessionRow[] = [];
    for (const startsAt of selectionDay) {
      newSessions.push({
        id: generateId(),
        startsAt,
        capacity: params.capacityTotal ?? null,
        soldCount: 0,
        locked: false,
        isCancelled: false,
      });
    }
    setSessions((prev) => [...prev, ...newSessions]);
    toast.success(`Создано сеансов: ${newSessions.length}`);
    setSelectionDay(new Set());
    setBatchOpenDay(false);
  };

  const handleBatchConfirmRange = (params: { capacityTotal?: number | null; isActive: boolean; minutesByKey: Record<string, number[]> }) => {
    const selArr = Array.from(selectionRange);
    if (!selArr.length) { setBatchOpenRange(false); return; }
    const newSessions: AdminEventSessionRow[] = [];
    for (const key of selArr) {
      const [dateKey, hourStr] = key.split('|');
      const hour = Number.parseInt(hourStr, 10);
      const minutes = params.minutesByKey[key]?.length > 0 ? params.minutesByKey[key] : [0];
      for (const m of minutes) {
        newSessions.push({
          id: generateId(),
          startsAt: new Date(`${dateKey}T${pad2(hour)}:${pad2(m)}:00`).toISOString(),
          capacity: params.capacityTotal ?? null,
          soldCount: 0,
          locked: false,
          isCancelled: false,
        });
      }
    }
    setSessions((prev) => [...prev, ...newSessions]);
    toast.success(`Создано сеансов: ${newSessions.length}`);
    setSelectionRange(new Set());
    setBatchOpenRange(false);
  };

  const selectedDate = from;

  const showBatchBarDay = selectionDay.size > 0;
  const showBatchBarRange = selectionRange.size > 0;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Расписание
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-1 py-0.5 text-[10px] text-muted-foreground">
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-3 w-3" /> Сетка
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-3 w-3" /> Таблица
                </button>
              </div>

              <Button variant="default" size="sm" className="gap-2" onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /> Добавить сеанс
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-1 py-0.5 text-[10px] text-muted-foreground">
              {([
                { key: 'day' as const, label: 'День', days: 1 },
                { key: '7' as const, label: '7 дней', days: 7 },
                { key: '14' as const, label: '14 дней', days: 14 },
                { key: '30' as const, label: '30 дней', days: 30 },
                { key: 'custom' as const, label: 'Произвольно', days: 0 },
              ]).map(({ key, label, days }) => (
                <button
                  key={key}
                  type="button"
                  className={`rounded-full px-2 py-0.5 ${rangePreset === key ? 'bg-background text-foreground shadow-sm' : ''}`}
                  onClick={() => {
                    setRangePreset(key);
                    setSelectionDay(new Set());
                    setSelectionRange(new Set());
                    setSelectedSessions([]);
                    if (days > 0) {
                      setFrom(isoToday());
                      setTo(addDaysIso(isoToday(), days - 1));
                    }
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {rangePreset === 'custom' && (
              <div className="flex items-center gap-2 text-sm">
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[150px] text-xs" />
                <span className="text-muted-foreground">—</span>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[150px] text-xs" />
              </div>
            )}

            {rangePreset === 'day' && (
              <div className="flex items-center gap-2 text-sm">
                <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setTo(e.target.value); }} className="w-[150px] text-xs" />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-input bg-background"
                checked={includeCancelled}
                onChange={(e) => setIncludeCancelled(e.target.checked)}
              />
              <span>Показывать отменённые{cancelledCount > 0 ? ` (${cancelledCount})` : ''}</span>
            </label>
          </div>
        </CardHeader>

        <CardContent>
          {/* Session action bar */}
          {selectedSessions.length > 0 && (
            <div className="mb-3">
              <SessionActionBar
                sessions={selectedSessions}
                onDeselect={() => setSelectedSessions([])}
                onAdd={() => {
                  setCreating(true);
                }}
                onEdit={() => {
                  if (selectedSessions.length === 1) {
                    const s = selectedSessions[0];
                    const hasSold = (s.soldCount ?? 0) > 0;
                    if (hasSold) {
                      toast.info('Перенос будет выполнен с автоматическим уведомлением покупателям');
                    }
                    setEditing(s);
                  } else {
                    setBulkEditOpen(true);
                  }
                }}
                onStop={() => {
                  if (selectedSessions.length === 1) setStopping(selectedSessions[0]);
                  else {
                    for (const s of selectedSessions) cancelSession(s.id);
                  }
                }}
                onDelete={() => {
                  if (selectedSessions.length === 1) {
                    const s = selectedSessions[0];
                    if ((s.soldCount ?? 0) > 0) {
                      toast.error('Удаление возможно только после осуществления возвратов через админа');
                      return;
                    }
                    setDeleting(s);
                  } else {
                    const withSold = selectedSessions.filter((s) => (s.soldCount ?? 0) > 0);
                    if (withSold.length) {
                      toast.error(`${withSold.length} сеансов с продажами — удаление невозможно`);
                      return;
                    }
                    for (const s of selectedSessions) deleteSession(s.id);
                  }
                }}
              />
            </div>
          )}

          {rows.length === 0 && viewMode === 'table' && (
            <div className="text-sm text-muted-foreground">В выбранном диапазоне сеансов нет.</div>
          )}

          {viewMode === 'grid' && (
            <>
              {gridDetailMode === 'day' && (
                <>
                  <ScheduleGridDay
                    date={selectedDate}
                    sessions={rows}
                    selection={selectionDay}
                    selectedSessionId={selectedSession?.id ?? null}
                    onToggleSlot={handleToggleSlotDay}
                    onSelectSlot={handleSelectSlotDay}
                    onDeselectSlot={handleDeselectSlotDay}
                    onSelectSession={handleSelectSession}
                  />
                  {showBatchBarDay && (
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div>
                        <span>Новых слотов: <span className="font-medium text-foreground">{selectionDay.size}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setSelectionDay(new Set()); }}>Очистить выбор</Button>
                        <Button variant="default" size="sm" onClick={() => setBatchOpenDay(true)}>Добавить</Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {gridDetailMode === 'range' && (
                <>
                  <ScheduleGridRange
                    fromDateKey={from}
                    days={rangeDays}
                    hoursStart={0}
                    hoursEnd={23}
                    sessions={rows}
                    selection={selectionRange}
                    selectedSessionId={selectedSession?.id ?? null}
                    onToggleCell={handleToggleCellRange}
                    onSelectCell={handleSelectCellRange}
                    onDeselectCell={handleDeselectCellRange}
                    onSelectSession={handleSelectSession}
                    onMoveSession={handleMoveSession}
                  />
                  {showBatchBarRange && (
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div>
                        <span>Новых часов: <span className="font-medium text-foreground">{selectionRange.size}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setSelectionRange(new Set()); }}>Очистить выбор</Button>
                        <Button variant="default" size="sm" onClick={() => setBatchOpenRange(true)}>Добавить</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {viewMode === 'table' && rows.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Время</TableHead>
                    <TableHead className="text-right">Вместимость</TableHead>
                    <TableHead className="text-right">Продано</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const date = formatDateRu(r.startsAt);
                    const time = formatTimeRu(r.startsAt);
                    const cap = r.capacity ?? '—';
                    const sold = r.soldCount ?? 0;
                    const locked = !!r.locked;
                    const isCancelled = !!r.isCancelled;
                    const reason = r.lockReason;

                    let statusBadge;
                    if (isCancelled) {
                      statusBadge = (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" /> Отменён
                            </Badge>
                          </TooltipTrigger>
                          {r.cancelReason && <TooltipContent><p>Причина: {r.cancelReason}</p></TooltipContent>}
                        </Tooltip>
                      );
                    } else if (locked) {
                      statusBadge = (
                        <Badge variant="destructive" className="gap-1">
                          <Lock className="h-3 w-3" /> {lockLabel(reason)}
                        </Badge>
                      );
                    } else {
                      statusBadge = <Badge variant="outline">Можно редактировать</Badge>;
                    }

                    const canEdit = !locked && !isCancelled;
                    const canCancel = !locked && !isCancelled;
                    const canDelete = isCancelled ? r.soldCount === 0 : !locked;

                    return (
                      <TableRow
                        key={r.id}
                        className={isCancelled ? 'opacity-60' : undefined}
                        onPointerDown={(e) => onSessionPointerDown(e as any, r.id)}
                      >
                        <TableCell className="font-medium">{date}</TableCell>
                        <TableCell>{time}</TableCell>
                        <TableCell className="text-right">{cap}</TableCell>
                        <TableCell className="text-right">{sold}</TableCell>
                        <TableCell>{statusBadge}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button variant="outline" size="sm" disabled={!canEdit} onClick={() => setEditing(r)} className="gap-2">
                                    <Pencil className="h-4 w-4" /> Изменить
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!canEdit && <TooltipContent>{lockTooltip(reason)}</TooltipContent>}
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button variant="outline" size="sm" disabled={!canCancel} onClick={() => setStopping(r)} className="gap-2">
                                    <XCircle className="h-4 w-4" /> Отменить
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!canCancel && <TooltipContent>{lockTooltip(reason)}</TooltipContent>}
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button variant="destructive" size="sm" disabled={!canDelete} onClick={() => setDeleting(r)} className="gap-2">
                                    <Trash2 className="h-4 w-4" /> Удалить
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!canDelete && <TooltipContent>{lockTooltip(reason)}</TooltipContent>}
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {batchOpenDay && (
        <ScheduleBatchCreateDialog
          open={batchOpenDay}
          onOpenChange={(open) => { setBatchOpenDay(open); }}
          dateLabel={formatDateRu(`${selectedDate}T00:00:00Z`)}
          slots={Array.from(selectionDay).map((startsAt) => ({ startsAt }))}
          onConfirm={handleBatchConfirmDay}
        />
      )}

      {batchOpenRange && (
        <ScheduleBatchCreateRangeDialog
          open={batchOpenRange}
          onOpenChange={(open) => { setBatchOpenRange(open); }}
          selection={Array.from(selectionRange).map((key) => {
            const [dateKey, hourStr] = key.split('|');
            return { dateKey, hour: Number.parseInt(hourStr, 10) };
          })}
          onConfirm={handleBatchConfirmRange}
        />
      )}

      <EditSessionDialog
        open={!!editing}
        onOpenChange={(open) => { if (!open) setEditing(null); }}
        session={editing}
        defaultStartIso={drag.phase === 'dragging' && drag.sessionId === editing?.id ? drag.proposed.startIso : undefined}
        onSave={updateSession}
      />

      <DeleteSessionDialog
        open={!!deleting}
        onOpenChange={(open) => { if (!open) setDeleting(null); }}
        session={deleting}
        onDelete={deleteSession}
      />

      <CancelSessionDialog
        open={!!stopping}
        onOpenChange={(open) => { if (!open) setStopping(null); }}
        session={stopping}
        onCancel={cancelSession}
      />

      <CreateSessionDialog
        open={creating}
        onOpenChange={(open) => { if (!open) setCreating(false); }}
        onCreate={addSession}
      />

      {moveDialog && (
        <MoveSessionDialog
          open={!!moveDialog}
          onOpenChange={(open) => { if (!open) setMoveDialog(null); }}
          sessionStartsAt={moveDialog.sessionStartsAt}
          newDateKey={moveDialog.newDateKey}
          newHour={moveDialog.newHour}
          onConfirm={confirmMoveSession}
        />
      )}

      <DragLayer drag={drag} />
    </TooltipProvider>
  );
}
