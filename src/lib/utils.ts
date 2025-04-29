import { clsx, type ClassValue } from "clsx"
import pako from "pako";
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

export async function compressFile(data: string | pako.Data | ArrayBuffer): Promise<ArrayBuffer> {
  const compressed = pako.deflate(data, { level: 3 });
  const arr = pako.inflate(compressed);
  const blob = new Blob([ arr ], { type: 'image/jpeg' });
  const result = await (new Response(blob).arrayBuffer());
  return result;
}

export function sleep(duration: number | undefined) {
  return new Promise(resolve => setTimeout(resolve, duration));
}