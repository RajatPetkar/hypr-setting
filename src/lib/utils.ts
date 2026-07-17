import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function prettyPath(path: string) {
  return path.replace(/^\/home\/[^/]+/, "~");
}

export function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}
