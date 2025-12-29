"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function TravelDestinationsTicker() {
    const [destinations, setDestinations] = useState<any[]>([])
    const router = useRouter()

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const response = await fetch('/api/destinations')
                const data = await response.json()
                setDestinations(data.destinations || [])
            } catch (error) {
                console.error('Error fetching destinations:', error)
            }
        }
        fetchDestinations()
    }, [])

    const handleDestinationClick = (dest: any) => {
        // Navigate to travel page
        router.push('/travel')
    }

    if (destinations.length === 0) return null

    return (
        <div className="overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-900/20 rounded-lg py-4">
            <div className="flex animate-scroll gap-6">
                {/* Duplicate the array for seamless loop */}
                {[...destinations, ...destinations].map((dest, idx) => (
                    <button
                        key={`scroll-${idx}`}
                        onClick={() => handleDestinationClick(dest)}
                        className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-900 rounded-full hover:shadow-lg transition-shadow cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            {dest.image && (
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-sm">{dest.name}</div>
                            <div className="text-xs text-muted-foreground">{dest.country}</div>
                        </div>
                    </button>
                ))}
            </div>

            <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    )
}
