import { useState, useRef } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { EventFormData, categories, ageRestrictions } from "@/lib/eventSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FormSection from "./FormSection";
import FieldWithHint from "./FieldWithHint";
import { Type, FileText, MapPin, Plus, Trash2, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";

export function EventInfoTab({ form }: { form: UseFormReturn<EventFormData> }) {
  const [customCategories, setCustomCategories] = useState<{ value: string; label: string }[]>([]);
  const [newCatDialogOpen, setNewCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allCategories = [...categories, ...customCategories];

  const { fields: extraFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: "extraSections",
  });

  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (trimmed.length < 2) {
      toast.error("Минимум 2 символа");
      return;
    }
    const value = trimmed.toLowerCase().replace(/\s+/g, "-").replace(/[^a-zа-яё0-9-]/gi, "");
    if (allCategories.some((c) => c.value === value || c.label === trimmed)) {
      toast.error("Такая категория уже существует");
      return;
    }
    // Add category immediately, close dialog, then set form value after unmount
    setCustomCategories((prev) => [...prev, { value, label: trimmed }]);
    setNewCatName("");
    setNewCatDialogOpen(false);
    toast.success(`Категория «${trimmed}» добавлена`);
    // Defer form.setValue to next tick so Select re-renders with new option first
    setTimeout(() => {
      form.setValue("category", value);
    }, 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Выберите файл изображения");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Максимальный размер файла — 5 МБ");
      return;
    }
    // Create preview URL
    const url = URL.createObjectURL(file);
    form.setValue("imageUrl", url);
    form.setValue("imageFile", file);
    toast.success(`Файл «${file.name}» загружен`);
  };

  const imageUrl = form.watch("imageUrl");

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
              <div className="flex gap-2">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allCategories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => setNewCatDialogOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
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

        {/* Extra sections */}
        {extraFields.map((ef, index) => (
          <div key={ef.id} className="relative rounded-lg border border-border p-4 space-y-3">
            <Button type="button" variant="ghost" size="icon"
              className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeSection(index)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <FormField control={form.control} name={`extraSections.${index}.title`} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Заголовок раздела</FormLabel>
                <FormControl><Input placeholder="Например: Программа, Условия участия..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name={`extraSections.${index}.content`} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Содержание</FormLabel>
                <FormControl><Textarea rows={3} placeholder="Текст раздела..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        ))}

        <Button type="button" variant="outline" className="w-full gap-2 border-dashed"
          onClick={() => appendSection({ title: "", content: "" })}>
          <Plus className="w-4 h-4" /> Добавить раздел описания
        </Button>

        {/* Image upload */}
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>Изображение</FormLabel>
            <div className="space-y-3">
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="https://... или загрузите файл" {...field} className="flex-1" />
                </FormControl>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                <Button type="button" variant="outline" className="gap-1.5 shrink-0" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" /> Загрузить
                </Button>
              </div>
              {imageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-border bg-muted aspect-video max-w-xs">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              {!imageUrl && (
                <div className="rounded-lg border border-dashed border-border bg-muted/50 aspect-video max-w-xs flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">Нажмите для загрузки</p>
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )} />
      </FormSection>

      <FormSection icon={<MapPin className="w-4 h-4" />} title="Место проведения" description="Локация и ограничения">
        <div className="grid sm:grid-cols-2 gap-4">
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

      {/* New Category Dialog */}
      <Dialog open={newCatDialogOpen} onOpenChange={setNewCatDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Новая категория</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Название категории</label>
              <Input placeholder="Например: Мастер-класс" value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()} />
            </div>
            <Button className="w-full" onClick={handleAddCategory}>Добавить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
