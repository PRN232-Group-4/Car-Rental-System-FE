import { z } from "zod";
import { formatTime } from "@/lib/time";

export const findFilterSchema = z.object({
  search: z.string().optional().default(""),
  category: z.enum(["all", "car", "electric_car", "motorbike", "electric_motorbike"]).default("all").catch("all"),
  facilityId: z.string().regex(/^(all|[1-9]\d*)$/).default("all").catch("all"),
  brand: z.string().optional().default("all"),
  seats: z.coerce.number().int().nonnegative().default(0).catch(0),
  transmission: z.enum(["all", "automatic", "manual", "cvt"]).default("all").catch("all"),
  fuelType: z.enum(["all", "electric", "petrol"]).default("all").catch("all"),
  priceMin: z.coerce.number().finite().nonnegative().default(0).catch(0),
  priceMax: z.coerce.number().finite().nonnegative().default(0).catch(0),
  sort: z.enum(["price_asc", "price_desc", "year_desc", "name_asc"]).default("price_asc").catch("price_asc"),
  page: z.coerce.number().int().min(1).default(1).catch(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(9).catch(9),
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  mode: z.enum(["hourly", "longterm"]).default("hourly").catch("hourly"),
}).transform((filters) => {
  // The home search widget sends local dates + times; the picker sends UTC ISO.
  const utc = (value?: string, time?: string) => {
    if (!value) return undefined;
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T${time || "09:00"}:00+07:00` : value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  };
  const startDate = utc(filters.startDate, filters.startTime);
  const endDate = utc(filters.endDate, filters.endTime);
  const complete = !!startDate && !!endDate && startDate < endDate;
  return {
    ...filters,
    priceMax: filters.priceMax > 0 && filters.priceMax < filters.priceMin ? 0 : filters.priceMax,
    startDate: complete ? startDate : undefined,
    endDate: complete ? endDate : undefined,
    startTime: complete ? formatTime(startDate) : undefined,
    endTime: complete ? formatTime(endDate) : undefined,
  };
});

export type FindFilterState = z.infer<typeof findFilterSchema>;
