import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminEventSessionRow } from '@/components/schedule/types';
import { formatDateRu, formatTimeRu } from '@/lib/sessions';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: AdminEventSessionRow | null;
  onCancel: (sessionId: string, reason?: string) => void;
};

export function CancelSessionDialog({ open, onOpenChange, session, onCancel }: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const label = session ? `${formatDateRu(session.startsAt)} ${formatTimeRu(session.startsAt)}` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Отменить сеанс?</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          {session ? (
            <>Сеанс <span className="font-medium text-foreground">{label}</span> будет отменён.</>
          ) : 'Сеанс не выбран.'}
        </div>
        <div className="mt-4 grid gap-2">
          <Label>Причина (опционально)</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Например: перенос" />
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Назад</Button>
          <Button variant="destructive" onClick={() => { if (session) { onCancel(session.id, reason || undefined); onOpenChange(false); } }} disabled={!session}>
            Отменить сеанс
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
