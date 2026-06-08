import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Newspaper, Loader2 } from "lucide-react";
import { getDailyNews, type NewsItem } from "@/lib/aura/news.functions";

const SOURCE_COLOR: Record<string, string> = {
  BBC: "bg-red-500/15 text-red-300 border-red-400/30",
  CNN: "bg-orange-500/15 text-orange-300 border-orange-400/30",
  Dexerto: "bg-yellow-500/15 text-yellow-300 border-yellow-400/30",
  Reddit: "bg-orange-600/15 text-orange-200 border-orange-500/30",
  Wikipedia: "bg-sky-500/15 text-sky-200 border-sky-400/30",
};

export function NewsView({ date }: { date: Date }) {
  const fetchNews = useServerFn(getDailyNews);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["aura.news", m, d],
    queryFn: () => fetchNews({ data: { month: m, day: d } }),
    staleTime: 5 * 60_000,
  });

  const items = data?.items ?? [];
  const longDate = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent">Today on the wire</div>
          <div className="font-display text-4xl">{longDate}</div>
          <div className="text-sm text-muted-foreground">
            Headlines from BBC, CNN, Dexerto, Reddit and Wikipedia.
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm hover:border-accent hover:text-accent"
        >
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Newspaper className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Gathering today's stories…
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Couldn't load news right now. Try refreshing in a moment.
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [column-fill:_balance]">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const color = SOURCE_COLOR[item.source] ?? "bg-secondary text-foreground border-border";
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-accent hover:glow-accent"
    >
      {item.image && (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="w-full object-cover"
          style={{ maxHeight: 320 }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${color}`}>
            {item.source}
          </span>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="font-display text-lg leading-snug">{item.title}</div>
        {item.excerpt && (
          <div className="text-xs leading-relaxed text-muted-foreground">{item.excerpt}…</div>
        )}
        {item.date && <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">{item.date}</div>}
      </div>
    </a>
  );
}
