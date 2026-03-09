import { UseFormReturn } from "react-hook-form";
import { EventFormData, categories, ageRestrictions } from "@/lib/eventSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormSection from "./FormSection";
import FieldWithHint from "./FieldWithHint";
import { Type, FileText, MapPin } from "lucide-react";

export function EventInfoTab({ form }: { form: UseFormReturn<EventFormData> }) {
  return (
    <div className="space-y-8">
      <FormSection icon={<Type className="w-4 h-4" />} title="Основное" description="Название и категория">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Название *</FormLabel>
              <FormControl><Input placeholder="Концерт в Алматы" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="slug" render={({ field }) => (
            <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl><Input placeholder="koncert-v-almaty" className="font-mono text-sm" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Категория *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Выберите..." /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FieldWithHint hint="Текст бейджа на карточке, напр. 'Хит' или 'Новинка'">
            <FormField control={form.control} name="badge" render={({ field }) => (
              <FormItem>
                <FormLabel>Бейдж</FormLabel>
                <FormControl><Input placeholder="Хит" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </FieldWithHint>
        </div>
      </FormSection>

      <FormSection icon={<FileText className="w-4 h-4" />} title="Контент" description="Описание и изображение">
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Описание *</FormLabel>
            <FormControl><Textarea rows={4} placeholder="Подробное описание события..." {...field} /></FormControl>
            <div className="flex justify-between">
              <FormMessage />
              <span className="text-xs text-muted-foreground">{(field.value || "").length}/2000</span>
            </div>
          </FormItem>
        )} />
        <FormField control={form.control} name="shortDescription" render={({ field }) => (
          <FormItem>
            <FormLabel>Краткое описание</FormLabel>
            <FormControl><Input placeholder="Одно предложение для карточки" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>URL изображения</FormLabel>
            <FormControl><Input placeholder="https://..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </FormSection>

      <FormSection icon={<MapPin className="w-4 h-4" />} title="Детали" description="Дата, место, ограничения">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>Дата *</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="time" render={({ field }) => (
            <FormItem>
              <FormLabel>Время *</FormLabel>
              <FormControl><Input type="time" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="venue" render={({ field }) => (
            <FormItem>
              <FormLabel>Локация *</FormLabel>
              <FormControl><Input placeholder="Дворец Республики" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="city" render={({ field }) => (
            <FormItem>
              <FormLabel>Город *</FormLabel>
              <FormControl><Input placeholder="Алматы" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="ageRestriction" render={({ field }) => (
            <FormItem>
              <FormLabel>Возрастное ограничение</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Нет" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ageRestrictions.map((a) => (
                    <SelectItem key={a.value || "none"} value={a.value || "none"}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
      </FormSection>
    </div>
  );
}
