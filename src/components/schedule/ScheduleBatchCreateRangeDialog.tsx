import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { pad2 } from '@/lib/sessions';
import { cn } from '@/lib/utils';

type RangeSelectionItem = { dateKey: string; hour: number };

type SessionRow = {
  id: string;
  minute: number;
  quotaType: 'general' | 'custom';
  capacity: string;
};

type HourGroup = {
  hour: number;
  sessions: SessionRow[];
  isOpen: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selection: RangeSelectionItem[];
  onConfirm: (payload: { capacityTotal?: number | null; isActive: boolean; minutesByKey: Record<string, number[]> }) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

function generateId() {
  return Math.random().toString(36).slice(2, 8);
}

function MinutePicker({ value, onChange }: { value: number; onChange: (m: number) => void }) {
  const [open, setOpen] = useState(false);
  const minutes: number[] = [];
  for (let m = 0; m < 60; m++) minutes.push(m);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted transition-colors min-w-[100px] justify-between"
        >
          <span className="text-primary font-medium">{pad2(value)}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-2" align="start">
        <div className="grid grid-cols-4 gap-1">
          {minutes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { onChange(m); setOpen(false); }}
              className={cn(
                "rounded-md px-2 py-1.5 text-xs transition-colors",
                value === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-primary/10"
              )}
            >
              {pad2(m)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ScheduleBatchCreateRangeDialog({ open, onOpenChange, selection, onConfirm, isSubmitting, errorMessage }: Props) {
  const [active, setActive] = useState(true);

  // Group selection items by unique hour
  const uniqueHours = useMemo(() => {
    const hourSet = new Set<number>();
    for (const item of selection) hourSet.add(item.hour);
    return Array.from(hourSet).sort((a, b) => a - b);
  }, [selection]);

  const [hourGroups, setHourGroups] = useState<HourGroup[]>(() =>
    uniqueHours.map((hour) => ({
      hour,
      sessions: [{ id: generateId(), minute: 0, quotaType: 'general' as const, capacity: '' }],
      isOpen: true,
    }))
  );

  // Sync hourGroups if selection changes
  useMemo(() => {
    setHourGroups((prev) => {
      const existingHours = new Set(prev.map((g) => g.hour));
      const newGroups = [...prev];
      for (const h of uniqueHours) {
        if (!existingHours.has(h)) {
          newGroups.push({
            hour: h,
            sessions: [{ id: generateId(), minute: 0, quotaType: 'general', capacity: '' }],
            isOpen: true,
          });
        }
      }
      return newGroups
        .filter((g) => uniqueHours.includes(g.hour))
        .sort((a, b) => a.hour - b.hour);
    });
  }, [uniqueHours]);

  const updateGroup = (hour: number, fn: (g: HourGroup) => HourGroup) => {
    setHourGroups((prev) => prev.map((g) => g.hour === hour ? fn(g) : g));
  };

  const addSession = (hour: number) => {
    updateGroup(hour, (g) => ({
      ...g,
      sessions: [...g.sessions, { id: generateId(), minute: 0, quotaType: 'general', capacity: '' }],
    }));
  };

  const removeSession = (hour: number, sessionId: string) => {
    updateGroup(hour, (g) => ({
      ...g,
      sessions: g.sessions.filter((s) => s.id !== sessionId),
    }));
  };

  const updateSession = (hour: number, sessionId: string, updates: Partial<SessionRow>) => {
    updateGroup(hour, (g) => ({
      ...g,
      sessions: g.sessions.map((s) => s.id === sessionId ? { ...s, ...updates } : s),
    }));
  };

  const toggleGroup = (hour: number) => {
    updateGroup(hour, (g) => ({ ...g, isOpen: !g.isOpen }));
  };

  // Date range label
  const dateRange = useMemo(() => {
    const dates = selection.map((s) => s.dateKey).sort();
    if (!dates.length) return '';
    const first = new Date(`${dates[0]}T00:00:00`);
    const last = new Date(`${dates[dates.length - 1]}T00:00:00`);
    const f = first.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    const l = last.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    return dates[0] === dates[dates.length - 1] ? f : `${f} - ${l}`;
  }, [selection]);

  const totalSessions = useMemo(() => {
    let total = 0;
    const datesByHour = new Map<number, string[]>();
    for (const item of selection) {
      const arr = datesByHour.get(item.hour) ?? [];
      arr.push(item.dateKey);
      datesByHour.set(item.hour, arr);
    }
    for (const g of hourGroups) {
      const dates = datesByHour.get(g.hour) ?? [];
      total += dates.length * g.sessions.length;
    }
    return total;
  }, [hourGroups, selection]);

  const handleConfirm = () => {
    // Validate: each group must have at least one session with a selected minute
    for (const g of hourGroups) {
      if (g.sessions.length === 0) continue;
      for (const s of g.sessions) {
        if (s.minute === undefined || s.minute === null) {
          return;
        }
      }
    }

    // Build minutesByKey: for each selection cell, build the minutes array from the matching hour group
    const minutesByKey: Record<string, number[]> = {};
    for (const item of selection) {
      const key = `${item.dateKey}|${item.hour}`;
      const group = hourGroups.find((g) => g.hour === item.hour);
      if (group) {
        minutesByKey[key] = group.sessions.map((s) => s.minute);
      } else {
        minutesByKey[key] = [0];
      }
    }

    // Use per-session capacity or null
    const firstSession = hourGroups[0]?.sessions[0];
    const cap = firstSession?.capacity?.trim()
      ? Math.max(0, Math.floor(Number(firstSession.capacity)))
      : undefined;

    onConfirm({ capacityTotal: cap, isActive: active, minutesByKey });
  };

  const hasValidationError = hourGroups.some((g) =>
    g.sessions.length > 0 && g.sessions.some((s) => s.minute === undefined || s.minute === null)
  );

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="h-4 w-4" />
            Установить расписание ({dateRange})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1 py-2">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_140px_140px_32px] gap-3 px-1 text-xs font-medium text-muted-foreground">
            <span>Время</span>
            <span>Квота</span>
            <span>Количество мест</span>
            <span />
          </div>

          {hourGroups.map((group) => (
            <div key={group.hour} className="space-y-1">
              {/* Hour header */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm font-semibold">{group.hour} часов</span>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => addSession(group.hour)}
                >
                  Добавить сеанс...
                </button>
              </div>

              {/* Session rows */}
              {group.sessions.map((session) => (
                <div key={session.id} className="grid grid-cols-[1fr_140px_140px_32px] gap-3 items-center px-1">
                  {/* Time (minute picker) */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">{pad2(group.hour)}:</span>
                    <MinutePicker
                      value={session.minute}
                      onChange={(m) => updateSession(group.hour, session.id, { minute: m })}
                    />
                  </div>

                  {/* Quota type */}
                  <Select
                    value={session.quotaType}
                    onValueChange={(v) => updateSession(group.hour, session.id, { quotaType: v as 'general' | 'custom' })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Без квоты</SelectItem>
                      <SelectItem value="custom">Общая квота</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Capacity */}
                  <Input
                    type="number"
                    min={0}
                    className="h-8 text-xs"
                    placeholder="Количество мест"
                    value={session.capacity}
                    onChange={(e) => updateSession(group.hour, session.id, { capacity: e.target.value })}
                  />

                  {/* Remove */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={() => removeSession(group.hour, session.id)}
                    disabled={group.sessions.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}

              {group.sessions.length === 0 && (
                <p className="text-xs text-destructive px-1">Необходимо заполнить</p>
              )}
            </div>
          ))}
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button size="sm" onClick={handleConfirm} disabled={isSubmitting || !selection.length}>
            {isSubmitting ? 'Создание…' : `Сохранить`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
