import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import i18n from './i18n';

export function formatCurrency(value: number): string {
  const language = i18n.language || 'pt-BR';
  return new Intl.NumberFormat(language === 'en-US' ? 'en-US' : 'pt-BR', {
    style: 'currency',
    currency: language === 'en-US' ? 'USD' : 'BRL',
    minimumFractionDigits: language === 'en-US' ? 2 : 2,
    maximumFractionDigits: language === 'en-US' ? 2 : 2,
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const utcDate = new Date(Date.UTC(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  ));
  const language = i18n.language || 'pt-BR';
  return utcDate.toLocaleDateString(language === 'en-US' ? 'en-US' : 'pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function formatDistance(km: number): string {
  return `${km.toFixed(0)} km`;
}
