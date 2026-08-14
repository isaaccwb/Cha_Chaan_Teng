import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 港幣顯示格式,例如 formatHKD(65) => "$65" */
export function formatHKD(amount: number | string) {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return `$${n.toFixed(n % 1 === 0 ? 0 : 2)}`;
}
