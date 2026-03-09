import { z } from "zod";

const ticketCategorySchema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа").max(80, "Максимум 80 символов"),
  price: z.coerce.number().min(0, "Цена не может быть отрицательной"),
  quantity: z.coerce.number().int().min(1, "Минимум 1 билет"),
});

export type TicketCategory = z.infer<typeof ticketCategorySchema>;

export const eventSchema = z.object({
  // Basic Info
  title: z.string().trim().min(3, "Минимум 3 символа").max(120, "Максимум 120 символов"),
  slug: z.string().trim().min(2, "Минимум 2 символа").max(80, "Максимум 80 символов")
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефисы"),
  category: z.string().min(1, "Выберите категорию"),
  badge: z.string().max(20, "Максимум 20 символов").optional().or(z.literal("")),

  // Content
  description: z.string().trim().min(10, "Минимум 10 символов").max(2000, "Максимум 2000 символов"),
  shortDescription: z.string().trim().max(200, "Максимум 200 символов").optional().or(z.literal("")),
  imageUrl: z.string().url("Введите корректный URL").optional().or(z.literal("")),

  // Details
  date: z.string().min(1, "Укажите дату"),
  time: z.string().min(1, "Укажите время"),
  venue: z.string().trim().min(2, "Минимум 2 символа").max(150, "Максимум 150 символов"),
  city: z.string().trim().min(2, "Минимум 2 символа").max(60, "Максимум 60 символов"),
  ageRestriction: z.string().optional().or(z.literal("")),

  // Tickets
  tickets: z.array(ticketCategorySchema).min(1, "Добавьте хотя бы одну категорию билетов"),
  commission: z.coerce.number().min(0).max(100, "Максимум 100%").optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;

export const defaultTicket: TicketCategory = {
  name: "",
  price: 0,
  quantity: 100,
};

export const defaultEventValues: EventFormData = {
  title: "",
  slug: "",
  category: "",
  badge: "",
  description: "",
  shortDescription: "",
  imageUrl: "",
  date: "",
  time: "",
  venue: "",
  city: "",
  ageRestriction: "",
  tickets: [{ ...defaultTicket }],
  commission: 10,
};

export const categories = [
  { value: "concert", label: "Концерт" },
  { value: "theater", label: "Театр" },
  { value: "sport", label: "Спорт" },
  { value: "standup", label: "Стендап" },
  { value: "exhibition", label: "Выставка" },
  { value: "festival", label: "Фестиваль" },
  { value: "other", label: "Другое" },
];

export const ageRestrictions = [
  { value: "", label: "Без ограничений" },
  { value: "0+", label: "0+" },
  { value: "6+", label: "6+" },
  { value: "12+", label: "12+" },
  { value: "16+", label: "16+" },
  { value: "18+", label: "18+" },
];
