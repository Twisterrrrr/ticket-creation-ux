import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Eye, Mail, FileText } from "lucide-react";
import { toast } from "sonner";

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
  eventTitle: string;
  sessionTime: string;
  sessionDate: string;
  amount: number;
  ticketCount: number;
  isPaid: boolean;
  tickets: OrderTicket[];
};

const DEMO_ORDERS: Order[] = [
  {
    id: "1",
    number: "550007",
    createdAt: "29.04.2025 22:01",
    buyerName: "Иванов Никита Олегович",
    buyerEmail: "ul1a505@yandex.ru",
    buyerPhone: "+79922974642",
    eventTitle: "Салют 9 мая с борта двухпалубного теплохода",
    sessionTime: "21:00",
    sessionDate: "09.05.2025",
    amount: 7500,
    ticketCount: 2,
    isPaid: true,
    tickets: [
      { name: "Взрослый билет", quantity: 1, price: 4000 },
      { name: "Льготный", quantity: 1, price: 3500 },
    ],
  },
  {
    id: "2",
    number: "549654",
    createdAt: "28.04.2025 23:23",
    buyerName: "Олеся Шелегова",
    buyerEmail: "oleska@example.com",
    buyerPhone: "+7 921 563 23 99",
    eventTitle: "Демо-событие",
    sessionTime: "21:00",
    sessionDate: "09.05.2025",
    amount: 9900,
    ticketCount: 3,
    isPaid: true,
    tickets: [
      { name: "Взрослый билет", quantity: 2, price: 4000 },
      { name: "Детский билет", quantity: 1, price: 1900 },
    ],
  },
  {
    id: "3",
    number: "549325",
    createdAt: "28.04.2025 03:24",
    buyerName: "Анна Маркова",
    buyerEmail: "anna@example.com",
    buyerPhone: "+7 952 396 73 79",
    eventTitle: "Демо-событие",
    sessionTime: "21:00",
    sessionDate: "09.05.2025",
    amount: 7600,
    ticketCount: 2,
    isPaid: false,
    tickets: [
      { name: "Взрослый билет", quantity: 2, price: 3800 },
    ],
  },
];

function OrderDetailDialog({ order, open, onOpenChange }: { order: Order | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  if (!order) return null;

  const handleResendEmail = () => {
    toast.success(`Билет переотправлен на ${order.buyerEmail}`);
  };

  const handleExportPdf = () => {
    toast.success("PDF-билет сформирован (демо)");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Заказ №{order.number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportPdf}>
              <FileText className="w-3.5 h-3.5" /> Просмотр PDF-билета
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleResendEmail}>
              <Mail className="w-3.5 h-3.5" /> Переотправить на E-mail
            </Button>
          </div>

          {/* Order info */}
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-3 py-2 font-medium text-muted-foreground bg-muted/50 w-28">Создан</td>
                  <td className="px-3 py-2">{order.createdAt}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium text-muted-foreground bg-muted/50">Сумма</td>
                  <td className="px-3 py-2 font-medium">{order.amount.toLocaleString("ru-RU")} ₽</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Event */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Событие</h4>
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2 font-medium text-muted-foreground bg-muted/50 w-28">Название</td>
                    <td className="px-3 py-2 text-primary">{order.eventTitle}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2 font-medium text-muted-foreground bg-muted/50">Дата</td>
                    <td className="px-3 py-2">{order.sessionDate}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-muted-foreground bg-muted/50">Время</td>
                    <td className="px-3 py-2">{order.sessionTime}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Buyer */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Покупатель</h4>
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2 font-medium text-muted-foreground bg-muted/50 w-28">ФИО</td>
                    <td className="px-3 py-2">{order.buyerName}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2 font-medium text-muted-foreground bg-muted/50">Телефон</td>
                    <td className="px-3 py-2">{order.buyerPhone}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-muted-foreground bg-muted/50">E-mail</td>
                    <td className="px-3 py-2">{order.buyerEmail}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tickets */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Билеты</h4>
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Билет</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">Количество</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {order.tickets.map((t, i) => (
                    <tr key={i} className={i < order.tickets.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-3 py-2">{t.name}</td>
                      <td className="px-3 py-2 text-center">{t.quantity}</td>
                      <td className="px-3 py-2 text-right">{(t.price * t.quantity).toLocaleString("ru-RU")} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SalesTab() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const totalOrders = DEMO_ORDERS.length;
  const totalRevenue = DEMO_ORDERS.filter((o) => o.isPaid).reduce((s, o) => s + o.amount, 0);
  const totalTickets = DEMO_ORDERS.reduce((s, o) => s + o.ticketCount, 0);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Продажи
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Всего заказов: <span className="font-medium text-foreground">{totalOrders}</span></span>
              <span>Билетов: <span className="font-medium text-foreground">{totalTickets}</span></span>
              <span>Выручка: <span className="font-medium text-foreground">{totalRevenue.toLocaleString("ru-RU")} ₽</span></span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Заказ</TableHead>
                  <TableHead>Покупатель</TableHead>
                  <TableHead>Событие</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead className="text-center">Билетов</TableHead>
                  <TableHead className="text-center">Статус</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_ORDERS.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
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
                    <TableCell>
                      <div className="text-sm">
                        <div>{order.eventTitle}</div>
                        <div className="text-xs text-muted-foreground">{order.sessionTime} · {order.sessionDate}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm">
                      {order.amount.toLocaleString("ru-RU")} ₽
                    </TableCell>
                    <TableCell className="text-center text-sm">{order.ticketCount}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={order.isPaid ? "default" : "destructive"} className="text-xs">
                        {order.isPaid ? "Оплачен" : "Не оплачен"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <OrderDetailDialog order={selectedOrder} open={!!selectedOrder} onOpenChange={(v) => !v && setSelectedOrder(null)} />
    </>
  );
}
