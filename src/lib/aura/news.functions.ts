import { createServerFn } from "@tanstack/react-start";

export type NewsItem = {
  id: string;
  source: string;
  title: string;
  url: string;
  image?: string;
  excerpt?: string;
  date?: string;
  kind: "news" | "story" | "bio";
};

const RSS_SOURCES: { source: string; url: string; kind: NewsItem["kind"] }[] = [
  { source: "BBC", url: "https://feeds.bbci.co.uk/news/world/rss.xml", kind: "news" },
  { source: "CNN", url: "http://rss.cnn.com/rss/edition.rss", kind: "news" },
  { source: "Dexerto", url: "https://www.dexerto.com/feed/", kind: "news" },
];

function pickTag(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  if (!m) return undefined;
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function pickAttr(xml: string, tag: string, attr: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}=["']([^"']+)["']`, "i");
  return xml.match(re)?.[1];
}

function parseRss(xml: string, source: string, kind: NewsItem["kind"]): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRe = /<item[\s\S]*?<\/item>/gi;
  const matches = xml.match(itemRe) ?? [];
  for (const raw of matches) {
    const title = pickTag(raw, "title");
    const link = pickTag(raw, "link");
    if (!title || !link) continue;
    const desc = pickTag(raw, "description");
    const date = pickTag(raw, "pubDate");
    const image =
      pickAttr(raw, "media:content", "url") ||
      pickAttr(raw, "media:thumbnail", "url") ||
      pickAttr(raw, "enclosure", "url") ||
      raw.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
    items.push({
      id: `${source}-${link}`,
      source,
      title,
      url: link,
      image,
      excerpt: desc?.slice(0, 240),
      date,
      kind,
    });
  }
  return items;
}

async function fetchRss(url: string, source: string, kind: NewsItem["kind"]): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, { headers: { "user-agent": "AuraCalendar/1.0" } });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRss(xml, source, kind).slice(0, 8);
  } catch {
    return [];
  }
}

async function fetchReddit(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://www.reddit.com/r/stories/top.json?t=day&limit=8", {
      headers: { "user-agent": "AuraCalendar/1.0" },
    });
    if (!res.ok) return [];
    const json: any = await res.json();
    const posts = json?.data?.children ?? [];
    return posts.map((p: any): NewsItem => {
      const d = p.data;
      let img: string | undefined = d.thumbnail && d.thumbnail.startsWith("http") ? d.thumbnail : undefined;
      const preview = d.preview?.images?.[0]?.source?.url;
      if (preview) img = String(preview).replace(/&amp;/g, "&");
      return {
        id: `reddit-${d.id}`,
        source: "Reddit",
        title: d.title,
        url: `https://www.reddit.com${d.permalink}`,
        image: img,
        excerpt: (d.selftext || "").slice(0, 240),
        date: new Date(d.created_utc * 1000).toUTCString(),
        kind: "story",
      };
    });
  } catch {
    return [];
  }
}

async function fetchWikiBios(month: number, day: number): Promise<NewsItem[]> {
  try {
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const res = await fetch(
      `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/births/${mm}/${dd}`,
      { headers: { "user-agent": "AuraCalendar/1.0" } },
    );
    if (!res.ok) return [];
    const json: any = await res.json();
    const births = (json?.births ?? []).slice(0, 8);
    return births.map((b: any): NewsItem => {
      const page = b.pages?.[0];
      return {
        id: `wiki-${page?.pageid ?? b.text}`,
        source: "Wikipedia",
        title: page?.titles?.normalized ?? b.text,
        url: page?.content_urls?.desktop?.page ?? "https://en.wikipedia.org",
        image: page?.thumbnail?.source || page?.originalimage?.source,
        excerpt: page?.extract?.slice(0, 240) ?? b.text,
        date: `Born ${b.year}`,
        kind: "bio",
      };
    });
  } catch {
    return [];
  }
}

export const getDailyNews = createServerFn({ method: "GET" })
  .inputValidator((d: { month: number; day: number }) => d)
  .handler(async ({ data }) => {
    const [bbc, cnn, dexerto, reddit, wiki] = await Promise.all([
      fetchRss(RSS_SOURCES[0].url, RSS_SOURCES[0].source, RSS_SOURCES[0].kind),
      fetchRss(RSS_SOURCES[1].url, RSS_SOURCES[1].source, RSS_SOURCES[1].kind),
      fetchRss(RSS_SOURCES[2].url, RSS_SOURCES[2].source, RSS_SOURCES[2].kind),
      fetchReddit(),
      fetchWikiBios(data.month, data.day),
    ]);
    // 3 headlines from each source, shuffle for pinterest variety
    const pick = (arr: NewsItem[]) => arr.slice(0, 3);
    const combined = [...pick(bbc), ...pick(cnn), ...pick(dexerto), ...pick(reddit), ...pick(wiki)];
    // simple interleave so sources mix in masonry
    const out: NewsItem[] = [];
    const buckets = [pick(bbc), pick(cnn), pick(dexerto), pick(reddit), pick(wiki)];
    let added = true;
    while (added) {
      added = false;
      for (const b of buckets) {
        const next = b.shift();
        if (next) {
          out.push(next);
          added = true;
        }
      }
    }
    return { items: out, total: combined.length };
  });
