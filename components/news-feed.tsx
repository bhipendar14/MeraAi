"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function NewsFeed() {
  const { data } = useSWR("/api/news", fetcher)

  const items = data?.items || []
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((n: any) => (
        <Card
          key={n.id}
          className="border-border/60 bg-card/60 backdrop-blur hover:shadow-[0_0_12px_var(--color-accent-amber)] transition-all"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{n.headline}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{n.summary}</p>
            <Link href={n.url} className="text-sm underline" target="_blank" rel="noreferrer">
              {n.source}
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
