import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTimeRu } from '@/lib/sessions';

type Slot = { startsAt: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateLabel: string;
  slots: Slot[];
  onConfirm: (payload: { capacityTotal?: number | null; isActive: boolean }) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function ScheduleBatchCreateDialog({ open, onOpenChange, dateLabel, slots, onConfirm, isSubmitting, errorMessage }: Props) {
  const [capacity, setCapacity] = useState<string>('');
  const [active, setActive] = useState(true);

  const groupedByHour = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const s of slots) {
      const d = new Date(s.startsAt);
      const h = d.getHours();
      const arr = map.get(h) ?? [];
      arr.push(formatTimeRu(s.startsAt));
      map.set(h, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]).map(([hour, times]) => ({ hour, times: times.sort() }));
  }, [slots]);

  const handleConfirm = () => {
    const cap = capacity.trim() === '' ? undefined : Number.isNaN(Number(capacity)) ? undefined : Math.max(0, Math.floor(Number(capacity)));
    onConfirm({ capacityTotal: cap, isActive: active });
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="h-4 w-4" />
            Создать {slots.length} слотов
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <p className="text-muted-foreground">
            Дата: <span className="font-medium text-foreground">{dateLabel}</span>
          </p>

          <div className="rounded-md border border-border bg-muted/50 p-3 text-[13px] text-foreground space-y-1.5">
            {groupedByHour.map((g) => (
              <div key={g.hour} className="flex gap-2">
                <span className="w-10 shrink-0 font-medium text-muted-foreground">{String(g.hour).padStart(2, '0')}:00</span>
                <span>{g.times.join(', ')}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">Вместимость (мест)</label>
              <Input type="number" min={0} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Авто" />
              <p className="text-[11px] text-muted-foreground">Если пусто — без ограничений.</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">Статус</label>
              <label className="inline-flex items-center gap-2 text-xs">
                <input type="checkbox" className="h-4 w-4 rounded border-input" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Активные слоты
              </label>
              <p className="text-[11px] text-muted-foreground">Отключите для статуса «Пауза».</p>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-1 flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button size="sm" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Создание…' : `Создать ${slots.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
