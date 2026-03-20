import { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { EventFormData, QuotaGroup } from "@/lib/eventSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { toast } from "sonner";

function QuotaGroupDialog({
  open,
  onOpenChange,
  onSave,
  initial,
  title,
  tickets,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (data: QuotaGroup) => void;
  initial: QuotaGroup;
  title: string;
  tickets: { name: string; ticketType: string; note?: string }[];
}) {
  const [data, setData] = useState<QuotaGroup>(initial);

  const handleOpenChange = (v: boolean) => {
    if (v) setData(initial);
    onOpenChange(v);
  };

  const handleSave = () => {
    if (!data.name || data.name.trim().length < 1) {
      toast.error("Укажите название группы квот");
      return;
    }
    onSave(data);
    onOpenChange(false);
  };

  const getSubtitle = (t: { name: string; ticketType: string; note?: string }) => {
    const parts: string[] = [];
    if (t.ticketType) parts.push(t.ticketType);
    if (t.note) parts.push(t.note);
    return parts.join(" · ");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Укажите название группы квот"
            value={data.name}
            onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
          />

          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_auto] gap-4 items-center text-sm font-medium text-muted-foreground">
              <span>Категория билета</span>
              <span>Количество билетов</span>
            </div>

            {/* Total seats row */}
            <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
              <span className="text-sm font-medium">Всего мест</span>
              <Input
                type="number"
                min={0}
                className="w-32 text-center"
                value={data.totalSeats || ""}
                onChange={(e) => setData((d) => ({ ...d, totalSeats: Number(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            {/* Per-category limits */}
            {tickets.map((t, i) => {
              const key = `ticket-${i}`;
              const limit = data.categoryLimits?.[key];
              const subtitle = getSubtitle(t);
              return (
                <div key={key} className="grid grid-cols-[1fr_auto] gap-4 items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.name || "Без названия"}</p>
                    {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
                  </div>
                  <Input
                    type="text"
                    className="w-32 text-center"
                    value={limit !== undefined && limit !== null ? limit : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((d) => ({
                        ...d,
                        categoryLimits: {
                          ...d.categoryLimits,
                          [key]: val === "" ? undefined : Math.max(0, Number(val) || 0),
                        },
                      }));
                    }}
                    placeholder="∞"
                  />
                </div>
              );
            })}
          </div>

          <Button className="w-full" onClick={handleSave}>Сохранить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QuotaGroupsSection({ form }: { form: UseFormReturn<EventFormData> }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "quotaGroups",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [dialogInitial, setDialogInitial] = useState<QuotaGroup>({ name: "", totalSeats: 0, categoryLimits: {} });

  const tickets = form.watch("tickets");
  const quotaGroups = form.watch("quotaGroups");

  const handleCreate = () => {
    setEditIndex(null);
    setDialogInitial({ name: "", totalSeats: 0, categoryLimits: {} });
    setDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setDialogInitial({ ...form.getValues(`quotaGroups.${index}`) });
    setDialogOpen(true);
  };

  const handleSave = (data: QuotaGroup) => {
    if (editIndex !== null) {
      const groups = form.getValues("quotaGroups");
      groups[editIndex] = data;
      form.setValue("quotaGroups", groups, { shouldDirty: true });
    } else {
      append(data);
    }
  };

  const handleDelete = (index: number) => {
    remove(index);
    toast.success("Группа квот удалена");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Группы квот
        </h3>
        <Button size="sm" className="gap-1.5" onClick={handleCreate}>
          <Plus className="w-3.5 h-3.5" /> Создать
        </Button>
      </div>

      {fields.map((field, index) => {
        const group = quotaGroups?.[index];
        if (!group) return null;
        return (
          <div key={field.id} className="flex items-center justify-between gap-3 px-3 py-3 border rounded-md border-border hover:bg-muted/30 transition-colors">
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{group.name || "Без названия"}</p>
              <p className="text-xs text-muted-foreground">Всего мест: {group.totalSeats}</p>
            </div>
            <div className="flex items-center gap-1">
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

      {fields.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground border border-dashed border-border rounded-md">
          Нет групп квот. Нажмите «Создать» чтобы добавить.
        </div>
      )}

      <QuotaGroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        initial={dialogInitial}
        title={editIndex !== null ? "Изменить группу квот" : "Создать группу квот"}
        tickets={tickets.map((t) => ({ name: t.name, ticketType: t.ticketType, note: t.note }))}
      />
    </div>
  );
}
