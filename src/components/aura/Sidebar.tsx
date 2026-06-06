import { Calendar, Inbox, StickyNote, Bell, Trash2, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewId = "calendar" | "events" | "notes" | "reminders" | "trash" | "settings";

const NAV: { id: ViewId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "events", label: "Events", icon: Inbox },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "trash", label: "Trash", icon: Trash2 },
];

export function Sidebar({
  view,
  onView,
  today,
}: {
  view: ViewId;
  onView: (v: ViewId) => void;
  today: Date;
}) {
  const day = today.getDate();
  const month = today.toLocaleString(undefined, { month: "long" });
  const year = today.getFullYear();

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-6">
      <div className="mb-8 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="font-display text-2xl tracking-tight">aura</div>
      </div>

      <div className="mb-8">
        <div className="font-display text-7xl leading-none text-accent">{day}</div>
        <div className="mt-2 text-sm text-muted-foreground">
          {month} {year}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((n) => {
          const active = view === n.id;
          const Icon = n.icon;
          return (
            <button
              key={n.id}
              onClick={() => onView(n.id)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all",
                active
                  ? "bg-accent text-accent-foreground glow-accent"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{n.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => onView("settings")}
        className={cn(
          "mt-4 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all",
          view === "settings"
            ? "bg-accent text-accent-foreground"
            : "text-foreground/70 hover:bg-secondary hover:text-foreground",
        )}
      >
        <Settings className="h-4 w-4" />
        Settings
      </button>
    </aside>
  );
}
