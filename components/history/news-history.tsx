"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { HistorySection } from './history-section'
import { Newspaper } from 'lucide-react'

interface NewsActivity {
    id: string
    type: 'article' | 'search' | 'video'
    data: {
        title: string
        source?: string
        url?: string
        thumbnail?: string
        query?: string
    }
    timestamp: string
}

export function NewsHistory() {
    const [activities, setActivities] = useState<NewsActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { token } = useAuth()

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/history?category=news', {
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
            setError('Failed to fetch news history')
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
            const response = await fetch('/api/history?category=news', {
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

    const renderActivity = (activity: NewsActivity) => {
        return (
            <div
                className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                    // Re-open the content
                    if (activity.data.url) {
                        window.open(activity.data.url, '_blank')
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
                        <span className="text-xs text-muted-foreground capitalize">
                            {activity.type === 'search' ? `Searched: "${activity.data.query}"` : activity.type}
                        </span>
                    </div>
                    {activity.type !== 'search' && (
                        <>
                            <p className="font-medium text-sm line-clamp-2">{activity.data.title}</p>
                            {activity.data.source && (
                                <p className="text-xs text-muted-foreground mt-1">{activity.data.source}</p>
                            )}
                            <p className="text-xs text-blue-500 mt-1">Click to open</p>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <HistorySection
            title="News History"
            icon={Newspaper}
            activities={activities}
            loading={loading}
            error={error}
            emptyMessage="No news history yet. Read articles or search for news to see them here!"
            renderActivity={renderActivity}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearAll}
            categoryColor="blue"
        />
    )
}
