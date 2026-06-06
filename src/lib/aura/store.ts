import { useEffect, useState, useCallback } from "react";
import type { ThemeId } from "./themes";

const isBrowser = typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function usePersistent<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(fallback);
  useEffect(() => {
    setState(read<T>(key, fallback));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const update = useCallback(
    (v: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        write(key, next);
        return next;
      });
    },
    [key],
  );
  return [state, update] as const;
}

export const useTheme = () => usePersistent<ThemeId>("aura.theme", "purple");
export const useCountry = () => usePersistent<string>("aura.country", "US");

export type AuraEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  time?: string;
  notes?: string;
  color?: string;
};

export const useEvents = () => usePersistent<AuraEvent[]>("aura.events", []);

export type AuraNote = { id: string; title: string; body: string; createdAt: string };
export const useNotes = () => usePersistent<AuraNote[]>("aura.notes", []);

export type AuraReminder = { id: string; text: string; date: string; done: boolean };
export const useReminders = () => usePersistent<AuraReminder[]>("aura.reminders", []);

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
