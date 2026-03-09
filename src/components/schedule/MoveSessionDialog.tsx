import { formatDateRu, formatTimeRu, pad2 } from '@/lib/sessions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionStartsAt: string;
  newDateKey: string;
  newHour: number;
  onConfirm: () => void;
};

export function MoveSessionDialog({ open, onOpenChange, sessionStartsAt, newDateKey, newHour, onConfirm }: Props) {
  const fromLabel = `${formatDateRu(sessionStartsAt)} ${formatTimeRu(sessionStartsAt)}`;
  const toDate = new Date(`${newDateKey}T${pad2(newHour)}:00:00`);
  const toLabel = `${toDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} ${pad2(newHour)}:00`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Перенести сеанс?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="block">Из: <strong>{fromLabel}</strong></span>
            <span className="block">В: <strong>{toLabel}</strong></span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Перенести</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
