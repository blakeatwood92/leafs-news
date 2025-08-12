// Next.js 14+ (route handlers)
import { NextResponse } from "next/server"

const RSS_SOURCES = [
  // Add more allowed RSS feeds as you like
  "https://news.google.com/rss/search?q=Toronto+Maple+Leafs&hl=en-CA&gl=CA&ceid=CA:en",
  "https://thehockeywriters.com/feed/", // global feed; you can filter later
]

async function fetchRSS(url: string) {
  try {
    const res = await fetch(url, {
      next: { revalidate: 600 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LeafsNews/1.0)",
      },
    })
    if (!res.ok) {
      console.warn(`Failed to fetch RSS from ${url}: ${res.status}`)
      return []
    }
    const text = await res.text()
    // tiny RSS parse without deps (very naive)
    const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
      const get = (tag: string) =>
        (m[1].match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`)) || [, ""])[1]
          .replace(/<!\[CDATA\[|\]\]>/g, "")
          .trim()
      return {
        title: get("title"),
        link: get("link"),
        source: new URL(url).hostname,
        published_at: get("pubDate"),
        summary: get("description"),
      }
    })
    return items
  } catch (error) {
    console.warn(`Error fetching RSS from ${url}:`, error)
    return []
  }
}

async function fetchGNews() {
  try {
    const key = process.env.GNEWS_API_KEY
    if (!key) {
      console.log("GNEWS_API_KEY not found, skipping GNews")
      return []
    }
    const q = encodeURIComponent(`"Toronto Maple Leafs"`)
    const res = await fetch(`https://gnews.io/api/v4/search?q=${q}&lang=en&country=ca&max=20&apikey=${key}`, {
      next: { revalidate: 600 },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LeafsNews/1.0)",
      },
    })
    if (!res.ok) {
      console.warn(`GNews API failed: ${res.status}`)
      return []
    }
    const data = await res.json()
    return (data.articles || []).map((a: any) => ({
      title: a.title,
      link: a.url,
      source: new URL(a.source?.url || a.url).hostname,
      published_at: a.publishedAt,
      summary: a.description,
    }))
  } catch (error) {
    console.warn("Error fetching GNews:", error)
    return []
  }
}

export async function GET() {
  try {
    console.log("Fetching news from sources...")

    const [gnews, ...rssLists] = await Promise.allSettled([fetchGNews(), ...RSS_SOURCES.map(fetchRSS)])

    // Extract successful results
    const allResults = [
      gnews.status === "fulfilled" ? gnews.value : [],
      ...rssLists.map((result) => (result.status === "fulfilled" ? result.value : [])),
    ]

    const all = allResults.flat()

    // de-dupe by URL
    const seen = new Set<string>()
    const unique = all.filter((i) => {
      if (!i.link || !i.title) return false
      const u = i.link.split("?")[0]
      if (seen.has(u)) return false
      seen.add(u)
      return true
    })

    // sort newest first
    unique.sort((a, b) => {
      const dateA = new Date(a.published_at || 0).getTime()
      const dateB = new Date(b.published_at || 0).getTime()
      return dateB - dateA
    })

    // keep Leafs-only (simple filter; you can improve later)
    const filtered = unique.filter(
      (i) => /toronto maple leafs|leafs|maple leafs/i.test(i.title) || /toronto maple leafs/i.test(i.summary || ""),
    )

    console.log(`Found ${filtered.length} Leafs articles`)

    return NextResponse.json({
      count: filtered.length,
      articles: filtered.slice(0, 50),
      sources: RSS_SOURCES.length + (process.env.GNEWS_API_KEY ? 1 : 0),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in news API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch news",
        count: 0,
        articles: [],
        sources: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
