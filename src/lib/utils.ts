import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency: 'CUP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Formato para mostrar en la UI
export const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';
// Formato para guardar en el servidor (UTC completo)
export const SERVER_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

export function formatDateToServer(date: Date | string | null | undefined): string {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    // Asegurarnos de que la fecha esté en UTC
    return dateObj.toISOString();
  } catch {
    return '';
  }
}

export function formatDateToDisplay(date: Date | string | null | undefined): string {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DISPLAY_DATE_FORMAT, { locale: es });
  } catch {
    return '';
  }
}

export function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  try {
    return typeof date === 'string' ? parseISO(date) : date;
  } catch {
    return null;
  }
} 