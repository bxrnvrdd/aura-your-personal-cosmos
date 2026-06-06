import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents, useCountry, ymd, uid, type AuraEvent } from "@/lib/aura/store";
import { getHolidaysForMonth } from "@/lib/aura/holidays";
import { CountryPicker } from "./CountryPicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function CalendarView() {
  const [events, setEvents] = useEvents();
  const [country, setCountry] = useCountry();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<AuraEvent | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = new Date();
  const todayKey = ymd(today);

  const holidays = useMemo(() => getHolidaysForMonth(country, year, month), [country, year, month]);
  const holidayMap = useMemo(() => {
    const m = new Map<string, string[]>();
    holidays.forEach((h) => {
      const arr = m.get(h.date) ?? [];
      arr.push(h.name);
      m.set(h.date, arr);
    });
    return m;
  }, [holidays]);

  const eventMap = useMemo(() => {
    const m = new Map<string, AuraEvent[]>();
    events.forEach((e) => {
      const arr = m.get(e.date) ?? [];
      arr.push(e);
      m.set(e.date, arr);
    });
    return m;
  }, [events]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const out: { date: Date; inMonth: boolean }[] = [];
    for (let i = startDay - 1; i >= 0; i--) {
      out.push({ date: new Date(year, month - 1, prevDays - i), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      out.push({ date: new Date(year, month, d), inMonth: true });
    }
    while (out.length % 7 !== 0 || out.length < 42) {
      const last = out[out.length - 1].date;
      const nd = new Date(last);
      nd.setDate(nd.getDate() + 1);
      out.push({ date: nd, inMonth: nd.getMonth() === month });
      if (out.length >= 42) break;
    }
    return out;
  }, [year, month]);

  const monthName = cursor.toLocaleString(undefined, { month: "long" });
  const selectedEvents = selected ? eventMap.get(selected) ?? [] : [];
  const selectedHolidays = selected ? holidayMap.get(selected) ?? [] : [];

  function openNew(date: string) {
    setEditing({ id: uid(), date, title: "", time: "", notes: "" });
  }
  function saveEvent() {
    if (!editing || !editing.title.trim()) return;
    setEvents((prev) => {
      const exists = prev.find((e) => e.id === editing.id);
      if (exists) return prev.map((e) => (e.id === editing.id ? editing : e));
      return [...prev, editing];
    });
    setEditing(null);
  }
  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border hover:border-accent hover:text-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-[220px] text-center">
            <div className="font-display text-3xl tracking-tight">
              {monthName} <span className="text-accent">{year}</span>
            </div>
          </div>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border hover:border-accent hover:text-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded-xl border border-border px-3 py-2 text-sm hover:border-accent hover:text-accent"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <CountryPicker value={country} onChange={setCountry} />
          <button
            onClick={() => openNew(todayKey)}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground glow-accent hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New event
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-2xl border border-border bg-card/40 p-3">
        <div className="mb-2 grid grid-cols-7 gap-2">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="rounded-lg bg-secondary/60 py-2 text-center text-xs font-medium tracking-widest text-accent"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map(({ date, inMonth }, i) => {
            const key = ymd(date);
            const isToday = key === todayKey;
            const isSelected = selected === key;
            const dayEvents = eventMap.get(key) ?? [];
            const dayHolidays = holidayMap.get(key) ?? [];
            return (
              <button
                key={i}
                onClick={() => setSelected(key)}
                onDoubleClick={() => openNew(key)}
                className={cn(
                  "group relative flex h-24 flex-col items-start rounded-xl border bg-card p-2 text-left transition-all",
                  inMonth ? "opacity-100" : "opacity-30",
                  isSelected
                    ? "border-accent glow-accent"
                    : "border-border/60 hover:border-accent/60",
                )}
              >
                <span
                  className={cn(
                    "font-display text-lg",
                    isToday ? "text-accent" : "text-foreground",
                  )}
                >
                  {date.getDate()}
                </span>
                <div className="mt-auto flex flex-wrap gap-1">
                  {dayHolidays.slice(0, 1).map((h, idx) => (
                    <span
                      key={`h${idx}`}
                      title={h}
                      className="h-1.5 w-1.5 rounded-full bg-accent"
                    />
                  ))}
                  {dayEvents.slice(0, 3).map((e, idx) => (
                    <span
                      key={`e${idx}`}
                      title={e.title}
                      className="h-1.5 w-1.5 rounded-full bg-foreground/70"
                    />
                  ))}
                </div>
                {dayHolidays.length > 0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selected && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Selected</div>
              <div className="font-display text-xl">
                {new Date(selected).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openNew(selected)}
                className="flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-sm text-accent-foreground"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
              <button onClick={() => setSelected(null)} className="rounded-lg border border-border p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {selectedHolidays.map((h, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-3 py-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="font-medium text-accent">{h}</span>
                <span className="ml-auto text-xs text-muted-foreground">Holiday</span>
              </div>
            ))}
            {selectedEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-foreground/70" />
                <div className="flex-1">
                  <div className="font-medium">{e.title}</div>
                  {e.notes && <div className="text-xs text-muted-foreground">{e.notes}</div>}
                </div>
                {e.time && <span className="text-xs text-muted-foreground">{e.time}</span>}
                <button onClick={() => setEditing(e)} className="text-xs text-accent hover:underline">Edit</button>
                <button onClick={() => deleteEvent(e.id)} className="text-xs text-destructive hover:underline">Delete</button>
              </div>
            ))}
            {selectedHolidays.length === 0 && selectedEvents.length === 0 && (
              <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                Nothing scheduled. Double-click any day or hit Add.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Event</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                {new Date(editing.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </div>
              <Input
                placeholder="Event title"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                autoFocus
              />
              <Input
                placeholder="Time (e.g. 14:00)"
                value={editing.time ?? ""}
                onChange={(e) => setEditing({ ...editing, time: e.target.value })}
              />
              <Textarea
                placeholder="Notes"
                value={editing.notes ?? ""}
                onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={saveEvent} className="bg-accent text-accent-foreground hover:bg-accent/90">Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
