export const revalidate = 3600; // cache for 1 hour

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
  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml",       source: "BBC Technology", category: "Technology" as const },
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml",         source: "BBC Business",   category: "Business"   as const },
  { url: "https://techcrunch.com/feed/",                           source: "TechCrunch",     category: "Technology" as const },
  { url: "https://www.wired.com/feed/rss",                         source: "Wired",          category: "Technology" as const },
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",  source: "CNBC",           category: "Business"   as const },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", source: "NY Times Tech", category: "Technology" as const },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",   source: "NY Times Biz",  category: "Business"   as const },
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
  // media:thumbnail url="..."
  const mediaThumbnail = block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  if (mediaThumbnail) return mediaThumbnail[1];

  // media:content url="..." type="image/..."
  const mediaContent = block.match(/<media:content[^>]+url=["']([^"']+)["'][^>]*type=["']image[^"']*["']/i)
    || block.match(/<media:content[^>]+type=["']image[^"']*["'][^>]+url=["']([^"']+)["']/i);
  if (mediaContent) return mediaContent[1];

  // enclosure type="image/..."
  const enclosure = block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image[^"']*["']/i)
    || block.match(/<enclosure[^>]+type=["']image[^"']*["'][^>]+url=["']([^"']+)["']/i);
  if (enclosure) return enclosure[1];

  // <image><url>...</url></image>
  const imgBlock = block.match(/<image>([\s\S]*?)<\/image>/i);
  if (imgBlock) {
    const imgUrl = imgBlock[1].match(/<url[^>]*>([^<]+)<\/url>/i);
    if (imgUrl) return imgUrl[1].trim();
  }

  // og:image or any img src in description HTML
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

async function fetchFeed(feed: typeof FEEDS[number]): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HelpdeskNewsBot/1.0)" },
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
      const description = stripHtml(extractTag(block, "description")).slice(0, 200);
      const pubDate = extractTag(block, "pubDate");
      const image = extractImage(block);

      if (title && link && link.startsWith("http")) {
        items.push({ title, link, description, pubDate, source: feed.source, category: feed.category, image });
      }
    }
    return items.slice(0, 8);
  } catch {
    return [];
  }
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
    .slice(0, 60);

  return Response.json(items);
}
