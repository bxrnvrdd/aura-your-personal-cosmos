import { useMemo } from "react";
import { useEvents, useCountry } from "@/lib/aura/store";
import { getHolidaysForYear } from "@/lib/aura/holidays";
import { COUNTRIES } from "@/lib/aura/countries";

export function EventsView() {
  const [events] = useEvents();
  const [country] = useCountry();
  const year = new Date().getFullYear();
  const todayKey = new Date().toISOString().slice(0, 10);

  const merged = useMemo(() => {
    const hs = getHolidaysForYear(country, year).map((h) => ({
      date: h.date,
      title: h.name,
      kind: "holiday" as const,
    }));
    const es = events.map((e) => ({ date: e.date, title: e.title, kind: "event" as const, time: e.time, notes: e.notes }));
    return [...hs, ...es]
      .filter((x) => x.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 80);
  }, [events, country, year, todayKey]);

  const countryName = COUNTRIES.find((c) => c.code === country)?.name ?? country;

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <div className="font-display text-4xl">Events</div>
        <div className="text-sm text-muted-foreground">
          Upcoming events and national holidays in {countryName}
        </div>
      </div>
      <div className="space-y-2">
        {merged.map((m, i) => {
          const d = new Date(m.date);
          return (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="text-center">
                <div className="font-display text-2xl text-accent">{d.getDate()}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {d.toLocaleString(undefined, { month: "short" })}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium">{m.title}</div>
                <div className="text-xs text-muted-foreground">
                  {d.toLocaleDateString(undefined, { weekday: "long" })}
                  {"time" in m && m.time ? ` · ${m.time}` : ""}
                </div>
              </div>
              <span
                className={
                  m.kind === "holiday"
                    ? "rounded-full border border-accent/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent"
                    : "rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground"
                }
              >
                {m.kind}
              </span>
            </div>
          );
        })}
        {merged.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No upcoming events.
          </div>
        )}
      </div>
    </div>
  );
}
