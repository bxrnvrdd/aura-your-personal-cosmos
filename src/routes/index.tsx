import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sidebar, type ViewId } from "@/components/aura/Sidebar";
import { CalendarView } from "@/components/aura/CalendarView";
import { EventsView } from "@/components/aura/EventsView";
import { NotesView } from "@/components/aura/NotesView";
import { RemindersView } from "@/components/aura/RemindersView";
import { SettingsView } from "@/components/aura/SettingsView";
import { TrashView } from "@/components/aura/TrashView";
import { ThemeApplier } from "@/components/aura/ThemeApplier";
import { useTheme } from "@/lib/aura/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aura — Calendar" },
      { name: "description", content: "A focused calendar that adapts to the way you see time." },
      { property: "og:title", content: "Aura — Calendar" },
      { property: "og:description", content: "A focused calendar with four mood-shifting themes." },
    ],
  }),
  component: Index,
});

function Index() {
  const [view, setView] = useState<ViewId>("calendar");
  const [theme] = useTheme();
  const today = new Date();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <ThemeApplier theme={theme} />
      <Sidebar view={view} onView={setView} today={today} />
      <main className="flex flex-1 flex-col overflow-x-hidden">
        {view === "calendar" && <CalendarView />}
        {view === "events" && <EventsView />}
        {view === "notes" && <NotesView />}
        {view === "reminders" && <RemindersView />}
        {view === "trash" && <TrashView />}
        {view === "settings" && <SettingsView />}
      </main>
    </div>
  );
}
