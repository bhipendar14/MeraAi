"use client"

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function BreakingNewsTicker() {
    const { data: breakingData } = useSWR('/api/news?endpoint=breaking', fetcher, {
        refreshInterval: 60000, // Refresh every minute
    })

    const breaking = breakingData?.breaking || []

    if (breaking.length === 0) return null

    return (
        <div className="bg-red-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 animate-pulse overflow-hidden">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
                    {breaking.map((item: any, i: number) => (
                        <Link
                            key={i}
                            href={item.url}
                            target="_blank"
                            className="hover:underline font-semibold inline-block"
                        >
                            🔴 BREAKING: {item.headline}
                        </Link>
                    ))}
                </div>
            </div>

            <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          display: inline-flex;
          gap: 1rem;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    )
}
