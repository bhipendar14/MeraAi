"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { HistorySection } from './history-section'
import { Film, Music, Youtube } from 'lucide-react'

interface EntertainmentActivity {
    id: string
    type: 'youtube' | 'music' | 'movie'
    data: {
        title: string
        thumbnail?: string
        artist?: string
        id: string
        url?: string
    }
    timestamp: string
}

export function EntertainmentHistory() {
    const [activities, setActivities] = useState<EntertainmentActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { token } = useAuth()

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/history?category=entertainment', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setActivities(data.activities)
            } else {
                const data = await response.json()
                setError(data.error)
            }
        } catch (error) {
            setError('Failed to fetch entertainment history')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteItem = async (itemId: string) => {
        try {
            const response = await fetch(`/api/history?itemId=${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setActivities(prev => prev.filter(a => a.id !== itemId))
            } else {
                const data = await response.json()
                setError(data.error)
            }
        } catch (error) {
            setError('Failed to delete item')
        }
    }

    const handleClearAll = async () => {
        try {
            const response = await fetch('/api/history?category=entertainment', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setActivities([])
            } else {
                const data = await response.json()
                setError(data.error)
            }
        } catch (error) {
            setError('Failed to clear history')
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [token])

    const renderActivity = (activity: EntertainmentActivity) => {
        const getIcon = () => {
            if (activity.type === 'youtube') return <Youtube className="w-4 h-4 text-red-500" />
            if (activity.type === 'music') return <Music className="w-4 h-4 text-green-500" />
            if (activity.type === 'movie') return <Film className="w-4 h-4 text-purple-500" />
            return null
        }

        const getTypeLabel = () => {
            if (activity.type === 'youtube') return 'Watched'
            if (activity.type === 'music') return 'Played'
            if (activity.type === 'movie') return 'Viewed'
            return ''
        }

        return (
            <div
                className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                    // Re-open the content
                    if (activity.type === 'youtube' && activity.data.id) {
                        window.open(`https://www.youtube.com/watch?v=${activity.data.id}`, '_blank')
                    } else if (activity.type === 'music' && activity.data.url) {
                        window.open(activity.data.url, '_blank')
                    } else if (activity.type === 'movie') {
                        // Show movie details (could open TMDB or IMDb)
                        window.open(`https://www.themoviedb.org/search?query=${encodeURIComponent(activity.data.title)}`, '_blank')
                    }
                }}
            >
                {activity.data.thumbnail && (
                    <img
                        src={activity.data.thumbnail}
                        alt={activity.data.title}
                        className="w-16 h-16 object-cover rounded"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {getIcon()}
                        <span className="text-xs text-muted-foreground">{getTypeLabel()}</span>
                    </div>
                    <p className="font-medium text-sm line-clamp-2">{activity.data.title}</p>
                    {activity.data.artist && (
                        <p className="text-xs text-muted-foreground mt-1">by {activity.data.artist}</p>
                    )}
                    <p className="text-xs text-blue-500 mt-1">Click to open</p>
                </div>
            </div>
        )
    }

    return (
        <HistorySection
            title="Entertainment History"
            icon={Film}
            activities={activities}
            loading={loading}
            error={error}
            emptyMessage="No entertainment history yet. Watch videos, play music, or view movies to see them here!"
            renderActivity={renderActivity}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearAll}
            categoryColor="purple"
        />
    )
}
