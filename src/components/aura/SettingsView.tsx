import { Sparkles, Waves, Moon, CloudDrizzle, Check } from "lucide-react";
import { THEMES, type ThemeId } from "@/lib/aura/themes";
import { useTheme, useCountry } from "@/lib/aura/store";
import { CountryPicker } from "./CountryPicker";
import { cn } from "@/lib/utils";

const ICONS: Record<ThemeId, React.ComponentType<{ className?: string }>> = {
  purple: Sparkles,
  chronos: Waves,
  abyss: Moon,
  petrichor: CloudDrizzle,
};

export function SettingsView() {
  const [theme, setTheme] = useTheme();
  const [country, setCountry] = useCountry();

  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <div>
        <div className="font-display text-4xl">Settings</div>
        <div className="text-sm text-muted-foreground">Personalize your aura.</div>
      </div>

      <section>
        <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Theme</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {THEMES.map((t) => {
            const Icon = ICONS[t.id];
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "group relative flex flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left transition-all",
                  active ? "border-accent glow-accent" : "border-border hover:border-accent/60",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{ background: t.swatch, color: "#0a0a0a" }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {active && (
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-display text-lg">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.description}</div>
                </div>
                <div
                  className="h-1 w-full rounded-full"
                  style={{ background: t.swatch, opacity: 0.6 }}
                />
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Region</div>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="flex-1">
            <div className="font-display text-lg">Country</div>
            <div className="text-sm text-muted-foreground">
              Determines which national holidays appear on your calendar.
            </div>
          </div>
          <CountryPicker value={country} onChange={setCountry} />
        </div>
      </section>

      <section>
        <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">About</div>
        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <div className="font-display text-lg text-foreground">aura</div>
          A focused calendar that adapts to the way you see time.
        </div>
      </section>
    </div>
  );
}
