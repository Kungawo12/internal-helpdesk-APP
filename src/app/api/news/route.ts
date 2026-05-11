export const revalidate = 3600; // cache for 1 hour

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: "Technology" | "Business";
}

const FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml",  source: "BBC Technology", category: "Technology" as const },
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml",    source: "BBC Business",   category: "Business"    as const },
  { url: "https://techcrunch.com/feed/",                      source: "TechCrunch",     category: "Technology" as const },
  { url: "https://www.wired.com/feed/rss",                    source: "Wired",          category: "Technology" as const },
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", source: "CNBC",       category: "Business"    as const },
];

function extractTag(xml: string, tag: string): string {
  // CDATA
  const cdata = xml.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i"));
  if (cdata) return cdata[1].trim();
  // Regular content
  const regular = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (regular) return regular[1].trim();
  // Self-closing href (Atom style)
  const attr = xml.match(new RegExp(`<${tag}[^>]*\\shref=["']([^"']+)["']`, "i"));
  if (attr) return attr[1].trim();
  return "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").trim();
}

async function fetchFeed(feed: typeof FEEDS[number]): Promise<NewsItem[]> {
  const res = await fetch(feed.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HelpdeskBot/1.0)" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];

  const xml = await res.text();
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = stripHtml(extractTag(block, "title"));
    const link  = extractTag(block, "link") || extractTag(block, "guid");
    const description = stripHtml(extractTag(block, "description")).slice(0, 160);
    const pubDate = extractTag(block, "pubDate");

    if (title && link && link.startsWith("http")) {
      items.push({ title, link, description, pubDate, source: feed.source, category: feed.category });
    }
  }
  return items.slice(0, 8);
}

export async function GET() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const items: NewsItem[] = results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
    .flatMap(r => r.value)
    .sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    })
    .slice(0, 30);

  return Response.json(items);
}
