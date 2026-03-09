import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminEventSessionRow } from '@/components/schedule/types';
import { isoToDateInput, isoToTimeInput } from '@/lib/sessions';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: AdminEventSessionRow | null;
  defaultStartIso?: string;
  onSave: (sessionId: string, data: { startsAt: string; capacity?: number | null }) => void;
};

export function EditSessionDialog({ open, onOpenChange, session, defaultStartIso, onSave }: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState<string>('');

  const soldCount = session?.soldCount ?? 0;

  useEffect(() => {
    if (!session) return;
    const startIso = defaultStartIso ?? session.startsAt;
    setDate(isoToDateInput(startIso));
    setTime(isoToTimeInput(startIso));
    setCapacity(session.capacity == null ? '' : String(session.capacity));
  }, [session, defaultStartIso]);

  const canSubmit = useMemo(() => {
    if (!date || !time) return false;
    if (capacity !== '' && Number.isNaN(Number(capacity))) return false;
    if (capacity !== '' && Number(capacity) < soldCount) return false;
    return true;
  }, [date, time, capacity, soldCount]);

  const handleSave = () => {
    if (!session) return;
    const startsAt = new Date(`${date}T${time}:00`).toISOString();
    const cap = capacity === '' ? null : Number(capacity);
    onSave(session.id, { startsAt, capacity: cap });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Изменить сеанс</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Дата</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Время</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Вместимость</Label>
            <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="—" min={soldCount} />
            {capacity !== '' && Number(capacity) < soldCount && (
              <div className="text-xs text-destructive">Нельзя меньше проданного: {soldCount}</div>
            )}
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={handleSave} disabled={!canSubmit}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
