import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Canonical Shadcn UI class merging utility
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
