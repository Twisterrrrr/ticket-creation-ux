import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { AdminEventSessionRow } from '@/components/schedule/types';
import { formatDateRu, formatTimeRu } from '@/lib/sessions';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: AdminEventSessionRow | null;
  onDelete: (sessionId: string) => void;
};

export function DeleteSessionDialog({ open, onOpenChange, session, onDelete }: Props) {
  const label = session ? `${formatDateRu(session.startsAt)} ${formatTimeRu(session.startsAt)}` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить сеанс?</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          {session ? (
            <>Сеанс <span className="font-medium text-foreground">{label}</span> будет удалён безвозвратно.</>
          ) : 'Сеанс не выбран.'}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button variant="destructive" onClick={() => { if (session) { onDelete(session.id); onOpenChange(false); } }} disabled={!session}>
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
