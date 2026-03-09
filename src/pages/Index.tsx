import { useState } from "react";
import EventCreateForm from "@/components/event-form/EventCreateForm";
import { ScheduleTab } from "@/components/schedule/ScheduleTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Calendar } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Управление событием</h1>
          <p className="text-sm text-muted-foreground mt-1">Настройте информацию и расписание</p>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
            <TabsTrigger value="info" className="gap-2">
              <FileText className="h-4 w-4" />
              Информация
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              Расписание
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <EventCreateForm />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
