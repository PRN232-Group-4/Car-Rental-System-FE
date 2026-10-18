import { z } from "zod";

export const findFilterSchema = z.object({
  search: z.string().optional().default(""),
  category: z.enum(["all", "car", "electric_car", "motorbike", "electric_motorbike"]).default("all"),
  facilityId: z.string().optional().default("all"),
  brand: z.string().optional().default("all"),
  seats: z.coerce.number().optional().default(0),
  transmission: z.string().optional().default("all"),
  fuelType: z.string().optional().default("all"),
  priceMin: z.coerce.number().optional().default(0),
  priceMax: z.coerce.number().optional().default(0),
  sort: z.enum(["price_asc", "price_desc", "year_desc", "name_asc"]).default("price_asc"),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(9),
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  mode: z.enum(["hourly", "longterm"]).default("hourly"),
});

export type FindFilterState = z.infer<typeof findFilterSchema>;
