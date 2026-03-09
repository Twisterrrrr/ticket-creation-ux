import { EventFormData, categories } from "@/lib/eventSchema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, Ticket } from "lucide-react";

interface EventPreviewCardProps {
  data: EventFormData;
}

const EventPreviewCard = ({ data }: EventPreviewCardProps) => {
  const categoryLabel = categories.find((c) => c.value === data.category)?.label || data.category;
  const minPrice = data.tickets.length > 0 ? Math.min(...data.tickets.map((t) => t.price)) : 0;
  const totalQuantity = data.tickets.reduce((sum, t) => sum + (t.quota || 0), 0);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-foreground">Превью события</h3>
      <p className="text-sm text-muted-foreground">
        Так карточка будет выглядеть для пользователя
      </p>

      <Card className="overflow-hidden shadow-lg max-w-md mx-auto">
        {data.imageUrl ? (
          <div className="aspect-video bg-muted overflow-hidden">
            <img
              src={data.imageUrl}
              alt={data.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Ticket className="w-12 h-12 text-primary/40" />
          </div>
        )}

        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-lg leading-tight">
                {data.title || "Название события"}
              </h4>
              {data.shortDescription && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {data.shortDescription}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Badge variant="secondary" className="text-xs">
                {categoryLabel}
              </Badge>
              {data.badge && (
                <Badge className="bg-primary text-primary-foreground text-xs">
                  {data.badge}
                </Badge>
              )}
              {data.ageRestriction && (
                <Badge variant="outline" className="text-xs">
                  {data.ageRestriction}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            {data.date && (
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span>{data.date}</span>
                {data.time && (
                  <>
                    <Clock className="w-4 h-4 text-primary ml-2" />
                    <span>{data.time}</span>
                  </>
                )}
              </div>
            )}
            {data.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>
                  {data.venue}
                  {data.city ? `, ${data.city}` : ""}
                </span>
              </div>
            )}
          </div>

          {/* Ticket categories list */}
          <div className="pt-3 border-t border-border space-y-2">
            {data.tickets.map((ticket, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{ticket.name || `Категория ${i + 1}`}</p>
                  <p className="text-xs text-muted-foreground">{ticket.quantity} шт.</p>
                </div>
                <p className="font-bold text-foreground">
                  {ticket.price ? `${ticket.price.toLocaleString()} ₸` : "Бесплатно"}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              от <span className="text-lg font-bold text-foreground">{minPrice ? `${minPrice.toLocaleString()} ₸` : "Бесплатно"}</span>
            </p>
            <div className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm">
              Купить
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
        <p className="font-medium text-foreground">Сводка</p>
        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
          <span>Категорий билетов:</span>
          <span className="text-foreground font-medium">{data.tickets.length}</span>
          <span>Всего билетов:</span>
          <span className="text-foreground font-medium">{totalQuantity}</span>
          <span>Комиссия:</span>
          <span className="text-foreground font-medium">{data.commission || 0}%</span>
          <span>Slug:</span>
          <span className="text-foreground font-medium font-mono text-xs">{data.slug || "—"}</span>
        </div>
      </div>
    </div>
  );
};

export default EventPreviewCard;
