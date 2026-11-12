import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Light haptic tap where supported (Android/Chrome); silently ignored on iOS Safari. */
export function haptic(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* noop */
  }
}
