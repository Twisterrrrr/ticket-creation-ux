import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventFormData, defaultEventValues } from "@/lib/eventSchema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventInfoTab } from "@/components/event-form/EventInfoTab";
import { TicketsTab } from "@/components/event-form/TicketsTab";
import { ScheduleTab } from "@/components/schedule/ScheduleTab";
import { SalesTab } from "@/components/sales/SalesTab";
import { FileText, Ticket, Calendar, ShoppingCart, Save, Check } from "lucide-react";
import { toast } from "sonner";

const DRAFT_KEY = "event-draft";

const Index = () => {
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
        form.reset(JSON.parse(saved));
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

  const onSubmit = (data: EventFormData) => {
    localStorage.removeItem(DRAFT_KEY);
    toast.success("Событие создано!");
    console.log("Event created:", data);
    form.reset(defaultEventValues);
  };

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form.getValues()));
    toast.success("Черновик сохранён");
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Управление событием</h1>
            <p className="text-sm text-muted-foreground mt-1">Настройте информацию, билеты и расписание</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={saveDraft}>
              <Save className="w-4 h-4" /> Черновик
            </Button>
            <Button type="button" size="sm" className="gap-2" onClick={form.handleSubmit(onSubmit)}>
              <Check className="w-4 h-4" /> Сохранить
            </Button>
          </div>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-6">
            <TabsTrigger value="info" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Информация</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Билеты и квоты</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Расписание</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Продажи</span>
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="info">
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <EventInfoTab form={form} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tickets">
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <TicketsTab form={form} />
                  </CardContent>
                </Card>
              </TabsContent>
            </form>
          </Form>

          <TabsContent value="schedule">
            <ScheduleTab />
          </TabsContent>

          <TabsContent value="sales">
            <SalesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
