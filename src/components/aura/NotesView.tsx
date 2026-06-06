import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useNotes, uid } from "@/lib/aura/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function NotesView() {
  const [notes, setNotes] = useNotes();
  const [draft, setDraft] = useState({ title: "", body: "" });

  function add() {
    if (!draft.title.trim()) return;
    setNotes((prev) => [
      { id: uid(), title: draft.title, body: draft.body, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setDraft({ title: "", body: "" });
  }
  function remove(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="font-display text-4xl">Notes</div>
      <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
        <Input placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <Textarea placeholder="Write a note..." value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
        <button
          onClick={add}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground glow-accent"
        >
          <Plus className="h-4 w-4" /> Add note
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {notes.map((n) => (
          <div key={n.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="font-display text-xl">{n.title}</div>
              <button onClick={() => remove(n.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">{n.body}</p>
            <div className="mt-3 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No notes yet.
          </div>
        )}
      </div>
    </div>
  );
}
