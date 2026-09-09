import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function riskColor(riesgo: string | null): string {
  if (!riesgo) return "bg-base-600 text-gray-300";
  const r = riesgo.toLowerCase();
  if (r.includes("alto")) return "bg-risk-high/15 text-risk-high border border-risk-high/30";
  if (r.includes("medio")) return "bg-risk-medium/15 text-risk-medium border border-risk-medium/30";
  if (r.includes("bajo")) return "bg-risk-low/15 text-risk-low border border-risk-low/30";
  return "bg-base-600 text-gray-300";
}
