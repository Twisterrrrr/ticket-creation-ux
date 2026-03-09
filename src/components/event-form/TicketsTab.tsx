import { UseFormReturn, useFieldArray } from "react-hook-form";
import { EventFormData, defaultTicket, ticketTypes, weekDays } from "@/lib/eventSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import FormSection from "./FormSection";
import { Ticket, Plus, Trash2, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

function TicketCard({ form, index, canRemove, onRemove }: {
  form: UseFormReturn<EventFormData>;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const weekdayRestriction = form.watch(`tickets.${index}.weekdayRestriction`);
  const groupTicket = form.watch(`tickets.${index}.groupTicket`);
  const groupSize = form.watch(`tickets.${index}.groupSize`) || 1;

  return (
    <div className="relative rounded-lg border border-border p-5 space-y-4">
      {canRemove && (
        <Button type="button" variant="ghost" size="icon"
          className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}

      {/* Name + Price */}
      <div className="grid sm:grid-cols-[1fr_180px] gap-3">
        <FormField control={form.control} name={`tickets.${index}.name`} render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Название</FormLabel>
            <FormControl><Input placeholder="Укажите название" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name={`tickets.${index}.price`} render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Цена</FormLabel>
            <FormControl><Input type="number" min={0} placeholder="Укажите цену" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      {/* Ticket Type */}
      <FormField control={form.control} name={`tickets.${index}.ticketType`} render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs">Тип билета</FormLabel>
          <div className="flex gap-1">
            {ticketTypes.map((t) => (
              <button key={t.value} type="button"
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md border transition-colors",
                  field.value === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                )}
                onClick={() => field.onChange(t.value)}>
                {t.label}
              </button>
            ))}
          </div>
        </FormItem>
      )} />

      {/* Quota per category */}
      <FormField control={form.control} name={`tickets.${index}.quota`} render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs">Квота (мест)</FormLabel>
          <FormControl><Input type="number" min={0} placeholder="Без ограничения" {...field} value={field.value ?? ""} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      {/* Note */}
      <FormField control={form.control} name={`tickets.${index}.note`} render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs">Примечание</FormLabel>
          <FormControl><Input placeholder="Краткие примечания к варианту билета (возраст, для каких категорий предназначен)" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      {/* Checkboxes */}
      <div className="space-y-3 pt-1">
        {/* Meal */}
        <FormField control={form.control} name={`tickets.${index}.mealIncluded`} render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="text-sm font-medium cursor-pointer">Билет с включённым питанием</FormLabel>
          </FormItem>
        )} />

        {/* Weekday restriction */}
        <div className="space-y-2">
          <FormField control={form.control} name={`tickets.${index}.weekdayRestriction`} render={({ field }) => (
            <FormItem className="flex items-start gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div>
                <FormLabel className={cn("text-sm font-medium cursor-pointer", field.value && "text-primary")}>
                  Ограничение по дням недели
                </FormLabel>
                <p className="text-xs text-muted-foreground">билет доступен только в выбранные дни недели</p>
              </div>
            </FormItem>
          )} />
          {weekdayRestriction && (
            <FormField control={form.control} name={`tickets.${index}.weekdays`} render={({ field }) => (
              <div className="flex gap-1 pl-6">
                {weekDays.map((d) => {
                  const selected = (field.value || []).includes(d.value);
                  return (
                    <button key={d.value} type="button"
                      className={cn(
                        "w-9 h-8 text-xs rounded-md border transition-colors",
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:bg-muted"
                      )}
                      onClick={() => {
                        const cur = field.value || [];
                        field.onChange(selected ? cur.filter((v: string) => v !== d.value) : [...cur, d.value]);
                      }}>
                      {d.label}
                    </button>
                  );
                })}
              </div>
            )} />
          )}
        </div>

        {/* Group ticket */}
        <div className="space-y-2">
          <FormField control={form.control} name={`tickets.${index}.groupTicket`} render={({ field }) => (
            <FormItem className="flex items-start gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div>
                <FormLabel className={cn("text-sm font-medium cursor-pointer", field.value && "text-primary")}>
                  Групповой билет
                </FormLabel>
                <p className="text-xs text-muted-foreground">билет на несколько гостей</p>
              </div>
            </FormItem>
          )} />
          {groupTicket && (
            <div className="flex items-center gap-2 pl-6">
              <Button type="button" variant="outline" size="icon" className="h-8 w-8"
                onClick={() => form.setValue(`tickets.${index}.groupSize`, Math.max(1, groupSize - 1))}>
                <Minus className="w-3 h-3" />
              </Button>
              <Input type="number" min={1} className="w-16 h-8 text-center"
                value={groupSize}
                onChange={(e) => form.setValue(`tickets.${index}.groupSize`, Math.max(1, Number(e.target.value)))} />
              <Button type="button" variant="outline" size="icon" className="h-8 w-8"
                onClick={() => form.setValue(`tickets.${index}.groupSize`, groupSize + 1)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Non-independent */}
        <FormField control={form.control} name={`tickets.${index}.nonIndependent`} render={({ field }) => (
          <FormItem className="flex items-start gap-2 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div>
              <FormLabel className="text-sm font-medium cursor-pointer">Не самостоятельный</FormLabel>
              <p className="text-xs text-muted-foreground">билет не может быть приобретён без других, самостоятельных, вариантов билета</p>
            </div>
          </FormItem>
        )} />
      </div>
    </div>
  );
}

export function TicketsTab({ form }: { form: UseFormReturn<EventFormData> }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tickets",
  });

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

      {/* Ticket Categories */}
      <FormSection icon={<Ticket className="w-4 h-4" />} title="Категории билетов" description="Добавьте варианты билетов с настройками">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <TicketCard key={field.id} form={form} index={index}
              canRemove={fields.length > 1} onRemove={() => remove(index)} />
          ))}

          <Button type="button" variant="outline" className="w-full gap-2 border-dashed"
            onClick={() => append({ ...defaultTicket })}>
            <Plus className="w-4 h-4" /> Добавить категорию
          </Button>
        </div>
      </FormSection>
    </div>
  );
}
