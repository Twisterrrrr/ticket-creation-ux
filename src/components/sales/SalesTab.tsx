import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

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
};

const DEMO_ORDERS: Order[] = [
  {
    id: "1",
    number: "550007",
    createdAt: "29.04.2025 22:01",
    buyerName: "Иванов Никита",
    buyerEmail: "user@example.com",
    buyerPhone: "+7 999 000 00 00",
    eventTitle: "Демо-событие",
    sessionTime: "21:00",
    sessionDate: "09.05.2025",
    amount: 7500,
    ticketCount: 2,
    isPaid: true,
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
  },
];

export function SalesTab() {
  const totalOrders = DEMO_ORDERS.length;
  const totalRevenue = DEMO_ORDERS.filter((o) => o.isPaid).reduce((s, o) => s + o.amount, 0);
  const totalTickets = DEMO_ORDERS.reduce((s, o) => s + o.ticketCount, 0);

  return (
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
            <span>Выручка: <span className="font-medium text-foreground">{totalRevenue.toLocaleString("ru-RU")} ₸</span></span>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_ORDERS.map((order) => (
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
                      <div className="text-xs text-muted-foreground">{order.buyerPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{order.eventTitle}</div>
                      <div className="text-xs text-muted-foreground">{order.sessionTime} · {order.sessionDate}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {order.amount.toLocaleString("ru-RU")} ₸
                  </TableCell>
                  <TableCell className="text-center text-sm">{order.ticketCount}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={order.isPaid ? "default" : "destructive"} className="text-xs">
                      {order.isPaid ? "Оплачен" : "Не оплачен"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
