import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ExternalLink, Newspaper, Users, Trophy, CalendarDays, BarChart3 } from "lucide-react"
import Link from "next/link"

interface NewsArticle {
  title: string
  link: string
  source: string
  published_at: string
  summary: string
}

async function getNews(): Promise<NewsArticle[]> {
  try {
    // Use absolute URL for server-side fetching
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"

    const res = await fetch(`${baseUrl}/api/news`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      console.error(`News API returned ${res.status}: ${res.statusText}`)
      return []
    }

    const data = await res.json()
    return data.articles || []
  } catch (error) {
    console.error("Failed to fetch news:", error)
    return []
  }
}

export default async function HomePage() {
  const articles = await getNews()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍁</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Leafs News</h1>
                <p className="text-sm text-muted-foreground">Toronto Maple Leafs Fan Hub</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-blue-600">
                <Newspaper className="w-4 h-4" />
                News
              </Link>
              <Link href="/scores" className="flex items-center gap-2 text-sm font-medium hover:text-blue-600">
                <Trophy className="w-4 h-4" />
                Scores
              </Link>
              <Link href="/schedule" className="flex items-center gap-2 text-sm font-medium hover:text-blue-600">
                <CalendarDays className="w-4 h-4" />
                Schedule
              </Link>
              <Link href="/lineups" className="flex items-center gap-2 text-sm font-medium hover:text-blue-600">
                <BarChart3 className="w-4 h-4" />
                Lineups
              </Link>
              <Link href="/roster" className="flex items-center gap-2 text-sm font-medium hover:text-blue-600">
                <Users className="w-4 h-4" />
                Roster
              </Link>
              <Link href="/social" className="flex items-center gap-2 text-sm font-medium hover:text-blue-600">
                <span className="w-4 h-4">🐦</span>
                Social
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-blue-900 dark:text-blue-100 mb-4">Go Leafs Go!</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stay up to date with the latest Toronto Maple Leafs news, scores, and player updates. Your ultimate fan
            destination.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="#news">Latest News</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/roster">View Roster</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-2">Live Scores</h3>
                <p className="text-sm text-muted-foreground mb-4">Current games and results</p>
                <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                  <Link href="/scores">View Scores</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <CalendarDays className="w-8 h-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-2">Schedule & TV</h3>
                <p className="text-sm text-muted-foreground mb-4">Games with streaming info</p>
                <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                  <Link href="/schedule">View Schedule</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                <h3 className="font-semibold mb-2">Lineup Tracker</h3>
                <p className="text-sm text-muted-foreground mb-4">Dynamic depth charts</p>
                <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                  <Link href="/lineups">View Lineups</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold mb-2">Team Roster</h3>
                <p className="text-sm text-muted-foreground mb-4">Player stats and info</p>
                <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                  <Link href="/roster">View Roster</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-12 px-4" id="news">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100">Latest News</h3>
            <Badge variant="secondary" className="text-sm">
              {articles.length} articles
            </Badge>
          </div>

          {articles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Newspaper className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No news articles available at the moment.</p>
                <p className="text-sm text-muted-foreground">
                  News sources are being loaded. Please check back in a few minutes.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.slice(0, 9).map((article, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {article.source}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {article.published_at ? new Date(article.published_at).toLocaleDateString() : "Recent"}
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight line-clamp-2">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3 mb-4">{article.summary}</CardDescription>
                    <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Read More
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8 px-4 mt-12">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 Leafs News. Unofficial fan site for Toronto Maple Leafs enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  )
}
