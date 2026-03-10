import { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { EventFormData, defaultTicket, ticketTypes, weekDays, TicketCategory } from "@/lib/eventSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import FormSection from "./FormSection";
import { Ticket, Plus, Trash2, Minus, Pencil, ChevronUp, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function TicketFormDialog({
  open,
  onOpenChange,
  onSave,
  initial,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (data: TicketCategory) => void;
  initial: TicketCategory;
  title: string;
}) {
  const [data, setData] = useState<TicketCategory>(initial);

  const update = <K extends keyof TicketCategory>(key: K, value: TicketCategory[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  // Reset when dialog opens with new initial
  const handleOpenChange = (v: boolean) => {
    if (v) setData(initial);
    onOpenChange(v);
  };

  const handleSave = () => {
    if (!data.name || data.name.trim().length < 2) {
      toast.error("Укажите название (минимум 2 символа)");
      return;
    }
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Name + Price */}
          <div className="grid sm:grid-cols-[1fr_120px_120px] gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Название</label>
              <Input placeholder="Укажите название" value={data.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Цена</label>
              <Input type="number" min={0} placeholder="0" value={data.price || ""} onChange={(e) => update("price", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Старая цена</label>
              <Input type="number" min={0} placeholder="—" value={data.oldPrice || ""} onChange={(e) => update("oldPrice", e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </div>

          {/* Ticket Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Тип билета</label>
            <div className="flex gap-1">
              {ticketTypes.map((t) => (
                <button key={t.value} type="button"
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-md border transition-colors",
                    data.ticketType === t.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-muted"
                  )}
                  onClick={() => update("ticketType", t.value)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Примечание</label>
            <Input placeholder="Краткие примечания к варианту билета (возраст, для каких категорий предназначен)" value={data.note || ""} onChange={(e) => update("note", e.target.value)} />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={data.mealIncluded} onCheckedChange={(v) => update("mealIncluded", !!v)} />
              <span className="text-sm font-medium">Билет с включённым питанием</span>
            </label>

            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox checked={data.weekdayRestriction} onCheckedChange={(v) => update("weekdayRestriction", !!v)} />
                <div>
                  <span className={cn("text-sm font-medium", data.weekdayRestriction && "text-primary")}>Ограничение по дням недели</span>
                  <p className="text-xs text-muted-foreground">билет доступен только в выбранные дни недели</p>
                </div>
              </label>
              {data.weekdayRestriction && (
                <div className="flex gap-1 pl-6">
                  {weekDays.map((d) => {
                    const selected = (data.weekdays || []).includes(d.value);
                    return (
                      <button key={d.value} type="button"
                        className={cn(
                          "w-9 h-8 text-xs rounded-md border transition-colors",
                          selected ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"
                        )}
                        onClick={() => update("weekdays", selected ? (data.weekdays || []).filter((v) => v !== d.value) : [...(data.weekdays || []), d.value])}>
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox checked={data.groupTicket} onCheckedChange={(v) => update("groupTicket", !!v)} />
                <div>
                  <span className={cn("text-sm font-medium", data.groupTicket && "text-primary")}>Групповой билет</span>
                  <p className="text-xs text-muted-foreground">билет на несколько гостей</p>
                </div>
              </label>
              {data.groupTicket && (
                <div className="flex items-center gap-2 pl-6">
                  <Button type="button" variant="outline" size="icon" className="h-8 w-8"
                    onClick={() => update("groupSize", Math.max(1, (data.groupSize || 1) - 1))}>
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input type="number" min={1} className="w-16 h-8 text-center" value={data.groupSize || 1}
                    onChange={(e) => update("groupSize", Math.max(1, Number(e.target.value)))} />
                  <Button type="button" variant="outline" size="icon" className="h-8 w-8"
                    onClick={() => update("groupSize", (data.groupSize || 1) + 1)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox checked={data.nonIndependent} onCheckedChange={(v) => update("nonIndependent", !!v)} />
              <div>
                <span className="text-sm font-medium">Не самостоятельный</span>
                <p className="text-xs text-muted-foreground">билет не может быть приобретён без других, самостоятельных, вариантов билета</p>
              </div>
            </label>
          </div>

          <Button className="w-full" onClick={handleSave}>Сохранить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getTicketSubtitle(ticket: TicketCategory): string {
  const parts: string[] = [];
  const typeLabel = ticketTypes.find((t) => t.value === ticket.ticketType)?.label;
  if (typeLabel) parts.push(typeLabel);
  if (ticket.note) parts.push(ticket.note);
  if (ticket.groupTicket && ticket.groupSize && ticket.groupSize > 1) parts.push(`${ticket.groupSize} мест`);
  if (ticket.nonIndependent) parts.push("Не самостоятельный");
  return parts.join(" · ");
}

export function TicketsTab({ form }: { form: UseFormReturn<EventFormData> }) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "tickets",
  });

  const [deletedTickets, setDeletedTickets] = useState<TicketCategory[]>([]);
  const [deletedOpen, setDeletedOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [dialogInitial, setDialogInitial] = useState<TicketCategory>({ ...defaultTicket });

  const handleCreate = () => {
    setEditIndex(null);
    setDialogInitial({ ...defaultTicket });
    setDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setDialogInitial({ ...form.getValues(`tickets.${index}`) });
    setDialogOpen(true);
  };

  const handleSave = (data: TicketCategory) => {
    if (editIndex !== null) {
      const tickets = form.getValues("tickets");
      tickets[editIndex] = data;
      form.setValue("tickets", tickets, { shouldDirty: true });
    } else {
      append(data);
    }
  };

  const handleDelete = (index: number) => {
    const ticket = form.getValues(`tickets.${index}`);
    setDeletedTickets((prev) => [...prev, ticket]);
    remove(index);
    toast.success("Категория удалена");
  };

  const handleRestore = (dIndex: number) => {
    const ticket = deletedTickets[dIndex];
    append(ticket);
    setDeletedTickets((prev) => prev.filter((_, i) => i !== dIndex));
    toast.success("Категория восстановлена");
  };

  const tickets = form.watch("tickets");

  return (
    <div className="space-y-6">
      {/* Total Quota */}
      <FormSection icon={<Ticket className="w-4 h-4" />} title="Квота мест" description="Общее количество доступных мест на событие">
        <FormField control={form.control} name="totalQuota" render={({ field }) => (
          <FormItem>
            <FormLabel>Общая квота</FormLabel>
            <FormControl><Input type="number" min={1} placeholder="Например: 500" {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </FormSection>

      {/* Ticket Categories List */}
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Категории билетов</h3>
          <Button size="sm" className="gap-1.5" onClick={handleCreate}>
            <Plus className="w-3.5 h-3.5" /> Создать
          </Button>
        </div>

        {/* Header */}
        {tickets.length > 0 && (
          <div className="grid grid-cols-[auto_1fr_160px_80px] items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
            <div className="w-10" />
            <div>Название</div>
            <div className="text-right">Цена</div>
            <div />
          </div>
        )}

        {/* Rows */}
        {fields.map((field, index) => {
          const ticket = tickets[index];
          if (!ticket) return null;
          return (
            <div key={field.id} className="grid grid-cols-[auto_1fr_160px_80px] items-center gap-2 px-3 py-3 border-b border-border hover:bg-muted/30 transition-colors">
              {/* Sort arrows */}
              <div className="flex flex-col gap-0.5">
                <button type="button" className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={index === 0} onClick={() => move(index, index - 1)}>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Name + subtitle */}
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{ticket.name || "Без названия"}</p>
                <p className="text-xs text-muted-foreground truncate">{getTicketSubtitle(ticket)}</p>
              </div>

              {/* Price */}
              <div className="text-right text-sm tabular-nums">
                {ticket.oldPrice && ticket.oldPrice > ticket.price ? (
                  <span className="text-muted-foreground line-through mr-1.5 text-xs">
                    {ticket.oldPrice.toLocaleString("ru-RU", { minimumFractionDigits: 2 })}
                  </span>
                ) : null}
                <span className="font-medium text-foreground">
                  {(ticket.price || 0).toLocaleString("ru-RU", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 justify-end">
                <Button type="button" variant="outline" size="icon" className="h-7 w-7 text-primary border-primary/30 hover:bg-primary/10" onClick={() => handleEdit(index)}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button type="button" variant="outline" size="icon" className="h-7 w-7 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDelete(index)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}

        {tickets.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Нет категорий билетов. Нажмите «Создать» чтобы добавить.
          </div>
        )}
      </div>

      {/* Deleted tickets */}
      {deletedTickets.length > 0 && (
        <Collapsible open={deletedOpen} onOpenChange={setDeletedOpen}>
          <CollapsibleTrigger asChild>
            <button type="button" className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 transition-colors">
              Удалённые билеты
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">{deletedTickets.length}</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", deletedOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-0">
            <div className="grid grid-cols-[1fr_160px_40px] items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
              <div>Название</div>
              <div className="text-right">Цена</div>
              <div />
            </div>
            {deletedTickets.map((ticket, i) => (
              <div key={i} className="grid grid-cols-[1fr_160px_40px] items-center gap-2 px-3 py-3 border-b border-border opacity-60">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-muted-foreground truncate">{ticket.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{getTicketSubtitle(ticket)}</p>
                </div>
                <p className="text-right text-sm text-muted-foreground tabular-nums">
                  {(ticket.price || 0).toLocaleString("ru-RU", { minimumFractionDigits: 2 })}
                </p>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleRestore(i)}>
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Create/Edit Dialog */}
      <TicketFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        initial={dialogInitial}
        title={editIndex !== null ? "Редактировать вариант билета" : "Создать вариант билета"}
      />
    </div>
  );
}
