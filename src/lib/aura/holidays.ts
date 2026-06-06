import Holidays from "date-holidays";

export type HolidayItem = {
  date: string; // YYYY-MM-DD
  name: string;
  type: string;
};

const cache = new Map<string, HolidayItem[]>();

export function getHolidaysForYear(country: string, year: number): HolidayItem[] {
  const key = `${country}-${year}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const hd = new Holidays(country);
    const list = hd.getHolidays(year) || [];
    const items: HolidayItem[] = list.map((h: any) => ({
      date: (h.date as string).slice(0, 10),
      name: h.name,
      type: h.type,
    }));
    cache.set(key, items);
    return items;
  } catch {
    return [];
  }
}

export function getHolidaysForMonth(country: string, year: number, month: number): HolidayItem[] {
  const monthStr = String(month + 1).padStart(2, "0");
  return getHolidaysForYear(country, year).filter((h) => h.date.startsWith(`${year}-${monthStr}`));
}
