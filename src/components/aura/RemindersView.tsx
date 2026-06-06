import { useState } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { useReminders, uid, ymd } from "@/lib/aura/store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function RemindersView() {
  const [reminders, setReminders] = useReminders();
  const [text, setText] = useState("");
  const [date, setDate] = useState(ymd(new Date()));

  function add() {
    if (!text.trim()) return;
    setReminders((prev) => [{ id: uid(), text, date, done: false }, ...prev]);
    setText("");
  }
  function toggle(id: string) {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  }
  function remove(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="font-display text-4xl">Reminders</div>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-4">
        <Input className="flex-1 min-w-[200px]" placeholder="Remind me to..." value={text} onChange={(e) => setText(e.target.value)} />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
        <button onClick={add} className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground glow-accent">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {reminders.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <button
              onClick={() => toggle(r.id)}
              className={cn(
                "grid h-6 w-6 place-items-center rounded-md border",
                r.done ? "border-accent bg-accent text-accent-foreground" : "border-border",
              )}
            >
              {r.done && <Check className="h-3.5 w-3.5" />}
            </button>
            <div className={cn("flex-1", r.done && "line-through text-muted-foreground")}>{r.text}</div>
            <div className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</div>
            <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {reminders.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No reminders.
          </div>
        )}
      </div>
    </div>
  );
}
