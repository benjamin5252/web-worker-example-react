import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function heavyCalculation(n: number): number {
  let result = 0;
  for (let i = 0; i < n; i++) {
      result += i;
  }
  return result;
}

export function freezeThread(ms: number) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // Busy-wait loop — do nothing, just block
  }
}