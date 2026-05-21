export const revalidate = 3600; // cache for 1 hour

// FIX M1: added auth imports — GET was previously unauthenticated
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface NewsItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    source: string;
    category: "Technology" | "Business";
    image: string | null;
}

const FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", source: "BBC Technology", category: "Technology" as const },
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml", source: "BBC Business", category: "Business" as const },
  { url: "https://techcrunch.com/feed/", source: "TechCrunch", category: "Technology" as const },
  { url: "https://www.wired.com/feed/rss", source: "Wired", category: "Technology" as const },
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", source: "CNBC", category: "Business" as const },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", source: "NY Times Tech", category: "Technology" as const },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", source: "NY Times Biz", category: "Business" as const },
  { url: "https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines", source: "MarketWatch", category: "Business" as const },
  ];

function extractTag(xml: string, tag: string): string {
    const cdata = xml.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i"));
    if (cdata) return cdata[1].trim();
    const regular = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
    if (regular) return regular[1].trim();
    const attr = xml.match(new RegExp(`<${tag}[^>]*\\shref=["']([^"']+)["']`, "i"));
    if (attr) return attr[1].trim();
    return "";
}

function extractImage(block: string): string | null {
    const mediaThumbnail = block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
    if (mediaThumbnail) return mediaThumbnail[1];
    const mediaContent = block.match(/<media:content[^>]+url=["']([^"']+)["'][^>]*type=["']image[^"']*["']/i)
      || block.match(/<media:content[^>]+type=["']image[^"']*["'][^>]+url=["']([^"']+)["']/i);
    if (mediaContent) return mediaContent[1];
    const enclosure = block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image[^"']*["']/i)
      || block.match(/<enclosure[^>]+type=["']image[^"']*["'][^>]+url=["']([^"']+)["']/i);
    if (enclosure) return enclosure[1];
    const imgBlock = block.match(/<image>([\s\S]*?)<\/image>/i);
    if (imgBlock) {
          const imgUrl = imgBlock[1].match(/<url[^>]*>([^<]+)<\/url>/i);
          if (imgUrl) return imgUrl[1].trim();
    }
    const imgSrc = block.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgSrc) return imgSrc[1];
    return null;
}

function stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
      .trim();
}

const TRUSTED_IMAGE_DOMAINS = [
    "bbc.co.uk", "bbc.com", "bbci.co.uk",
    "techcrunch.com",
    "wired.com",
    "cnbc.com",
    "nytimes.com",
    "marketwatch.com", "wsj.net",
    "wordpress.com", "wp.com",
  ];

function sanitizeImageUrl(url: string | null): string | null {
    if (!url) return null;
    try {
          const parsed = new URL(url);
          if (parsed.protocol !== "https:") return null;
          const hostname = parsed.hostname;
          const trusted = TRUSTED_IMAGE_DOMAINS.some(
                  (d) => hostname === d || hostname.endsWith(`.${d}`)
                );
          return trusted ? url : null;
    } catch {
          return null;
    }
}

async function fetchFeed(feed: typeof FEEDS[number]): Promise<NewsItem[]> {
    try {
          // SEC-5: 5-second timeout so a slow feed doesn't hang the serverless function
      const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          let res;
          try {
                  res = await fetch(feed.url, {
                            headers: { "User-Agent": "Mozilla/5.0 (compatible; HelpdeskNewsBot/1.0)" },
                            signal: controller.signal,
                            next: { revalidate: 3600 },
                  });
          } finally {
                  clearTimeout(timeoutId);
          }

      if (!res.ok) return [];

      // FIX L4: cap raw XML size before regex parsing to prevent ReDoS on malformed feeds
      const rawXml = await res.text();
          const xml = rawXml.slice(0, 500_000);

      const items: NewsItem[] = [];
          const itemRegex = /<item>([\s\S]*?)<\/item>/g;
          let match;

      while ((match = itemRegex.exec(xml)) !== null) {
              const block = match[1];
              const title = stripHtml(extractTag(block, "title"));
              const link  = extractTag(block, "link") || extractTag(block, "guid");
              const description = stripHtml(extractTag(block, "description")).slice(0, 200);
              const pubDate = extractTag(block, "pubDate");
              const image = sanitizeImageUrl(extractImage(block));

            if (title && link && link.startsWith("https://")) {
                      items.push({ title, link, description, pubDate, source: feed.source, category: feed.category, image });
            }
      }
          return items.slice(0, 8);
    } catch {
          return [];
    }
}

/**
 * FIX M1: Added authentication check.
 *
 * WHY THE ENDPOINT NEEDED AUTH:
 *   Previously any unauthenticated caller could hit this endpoint and force the
 *   server to make 8 outbound HTTP requests to external RSS feeds, consuming
 *   Vercel function invocation budget and egress bandwidth.  Although the RSS
 *   data is public, this is still an unauthenticated resource drain — and the
 *   news widget is only shown to logged-in users anyway.
 *
 * THE FIX:
 *   We gate the endpoint behind getServerSession (the same pattern used by
 *   /api/kb, /api/notifications, /api/tickets, etc.).  Unauthenticated callers
 *   receive a 401 without touching the RSS feeds or consuming bandwidth.
 *   The revalidate = 3600 cache still applies for authenticated callers, so
 *   the feeds are only fetched once per hour regardless of traffic.
 */
export async function GET() {
    // Auth guard — news is only for logged-in users
  const session = await getServerSession(authOptions);
    if (!session) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const items: NewsItem[] = results
      .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .sort((a, b) => {
              const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
              const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
              return db - da;
      })
      .slice(0, 60);

  return Response.json(items);
}
