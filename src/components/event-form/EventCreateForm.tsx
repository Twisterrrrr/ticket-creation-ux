import { useState, useEffect } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { eventSchema, EventFormData, defaultEventValues, defaultTicket, categories, ageRestrictions } from "@/lib/eventSchema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import StepIndicator from "./StepIndicator";
import FormSection from "./FormSection";
import FieldWithHint from "./FieldWithHint";
import EventPreviewCard from "./EventPreviewCard";
import { toast } from "sonner";
import { Type, FileText, MapPin, Ticket, ArrowLeft, ArrowRight, Check, Save, Plus, Trash2 } from "lucide-react";

const STEPS = ["Информация", "Билеты", "Превью"];
const DRAFT_KEY = "event-draft";

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const EventCreateForm = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: defaultEventValues,
    mode: "onBlur",
  });

  // Load draft
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        form.reset(parsed);
        toast.info("Черновик восстановлен");
      } catch {}
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const sub = form.watch((values) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    });
    return () => sub.unsubscribe();
  }, [form.watch]);

  // Auto-generate slug from title
  const title = form.watch("title");
  useEffect(() => {
    if (title && !form.getValues("slug")) {
      const slug = title
        .toLowerCase()
        .replace(/[а-яё]/gi, (c) => {
          const map: Record<string, string> = {
            а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",
            к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",
            х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",ы:"y",э:"e",ю:"yu",я:"ya",
            ъ:"",ь:"",
          };
          return map[c.toLowerCase()] || c;
        })
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);
      form.setValue("slug", slug);
    }
  }, [title]);

  const step1Fields = ["title", "slug", "category", "badge", "description", "shortDescription", "imageUrl", "date", "time", "venue", "city", "ageRestriction"] as const;
  const step2Fields = ["tickets", "commission"] as const;

  const goNext = async () => {
    const fieldsToValidate = step === 0 ? [...step1Fields] : [...step2Fields];
    const valid = await form.trigger(fieldsToValidate);
    if (!valid) {
      toast.error("Заполните обязательные поля корректно");
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const onSubmit = (data: EventFormData) => {
    localStorage.removeItem(DRAFT_KEY);
    toast.success("Событие создано!");
    console.log("Event created:", data);
    form.reset(defaultEventValues);
    setStep(0);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Создание события</h1>
          <p className="text-sm text-muted-foreground mt-1">Заполните информацию о вашем мероприятии</p>
        </div>

        <StepIndicator steps={STEPS} currentStep={step} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="shadow-md">
              <CardContent className="p-6">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    {step === 0 && <Step1 form={form} />}
                    {step === 1 && <Step2 form={form} />}
                    {step === 2 && <EventPreviewCard data={form.getValues()} />}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={step === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Назад
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    localStorage.setItem(DRAFT_KEY, JSON.stringify(form.getValues()));
                    toast.success("Черновик сохранён");
                  }}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" /> Черновик
                </Button>

                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={goNext} className="gap-2">
                    Далее <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="gap-2">
                    <Check className="w-4 h-4" /> Создать событие
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

// Step 1: Info sections
function Step1({ form }: { form: UseFormReturn<EventFormData> }) {
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
              <FormLabel>Площадка *</FormLabel>
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

// Step 2: Tickets with dynamic categories
function Step2({ form }: { form: UseFormReturn<EventFormData> }) {
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

export default EventCreateForm;
