import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import type { AdminEventSessionRow } from '@/components/schedule/types';
import { formatDateRu, formatTimeRu } from '@/lib/sessions';

type RegistryEntry = {
  id: string;
  index: number;
  fullName: string;
  phone: string;
  email: string;
  ticketType: string;
  quantity: number;
  amount: number;
  isPaid: boolean;
};

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return hash;
}

function getDemoRegistry(session: AdminEventSessionRow): RegistryEntry[] {
  const sold = session.soldCount ?? 0;
  if (sold === 0) return [];

  const people = [
    { name: 'Галина Юрьевна Крымова', email: 'galakrymova97@gmail.com', phone: '+7 992 297 46 42' },
    { name: 'Иван Григорьевич Крымов', email: 'galakrymova97@gmail.com', phone: '+7 892 513 04 72' },
    { name: 'Олеся Шелегова', email: 'oleska_sh@mail.ru', phone: '+7 921 563 23 99' },
    { name: 'Анна Маркова', email: 'anna.markova@gmail.com', phone: '+7 952 396 73 79' },
    { name: 'Дмитрий Козлов', email: 'kozlov.d@yandex.ru', phone: '+7 911 234 56 78' },
    { name: 'Екатерина Смирнова', email: 'smirnova.ek@mail.ru', phone: '+7 903 876 54 32' },
    { name: 'Михаил Петров', email: 'petrov.m@gmail.com', phone: '+7 915 432 10 98' },
  ];

  const ticketTypes = ['Взрослый билет', 'Детский билет', 'Льготный билет'];
  const entries: RegistryEntry[] = [];
  let remaining = sold;
  const seed = Math.abs(hashCode(session.id));

  for (let i = 0; remaining > 0 && i < people.length; i++) {
    const qty = Math.min(remaining, Math.max(1, Math.ceil(remaining / (people.length - i))));
    remaining -= qty;
    const price = 3500 + ((seed + i) % 3) * 500;
    entries.push({
      id: `${session.id}-reg-${i}`,
      index: i + 1,
      fullName: people[i].name,
      phone: people[i].phone,
      email: people[i].email,
      ticketType: ticketTypes[(seed + i) % ticketTypes.length],
      quantity: qty,
      amount: price * qty,
      isPaid: i !== 2,
    });
  }
  return entries;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: AdminEventSessionRow | null;
};

export function SessionRegistryDialog({ open, onOpenChange, session }: Props) {
  const entries = useMemo(() => {
    if (!session) return [];
    return getDemoRegistry(session);
  }, [session]);

  if (!session) return null;

  const cap = session.capacity ?? '∞';
  const sold = session.soldCount ?? 0;
  const remaining = typeof session.capacity === 'number' ? session.capacity - sold : '∞';
  const totalAmount = entries.filter((e) => e.isPaid).reduce((s, e) => s + e.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Реестр билетов: {formatDateRu(session.startsAt)}, {formatTimeRu(session.startsAt)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session summary */}
          <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
            <div>
              <span className="text-muted-foreground">Забронировано мест: </span>
              <span className="font-semibold text-foreground">{sold}</span>
              <span className="text-muted-foreground"> из {cap}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Свободных мест: </span>
              <span className="font-semibold text-foreground">{remaining}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Выручка: </span>
              <span className="font-semibold text-foreground">{totalAmount.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          {/* Ticket type breakdown */}
          {entries.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {Object.entries(
                entries.reduce<Record<string, number>>((acc, e) => {
                  acc[e.ticketType] = (acc[e.ticketType] ?? 0) + e.quantity;
                  return acc;
                }, {})
              ).map(([type, count]) => (
                <span key={type} className="mr-4">
                  · {type}: <span className="font-medium text-foreground">{count} мест</span>
                </span>
              ))}
            </div>
          )}

          {/* Registry table */}
          {entries.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Контакты</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead>Билеты</TableHead>
                    <TableHead className="text-center">Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs text-muted-foreground">{entry.index}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{entry.fullName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{entry.phone}</div>
                          <div className="text-muted-foreground">{entry.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {entry.amount.toLocaleString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="font-medium">{entry.ticketType}</div>
                          <div className="text-muted-foreground">{entry.quantity} шт. · {(entry.amount / entry.quantity).toLocaleString('ru-RU')}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={entry.isPaid ? 'default' : 'destructive'} className="text-xs">
                          {entry.isPaid ? 'Оплачен' : 'Не оплачен'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">Реестр пуст — билеты не проданы</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
