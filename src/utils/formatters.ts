import * as XLSX from 'xlsx';
import { Language } from '../types';

export function toBengaliNumerals(numStr: string | number): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numStr).replace(/[0-9]/g, (digit) => bnDigits[parseInt(digit, 10)]);
}

export function formatBDT(amount: number, lang: Language = 'bn'): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);

  if (lang === 'bn') {
    return `৳ ${toBengaliNumerals(formatted)}`;
  }
  return `BDT ${formatted}`;
}

export function formatDate(dateStr: string, lang: Language = 'bn'): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const formatted = date.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', options);
  return formatted;
}

export function calculateNetProfit(grossProfit: number, vatPct: number) {
  const vatAmount = (grossProfit * vatPct) / 100;
  const netProfit = grossProfit - vatAmount;
  return { vatAmount, netProfit };
}

export function exportToExcel(data: Record<string, any>[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
