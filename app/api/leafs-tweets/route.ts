import { type NextRequest, NextResponse } from "next/server"

const TWITTER_ENDPOINT = "https://api.twitter.com/2/tweets/search/recent"

// Default Leafs-focused query
const DEFAULT_QUERY =
  '(#LeafsForever OR #GoLeafsGo OR #LeafsNation OR #LeafsNatio OR "Toronto Maple Leafs" OR Leafs) lang:en -is:retweet -is:reply'

function buildUrl(q: string) {
  const params = new URLSearchParams({
    query: q,
    max_results: "25",
    "tweet.fields": ["created_at", "public_metrics", "lang", "possibly_sensitive", "entities", "attachments"].join(","),
    expansions: ["author_id", "attachments.media_keys"].join(","),
    "user.fields": ["name", "username", "verified", "profile_image_url"].join(","),
    "media.fields": ["type", "url", "preview_image_url", "alt_text", "width", "height"].join(","),
  })
  return `${TWITTER_ENDPOINT}?${params.toString()}`
}

const SAMPLE_PAYLOAD = {
  sample: true,
  articles: [
    {
      id: "0001",
      text: "Leafs camp buzz: top line flying at practice today. #LeafsForever",
      created_at: new Date().toISOString(),
      url: "https://x.com/MapleLeafs/status/0001",
      user: {
        name: "Sample Reporter",
        username: "samplebeat",
        verified: false,
        profile_image_url:
          "https://abs.twimg.com/sticky/default_profile_images/default_profile_images/default_profile_normal.png",
      },
      metrics: { like_count: 42, retweet_count: 7, reply_count: 3, quote_count: 1 },
      media: [] as any[],
    },
    {
      id: "0002",
      text: "Game day! Leafs vs Habs — who you got? #GoLeafsGo",
      created_at: new Date(Date.now() - 60000).toISOString(),
      url: "https://x.com/nhl/status/0002",
      user: {
        name: "Sample Fan",
        username: "leafs_rules",
        verified: false,
        profile_image_url: "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
      },
      metrics: { like_count: 16, retweet_count: 2, reply_count: 5, quote_count: 0 },
      media: [] as any[],
    },
    {
      id: "0003",
      text: "Injury update coming later today. Stay tuned. #LeafsNation",
      created_at: new Date(Date.now() - 120000).toISOString(),
      url: "https://x.com/theathleticnhl/status/0003",
      user: {
        name: "Sample Insider",
        username: "insider99",
        verified: true,
        profile_image_url: "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
      },
      metrics: { like_count: 5, retweet_count: 1, reply_count: 0, quote_count: 0 },
      media: [] as any[],
    },
  ],
}

function normalizeTwitter(json: any) {
  const users = Object.fromEntries((json?.includes?.users || []).map((u: any) => [u.id, u]))
  const mediaByKey = Object.fromEntries((json?.includes?.media || []).map((m: any) => [m.media_key, m]))

  const rows = (json?.data || []).map((t: any) => {
    const u = users[t.author_id] || {}
    const media = (t.attachments?.media_keys || []).map((k: string) => mediaByKey[k]).filter(Boolean)
    return {
      id: t.id,
      text: t.text,
      created_at: t.created_at,
      url: u?.username ? `https://x.com/${u.username}/status/${t.id}` : undefined,
      user: {
        name: u?.name,
        username: u?.username,
        verified: u?.verified,
        profile_image_url: u?.profile_image_url,
      },
      metrics: t.public_metrics,
      media,
    }
  })

  // newest first
  rows.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return { sample: false, articles: rows }
}

export async function GET(req: NextRequest) {
  const token = process.env.X_BEARER_TOKEN
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || DEFAULT_QUERY

  if (!token) {
    return NextResponse.json(SAMPLE_PAYLOAD, { status: 200 })
  }

  try {
    const resp = await fetch(buildUrl(q), {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 10 },
    })

    if (resp.status === 429) {
      // Rate limited — fall back to samples
      return NextResponse.json({ ...SAMPLE_PAYLOAD, rate_limited: true }, { status: 200 })
    }

    if (!resp.ok) {
      console.error("X API error", resp.status, await resp.text())
      return NextResponse.json(SAMPLE_PAYLOAD, { status: 200 })
    }

    const data = await resp.json()
    return NextResponse.json(normalizeTwitter(data), { status: 200 })
  } catch (err) {
    console.error("X fetch failed", err)
    return NextResponse.json(SAMPLE_PAYLOAD, { status: 200 })
  }
}
