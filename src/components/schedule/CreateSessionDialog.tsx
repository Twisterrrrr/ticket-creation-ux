import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (session: { startsAt: string; capacity?: number | null }) => void;
};

export function CreateSessionDialog({ open, onOpenChange, onCreate }: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState<string>('');

  const canSubmit = !!date && !!time;

  const handleSubmit = () => {
    const startsAt = new Date(`${date}T${time}:00`).toISOString();
    const cap = capacity === '' ? null : Number(capacity);
    onCreate({ startsAt, capacity: cap });
    onOpenChange(false);
    setDate('');
    setTime('');
    setCapacity('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить сеанс</DialogTitle>
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
            <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Без ограничений" min={1} />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>Создать</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
