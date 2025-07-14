// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ✅ PASTIKAN ADA KEYWORD 'export' DI SINI
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ✅ PASTIKAN ADA KEYWORD 'export' DI SINI
export const formatCompactCurrency = (amount: number) => {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}M`
  } else if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}jt`
  } else if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}rb`
  }
  return formatCurrency(amount)
}