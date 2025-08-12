"use client"
import { useEffect, useMemo, useRef, useState } from "react"

function timeAgo(iso?: string) {
  if (!iso) return ""
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}

export default function LeafsLiveTweetsPage() {
  const [data, setData] = useState<{ sample?: boolean; rate_limited?: boolean; articles: any[] }>({ articles: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<any>(null)

  const fetchTweets = async () => {
    try {
      const res = await fetch("/api/leafs-tweets", { cache: "no-store" })
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (e: any) {
      setError("Failed to load tweets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTweets()
    timer.current = setInterval(fetchTweets, 30000) // refresh every 30s
    return () => clearInterval(timer.current)
  }, [])

  const headerNote = useMemo(() => {
    if (data?.sample && !data?.rate_limited) return "Sample mode (set X_BEARER_TOKEN for live tweets)"
    if (data?.rate_limited) return "Rate-limited by X API — showing samples"
    return "Live tweets (auto-refreshing)"
  }, [data])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Leafs Live Tweets</h1>
          <p className="text-blue-100 mt-2">Real-time tweets from Leafs Nation</p>
        </div>
      </div>

      <main className="mx-auto max-w-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{headerNote}</span>
        </div>

        {loading && <div className="text-sm text-gray-500 text-center py-8">Loading tweets...</div>}
        {error && <div className="text-sm text-red-600 text-center py-8">{error}</div>}

        <ul className="space-y-4">
          {data?.articles?.map((t) => (
            <li key={t.id} className="rounded-2xl border bg-white p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <img
                  src={
                    t.user?.profile_image_url ||
                    "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
                  }
                  alt={t.user?.name || "avatar"}
                  className="h-12 w-12 rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{t.user?.name || "Unknown"}</span>
                    <span className="text-gray-500 truncate">@{t.user?.username || "unknown"}</span>
                    {t.user?.verified && (
                      <span title="Verified" className="text-blue-500 text-sm">
                        ✓
                      </span>
                    )}
                    <span className="ml-auto text-xs text-gray-500">{timeAgo(t.created_at)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-gray-800 leading-relaxed">{t.text}</p>
                  {t.media?.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {t.media
                        .filter((m: any) => m?.url || m?.preview_image_url)
                        .map((m: any, idx: number) => (
                          <img
                            key={idx}
                            src={m.url || m.preview_image_url}
                            alt={m.alt_text || "media"}
                            className="w-full rounded-lg"
                          />
                        ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="text-red-500">♥</span> {t.metrics?.like_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-green-500">🔁</span> {t.metrics?.retweet_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-blue-500">💬</span> {t.metrics?.reply_count ?? 0}
                    </span>
                    {t.url && (
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-blue-600 hover:text-blue-800 underline"
                      >
                        View on X
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {!loading && (!data?.articles || data.articles.length === 0) && (
          <div className="mt-8 text-center py-12">
            <div className="text-gray-500 mb-2">No tweets found right now</div>
            <div className="text-sm text-gray-400">Try again soon or check back later</div>
          </div>
        )}

        <div className="mt-8 rounded-xl border bg-blue-50 p-4 text-sm text-gray-600">
          <div className="font-medium text-blue-800 mb-2">💡 Setup Tips:</div>
          <div className="space-y-1 text-xs">
            <div>
              • Add <code className="bg-white px-1 rounded">X_BEARER_TOKEN</code> environment variable for live tweets
            </div>
            <div>
              • Customize search with <code className="bg-white px-1 rounded">?q=</code> parameter
            </div>
            <div>• Auto-refreshes every 30 seconds when live</div>
          </div>
        </div>
      </main>
    </div>
  )
}
