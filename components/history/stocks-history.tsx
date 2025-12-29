"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { HistorySection } from './history-section'
import { TrendingUp } from 'lucide-react'

interface StocksActivity {
    id: string
    type: 'search' | 'view'
    data: {
        symbol: string
        name?: string
        price?: number
        change?: number
    }
    timestamp: string
}

export function StocksHistory() {
    const [activities, setActivities] = useState<StocksActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { token } = useAuth()

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/history?category=stocks', {
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
            setError('Failed to fetch stocks history')
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
            const response = await fetch('/api/history?category=stocks', {
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

    const renderActivity = (activity: StocksActivity) => {
        return (
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-base">{activity.data.symbol}</span>
                        <span className="text-xs text-muted-foreground">Searched</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <HistorySection
            title="Stocks History"
            icon={TrendingUp}
            activities={activities}
            loading={loading}
            error={error}
            emptyMessage="No stocks history yet. Search for stocks to see them here!"
            renderActivity={renderActivity}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearAll}
            categoryColor="green"
        />
    )
}
