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

// Shared in-memory cache + subscribers so every component using the same key
// stays in sync (otherwise each useState is isolated and Settings updates
// don't propagate to ThemeApplier, Sidebar, etc.).
const cache = new Map<string, unknown>();
const subs = new Map<string, Set<() => void>>();

function subscribe(key: string, cb: () => void) {
  let set = subs.get(key);
  if (!set) {
    set = new Set();
    subs.set(key, set);
  }
  set.add(cb);
  return () => set!.delete(cb);
}
function emit(key: string) {
  subs.get(key)?.forEach((cb) => cb());
}

function usePersistent<T>(key: string, fallback: T) {
  const getInitial = () => {
    if (cache.has(key)) return cache.get(key) as T;
    const v = read<T>(key, fallback);
    cache.set(key, v);
    return v;
  };
  const [state, setState] = useState<T>(getInitial);

  useEffect(() => {
    // Sync from localStorage on mount (SSR -> client hydration).
    const v = read<T>(key, fallback);
    cache.set(key, v);
    setState(v);
    return subscribe(key, () => setState(cache.get(key) as T));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (v: T | ((prev: T) => T)) => {
      const prev = (cache.get(key) as T) ?? fallback;
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      cache.set(key, next);
      write(key, next);
      emit(key);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
