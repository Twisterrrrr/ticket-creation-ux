import { UseFormReturn, useFieldArray } from "react-hook-form";
import { EventFormData, defaultTicket } from "@/lib/eventSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormSection from "./FormSection";
import FieldWithHint from "./FieldWithHint";
import { Ticket, Plus, Trash2 } from "lucide-react";

export function TicketsTab({ form }: { form: UseFormReturn<EventFormData> }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tickets",
  });

  return (
    <FormSection icon={<Ticket className="w-4 h-4" />} title="Категории билетов" description="Добавьте одну или несколько категорий">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="relative rounded-lg border border-border p-4 space-y-3">
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Категория {index + 1}
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <FormField control={form.control} name={`tickets.${index}.name`} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Название *</FormLabel>
                  <FormControl><Input placeholder="VIP / Стандарт / Fan Zone" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name={`tickets.${index}.price`} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Цена (₸) *</FormLabel>
                  <FormControl><Input type="number" min={0} placeholder="5000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name={`tickets.${index}.quantity`} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Количество *</FormLabel>
                  <FormControl><Input type="number" min={1} placeholder="100" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 border-dashed"
          onClick={() => append({ ...defaultTicket })}
        >
          <Plus className="w-4 h-4" /> Добавить категорию
        </Button>

        <FieldWithHint hint="Процент комиссии, который добавляется к цене билета при покупке">
          <FormField control={form.control} name="commission" render={({ field }) => (
            <FormItem>
              <FormLabel>Общая комиссия (%)</FormLabel>
              <FormControl><Input type="number" min={0} max={100} placeholder="10" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </FieldWithHint>
      </div>
    </FormSection>
  );
}
