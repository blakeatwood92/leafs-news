import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, MessageCircle, Repeat2, ExternalLink, CheckCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Tweet {
  id: string
  text: string
  author: {
    username: string
    name: string
    profile_image_url: string
    verified: boolean
  }
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
  }
  media?: {
    type: string
    url: string
  }[]
}

interface SocialData {
  tweets: Tweet[]
  count: number
  lastUpdated: string
}

async function getSocialFeed(): Promise<SocialData> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/social`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })
    if (!res.ok) throw new Error("Failed to fetch social feed")
    return await res.json()
  } catch (error) {
    console.error("Failed to fetch social feed:", error)
    return {
      tweets: [],
      count: 0,
      lastUpdated: new Date().toISOString(),
    }
  }
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  return `${Math.floor(diffInSeconds / 86400)}d`
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Image
              src={tweet.author.profile_image_url || "/placeholder.svg"}
              alt={`${tweet.author.name} avatar`}
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm truncate">{tweet.author.name}</span>
              {tweet.author.verified && <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              <span className="text-muted-foreground text-sm truncate">@{tweet.author.username}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">{formatTimeAgo(tweet.created_at)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">{tweet.text}</p>

        {/* Engagement metrics */}
        <div className="flex items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{formatNumber(tweet.public_metrics.reply_count)}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-green-500 cursor-pointer transition-colors">
            <Repeat2 className="w-4 h-4" />
            <span className="text-xs">{formatNumber(tweet.public_metrics.retweet_count)}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-xs">{formatNumber(tweet.public_metrics.like_count)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function SocialPage() {
  const { tweets, count, lastUpdated } = await getSocialFeed()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Leafs Social</h1>
                <p className="text-sm text-muted-foreground">What fans are saying</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{count} tweets</Badge>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Tags */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Following</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
              #LeafsForever
            </Badge>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
              #GoLeafsGo
            </Badge>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
              Toronto Maple Leafs
            </Badge>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
              #LeafsNation
            </Badge>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
              #TMLtalk
            </Badge>
          </div>
        </section>

        {/* Tweet Feed */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Latest Tweets</h2>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ExternalLink className="w-4 h-4" />
              View on Twitter
            </Button>
          </div>

          {tweets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 text-muted-foreground">🐦</div>
                <p className="text-muted-foreground">No tweets available at the moment.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect your Twitter API to see live tweets about the Leafs!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tweets.map((tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))}
            </div>
          )}
        </section>

        {/* API Notice */}
        <section className="mt-12">
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="py-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Connect Twitter API</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                To display live tweets, add your Twitter Bearer Token to the environment variables. The current feed
                shows sample data for demonstration.
              </p>
              <div className="text-xs text-blue-700 dark:text-blue-300 font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                TWITTER_BEARER_TOKEN=your_bearer_token_here
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
