import { Pencil, Plus, ShoppingCart, Square, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdminEventSessionRow } from '@/components/schedule/types';

type Props = {
  sessions: AdminEventSessionRow[];
  onDeselect: () => void;
  onAdd: () => void;
  onEdit: () => void;
  onStop: () => void;
  onDelete: () => void;
  onViewSales?: () => void;
};

export function SessionActionBar({ sessions, onDeselect, onAdd, onEdit, onStop, onDelete }: Props) {
  const count = sessions.length;
  const hasSold = sessions.some((s) => (s.soldCount ?? 0) > 0);
  const hasLocked = sessions.some((s) => s.locked);
  const hasCancelled = sessions.some((s) => s.isCancelled);

  const canEdit = !hasLocked && !hasCancelled;
  const canStop = !hasLocked && !hasCancelled;
  const canDelete = sessions.every((s) => s.isCancelled ? s.soldCount === 0 : !s.locked && (s.soldCount ?? 0) === 0);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={onDeselect}>
        <X className="h-3.5 w-3.5" />
        {count > 1 ? `Снять выбор (${count})` : 'Отменить выбор'}
      </Button>
      <Button
        size="sm"
        className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
        onClick={onAdd}
      >
        <Plus className="h-3.5 w-3.5" />
        Добавить
      </Button>
      <Button
        size="sm"
        className="gap-1.5 bg-amber-500 text-white hover:bg-amber-600"
        disabled={!canEdit}
        onClick={onEdit}
        title={!canEdit ? (hasSold ? 'Перенос возможен только с уведомлением покупателям' : 'Редактирование недоступно') : undefined}
      >
        <Pencil className="h-3.5 w-3.5" />
        Изменить{count > 1 ? ` (${count})` : ''}
      </Button>
      <Button
        size="sm"
        className="gap-1.5 bg-orange-500 text-white hover:bg-orange-600"
        disabled={!canStop}
        onClick={onStop}
      >
        <Square className="h-3.5 w-3.5" />
        Остановить
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="gap-1.5"
        disabled={!canDelete}
        onClick={onDelete}
        title={!canDelete && hasSold ? 'Удаление возможно только после возвратов через админа' : undefined}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Удалить
      </Button>
      {hasSold && (
        <span className="ml-2 text-[11px] text-destructive">
          Есть продажи — перенос с уведомлением, удаление после возвратов
        </span>
      )}
    </div>
  );
}
