import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingCart } from 'lucide-react';
import type { AdminEventSessionRow } from '@/components/schedule/types';
import { formatDateRu, formatTimeRu } from '@/lib/sessions';

type OrderTicket = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  number: string;
  createdAt: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amount: number;
  ticketCount: number;
  isPaid: boolean;
  tickets: OrderTicket[];
};

// Demo orders generator based on session
function getDemoOrdersForSession(session: AdminEventSessionRow): Order[] {
  const sold = session.soldCount ?? 0;
  if (sold === 0) return [];

  const names = [
    { name: 'Иванов Никита Олегович', email: 'ivanov@example.com', phone: '+7 992 297 46 42' },
    { name: 'Олеся Шелегова', email: 'oleska@example.com', phone: '+7 921 563 23 99' },
    { name: 'Анна Маркова', email: 'anna@example.com', phone: '+7 952 396 73 79' },
    { name: 'Дмитрий Козлов', email: 'kozlov@example.com', phone: '+7 911 234 56 78' },
    { name: 'Екатерина Смирнова', email: 'smirnova@example.com', phone: '+7 903 876 54 32' },
  ];

  const orders: Order[] = [];
  let remaining = sold;
  let orderNum = 550000 + Math.abs(hashCode(session.id)) % 1000;

  for (let i = 0; remaining > 0 && i < names.length; i++) {
    const qty = Math.min(remaining, Math.max(1, Math.ceil(remaining / (names.length - i))));
    remaining -= qty;
    const price = 3500 + (i % 3) * 500;
    orders.push({
      id: `${session.id}-order-${i}`,
      number: String(orderNum + i),
      createdAt: new Date(Date.now() - (i + 1) * 86400000).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      buyerName: names[i].name,
      buyerEmail: names[i].email,
      buyerPhone: names[i].phone,
      amount: price * qty,
      ticketCount: qty,
      isPaid: i !== 2,
      tickets: [{ name: 'Взрослый билет', quantity: qty, price }],
    });
  }
  return orders;
}

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return hash;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: AdminEventSessionRow | null;
};

export function SessionSalesDialog({ open, onOpenChange, session }: Props) {
  const orders = useMemo(() => {
    if (!session) return [];
    return getDemoOrdersForSession(session);
  }, [session]);

  if (!session) return null;

  const totalRevenue = orders.filter((o) => o.isPaid).reduce((s, o) => s + o.amount, 0);
  const totalTickets = orders.reduce((s, o) => s + o.ticketCount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Продажи по сеансу
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session info */}
          <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
            <div>
              <span className="text-muted-foreground">Дата: </span>
              <span className="font-medium">{formatDateRu(session.startsAt)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Время: </span>
              <span className="font-medium">{formatTimeRu(session.startsAt)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Вместимость: </span>
              <span className="font-medium">{session.capacity ?? '∞'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Продано: </span>
              <span className="font-medium">{session.soldCount ?? 0}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Заказов: <span className="font-medium text-foreground">{orders.length}</span></span>
            <span>Билетов: <span className="font-medium text-foreground">{totalTickets}</span></span>
            <span>Выручка: <span className="font-medium text-foreground">{totalRevenue.toLocaleString('ru-RU')} ₽</span></span>
          </div>

          {/* Orders table */}
          {orders.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">Заказ</TableHead>
                    <TableHead>Покупатель</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead className="text-center">Билетов</TableHead>
                    <TableHead className="text-center">Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="text-xs">
                          <div className="font-medium">№{order.number}</div>
                          <div className="text-muted-foreground">{order.createdAt}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{order.buyerName}</div>
                          <div className="text-xs text-muted-foreground">{order.buyerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {order.amount.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell className="text-center text-sm">{order.ticketCount}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={order.isPaid ? 'default' : 'destructive'} className="text-xs">
                          {order.isPaid ? 'Оплачен' : 'Не оплачен'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">Продаж по этому сеансу нет</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
