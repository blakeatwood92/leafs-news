"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Twitter, Facebook, Link2, Calendar, MapPin, Trophy, TrendingUp } from "lucide-react"
import Link from "next/link"

interface RecapData {
  game: {
    id: number
    date: string
    venue: string
    finalScore: string
    winner: string
    loser: string
    isLeafsWin: boolean
  }
  recap: {
    headline: string
    summary: string
    turningPoint: string
    topPerformers: {
      leafs: Array<{
        name: string
        stats: string
        description: string
      }>
      opponent: Array<{
        name: string
        stats: string
        description: string
      }>
    }
    keyStats: {
      shots: string
      powerPlay: string
      faceoffs: string
      hits: string
    }
    content: string
  }
  seo: {
    title: string
    description: string
    keywords: string[]
  }
}

interface PageProps {
  params: {
    gameId: string
  }
}

function ShareButtons({ recap, gameId }: { recap: RecapData; gameId: string }) {
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/recaps/${gameId}`
  const shareText = `${recap.recap.headline} - ${recap.recap.summary}`

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Share:</span>
      <Button variant="outline" size="sm" asChild>
        <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <Twitter className="w-4 h-4" />
          Twitter
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <Facebook className="w-4 h-4" />
          Facebook
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-2 bg-transparent">
        <Link2 className="w-4 h-4" />
        Copy Link
      </Button>
    </div>
  )
}

export default function RecapClientPage({ params }: PageProps & { recap: RecapData | null }) {
  const { recap } = arguments[0]

  if (!recap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/scores" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Scores
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Game Recap</h1>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Recap Not Available</h2>
          <p className="text-muted-foreground mb-6">
            This game recap is not available. The game may not be completed yet or there was an error loading the data.
          </p>
          <Button asChild>
            <Link href="/scores">Back to Scores</Link>
          </Button>
        </div>
      </div>
    )
  }

  const gameDate = new Date(recap.game.date)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: recap.recap.headline,
            description: recap.recap.summary,
            datePublished: recap.game.date,
            author: {
              "@type": "Organization",
              name: "Leafs News",
            },
            publisher: {
              "@type": "Organization",
              name: "Leafs News",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/recaps/${params.gameId}`,
            },
            about: {
              "@type": "SportsEvent",
              name: `Toronto Maple Leafs vs ${recap.game.isLeafsWin ? recap.game.loser : recap.game.winner}`,
              startDate: recap.game.date,
              location: {
                "@type": "Place",
                name: recap.game.venue,
              },
            },
          }),
        }}
      />

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/scores" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Scores
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Game Recap</h1>
                <p className="text-sm text-muted-foreground">Post-game analysis and highlights</p>
              </div>
            </div>
            <ShareButtons recap={recap} gameId={params.gameId} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Game Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant={recap.game.isLeafsWin ? "default" : "destructive"} className="text-lg px-4 py-2">
                {recap.game.isLeafsWin ? "VICTORY" : "LOSS"}
              </Badge>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{recap.game.finalScore}</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold leading-tight">{recap.recap.headline}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {gameDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {recap.game.venue}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Article Content */}
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-blue dark:prose-invert max-w-none">
                  {recap.recap.content.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Turning Point */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Turning Point
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{recap.recap.turningPoint}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-blue-600 mb-3">Toronto Maple Leafs</h4>
                  <div className="space-y-3">
                    {recap.recap.topPerformers.leafs.map((performer, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-3">
                        <div className="font-medium">{performer.name}</div>
                        <div className="text-sm text-blue-600 font-mono">{performer.stats}</div>
                        <div className="text-xs text-muted-foreground">{performer.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Opponent</h4>
                  <div className="space-y-3">
                    {recap.recap.topPerformers.opponent.map((performer, index) => (
                      <div key={index} className="border-l-4 border-gray-400 pl-3">
                        <div className="font-medium">{performer.name}</div>
                        <div className="text-sm text-gray-600 font-mono">{performer.stats}</div>
                        <div className="text-xs text-muted-foreground">{performer.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Key Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Shots</span>
                  <span className="font-mono text-sm">{recap.recap.keyStats.shots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Power Play</span>
                  <span className="font-mono text-sm">{recap.recap.keyStats.powerPlay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Faceoffs</span>
                  <span className="font-mono text-sm">{recap.recap.keyStats.faceoffs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Hits</span>
                  <span className="font-mono text-sm">{recap.recap.keyStats.hits}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
