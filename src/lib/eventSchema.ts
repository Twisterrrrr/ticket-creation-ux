import { z } from "zod";

export const ticketTypes = [
  { value: "general", label: "Общий" },
  { value: "adult", label: "Взрослый" },
  { value: "child", label: "Детский" },
  { value: "discounted", label: "Льготный" },
] as const;

export const weekDays = [
  { value: "mon", label: "ПН" },
  { value: "tue", label: "ВТ" },
  { value: "wed", label: "СР" },
  { value: "thu", label: "ЧТ" },
  { value: "fri", label: "ПТ" },
  { value: "sat", label: "СБ" },
  { value: "sun", label: "ВС" },
] as const;

const ticketCategorySchema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа").max(80, "Максимум 80 символов"),
  price: z.coerce.number().min(0, "Цена не может быть отрицательной"),
  oldPrice: z.coerce.number().min(0).optional(),
  ticketType: z.string().default("general"),
  note: z.string().max(200, "Максимум 200 символов").optional().or(z.literal("")),
  quota: z.coerce.number().int().min(0).optional(),
  mealIncluded: z.boolean().default(false),
  weekdayRestriction: z.boolean().default(false),
  weekdays: z.array(z.string()).default([]),
  groupTicket: z.boolean().default(false),
  groupSize: z.coerce.number().int().min(1).default(1),
  nonIndependent: z.boolean().default(false),
});

export type TicketCategory = z.infer<typeof ticketCategorySchema>;

const extraSectionSchema = z.object({
  title: z.string().trim().min(1, "Укажите заголовок").max(120, "Максимум 120 символов"),
  content: z.string().trim().min(1, "Укажите содержание").max(2000, "Максимум 2000 символов"),
});

export type ExtraSection = z.infer<typeof extraSectionSchema>;

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
  imageFile: z.any().optional(),
  extraSections: z.array(extraSectionSchema).default([]),

  // Details
  date: z.string().optional().or(z.literal("")),
  time: z.string().optional().or(z.literal("")),
  venue: z.string().trim().min(2, "Минимум 2 символа").max(150, "Максимум 150 символов"),
  city: z.string().trim().min(2, "Минимум 2 символа").max(60, "Максимум 60 символов"),
  ageRestriction: z.string().optional().or(z.literal("")),

  // Tickets
  totalQuota: z.coerce.number().int().min(1, "Минимум 1 место").optional(),
  tickets: z.array(ticketCategorySchema).min(1, "Добавьте хотя бы одну категорию билетов"),
});

export type EventFormData = z.infer<typeof eventSchema>;

export const defaultTicket: TicketCategory = {
  name: "",
  price: 0,
  oldPrice: undefined,
  ticketType: "general",
  note: "",
  quota: undefined,
  mealIncluded: false,
  weekdayRestriction: false,
  weekdays: [],
  groupTicket: false,
  groupSize: 1,
  nonIndependent: false,
};

export const defaultEventValues: EventFormData = {
  title: "",
  slug: "",
  category: "",
  badge: "",
  description: "",
  shortDescription: "",
  imageUrl: "",
  imageFile: undefined,
  extraSections: [],
  date: "",
  time: "",
  venue: "",
  city: "",
  ageRestriction: "",
  totalQuota: undefined,
  tickets: [{ ...defaultTicket }],
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
