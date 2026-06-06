export function TrashView() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="font-display text-4xl">Trash</div>
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        Trash is empty.
      </div>
    </div>
  );
}
