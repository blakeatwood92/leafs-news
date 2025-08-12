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
  const featuredArticles = articles.slice(0, 3)
  const recentArticles = articles.slice(3, 12)

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
              <Link
                href="/leafs-live-tweets"
                className="flex items-center gap-2 text-sm font-medium hover:text-blue-600"
              >
                <span className="w-4 h-4">🐦</span>
                Live Tweets
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breaking News Hero */}
      <section className="py-8 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-red-500 text-white animate-pulse">BREAKING</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">Latest Leafs News</h2>
          </div>
          <p className="text-blue-100 text-lg mb-6">
            Stay ahead of the game with breaking news, trade rumors, and insider updates
          </p>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-8 px-4 bg-white dark:bg-background">
          <div className="container mx-auto">
            <div className="grid gap-6 lg:grid-cols-3">
              {featuredArticles.map((article, index) => (
                <Card
                  key={index}
                  className={`hover:shadow-xl transition-all duration-300 ${index === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {article.source}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {article.published_at ? new Date(article.published_at).toLocaleDateString() : "Recent"}
                      </div>
                    </div>
                    <CardTitle className={`leading-tight ${index === 0 ? "text-2xl mb-3" : "text-lg"}`}>
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription
                      className={`mb-4 ${index === 0 ? "text-base line-clamp-4" : "text-sm line-clamp-3"}`}
                    >
                      {article.summary}
                    </CardDescription>
                    <Button
                      variant={index === 0 ? "default" : "outline"}
                      size="sm"
                      className={`w-full ${index === 0 ? "bg-blue-600 hover:bg-blue-700" : "bg-transparent"}`}
                      asChild
                    >
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Read Full Story
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Access - Compact */}
      <section className="py-6 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" asChild className="bg-white hover:bg-blue-50">
              <Link href="/scores" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Live Scores
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="bg-white hover:bg-blue-50">
              <Link href="/schedule" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Schedule & TV
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="bg-white hover:bg-blue-50">
              <Link href="/lineups" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Lineups
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="bg-white hover:bg-blue-50">
              <Link href="/roster" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Roster
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="bg-white hover:bg-blue-50">
              <Link href="/leafs-live-tweets" className="flex items-center gap-2">
                <span className="w-4 h-4">🐦</span>
                Live Tweets
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* More News Feed */}
      {recentArticles.length > 0 && (
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">More Leafs News</h3>
              <Badge variant="outline" className="text-sm">
                {articles.length} total articles
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentArticles.map((article, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {article.source}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {article.published_at ? new Date(article.published_at).toLocaleDateString() : "Recent"}
                      </div>
                    </div>
                    <CardTitle className="text-base leading-tight line-clamp-2">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-2 mb-3 text-sm">{article.summary}</CardDescription>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start p-0 h-auto text-blue-600 hover:text-blue-800"
                      asChild
                    >
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Read more
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {articles.length === 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <Card className="text-center py-12">
              <CardContent>
                <Newspaper className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">Loading Latest Leafs News...</h3>
                <p className="text-muted-foreground mb-4">
                  We're fetching the latest news, rumors, and updates from around the league.
                </p>
                <p className="text-sm text-muted-foreground">
                  Check back in a few moments for breaking news and insider reports.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

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
