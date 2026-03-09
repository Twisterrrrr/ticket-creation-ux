import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminEventSessionRow } from '@/components/schedule/types';
import { formatDateRu, formatTimeRu } from '@/lib/sessions';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: AdminEventSessionRow[];
  onSave: (sessionIds: string[], newTime: string) => void;
};

export function BulkEditTimeDialog({ open, onOpenChange, sessions, onSave }: Props) {
  const [time, setTime] = useState('');

  const canSubmit = useMemo(() => !!time, [time]);

  const handleSave = () => {
    if (!canSubmit) return;
    onSave(sessions.map((s) => s.id), time);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Изменить время для {sessions.length} сеансов</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Новое время начала</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="rounded-md border border-border p-3 max-h-[200px] overflow-y-auto">
            <div className="text-xs text-muted-foreground mb-2">Будут изменены:</div>
            <div className="flex flex-wrap gap-1.5">
              {sessions.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs">
                  {formatDateRu(s.startsAt)} {formatTimeRu(s.startsAt)}
                </span>
              ))}
            </div>
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
