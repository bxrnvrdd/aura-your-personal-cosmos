import { Calendar, Inbox, StickyNote, Bell, Trash2, Settings, Sparkles, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersistent } from "@/lib/aura/store";

export type ViewId = "calendar" | "events" | "notes" | "reminders" | "trash" | "settings";

const NAV: { id: ViewId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "events", label: "Events", icon: Inbox },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "trash", label: "Trash", icon: Trash2 },
];

export function useSidebarCollapsed() {
  return usePersistent<boolean>("aura.sidebar.collapsed", false);
}

export function Sidebar({
  view,
  onView,
  today,
}: {
  view: ViewId;
  onView: (v: ViewId) => void;
  today: Date;
}) {
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const day = today.getDate();
  const month = today.toLocaleString(undefined, { month: "long" });
  const year = today.getFullYear();

  return (
    <aside
      className={cn(
        "relative flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-out",
        collapsed ? "w-[76px] p-3" : "w-72 p-6",
      )}
    >
      <div className={cn("mb-8 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="font-display text-2xl tracking-tight">aura</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="grid h-9 w-9 place-items-center rounded-xl border border-sidebar-border text-foreground/70 hover:border-accent hover:text-accent"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed ? (
        <div className="mb-8 rounded-2xl bg-accent p-5 text-accent-foreground glow-accent">
          <div className="font-display text-7xl leading-none">{day}</div>
          <div className="mt-2 text-sm opacity-80">
            {month} {year}
          </div>
        </div>
      ) : (
        <div className="mb-6 grid h-12 w-full place-items-center rounded-xl bg-accent font-display text-2xl text-accent-foreground">
          {day}
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((n) => {
          const active = view === n.id;
          const Icon = n.icon;
          return (
            <button
              key={n.id}
              onClick={() => onView(n.id)}
              title={n.label}
              className={cn(
                "group flex items-center gap-3 rounded-xl text-sm transition-all",
                collapsed ? "h-10 w-full justify-center" : "px-4 py-2.5",
                active
                  ? "bg-accent text-accent-foreground glow-accent"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span>{n.label}</span>}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => onView("settings")}
        title="Settings"
        className={cn(
          "mt-4 flex items-center gap-3 rounded-xl text-sm transition-all",
          collapsed ? "h-10 w-full justify-center" : "px-4 py-2.5",
          view === "settings"
            ? "bg-accent text-accent-foreground"
            : "text-foreground/70 hover:bg-secondary hover:text-foreground",
        )}
      >
        <Settings className="h-4 w-4" />
        {!collapsed && <span>Settings</span>}
      </button>
    </aside>
  );
}
