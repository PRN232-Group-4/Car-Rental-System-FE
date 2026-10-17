import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Ghép và tối ưu hóa class Tailwind theo chuẩn v3.1.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
