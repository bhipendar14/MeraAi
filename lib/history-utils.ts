import { ActivityHistory } from './models/activity-history'

/**
 * Save activity to history via API
 */
export async function saveActivity(
    token: string,
    category: string,
    type: string,
    data: any
): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch('/api/history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ category, type, data })
        })

        if (response.ok) {
            return { success: true }
        } else {
            const result = await response.json()
            return { success: false, error: result.error }
        }
    } catch (error) {
        console.error('Failed to save activity:', error)
        return { success: false, error: 'Network error' }
    }
}

/**
 * Format activity into a brief summary for display
 */
export function formatActivitySummary(activity: ActivityHistory): string {
    switch (activity.category) {
        case 'entertainment':
            if (activity.type === 'youtube') {
                return `Watched: ${activity.data.title}`
            } else if (activity.type === 'music') {
                return `Played: ${activity.data.title}${activity.data.artist ? ` by ${activity.data.artist}` : ''}`
            } else if (activity.type === 'movie') {
                return `Viewed: ${activity.data.title}`
            }
            return activity.data.title

        case 'news':
            if (activity.type === 'search') {
                return `Searched: ${activity.data.query}`
            } else if (activity.type === 'article') {
                return `Read: ${activity.data.title}`
            } else if (activity.type === 'video') {
                return `Watched: ${activity.data.title}`
            }
            return activity.data.title

        case 'stocks':
            if (activity.type === 'search') {
                return `Searched: ${activity.data.symbol}${activity.data.name ? ` (${activity.data.name})` : ''}`
            }
            return `Viewed: ${activity.data.symbol}`

        case 'travel':
            if (activity.type === 'destination_search') {
                return `Searched destination: ${activity.data.destination}`
            } else if (activity.type === 'hotel_view') {
                return `Viewed hotel: ${activity.data.name || activity.data.destination}`
            } else if (activity.type === 'flight_view') {
                return `Searched flight: ${activity.data.from} → ${activity.data.to}`
            } else if (activity.type === 'train_view') {
                return `Searched train: ${activity.data.from} → ${activity.data.to}`
            } else if (activity.type === 'bus_view') {
                return `Searched bus: ${activity.data.from} → ${activity.data.to}`
            }
            return 'Travel search'

        case 'tech':
            if (activity.type === 'search') {
                return `Searched: ${activity.data.query}`
            } else if (activity.type === 'article') {
                return `Read: ${activity.data.title}`
            } else if (activity.type === 'tool') {
                return `Used: ${activity.data.title}`
            }
            return activity.data.title

        default:
            return 'Activity'
    }
}

/**
 * Get icon name for activity type (using lucide-react icon names)
 */
export function getActivityIconName(activity: ActivityHistory): string {
    switch (activity.category) {
        case 'entertainment':
            if (activity.type === 'youtube') return 'Youtube'
            if (activity.type === 'music') return 'Music'
            if (activity.type === 'movie') return 'Film'
            return 'Play'

        case 'news':
            return 'Newspaper'

        case 'stocks':
            return 'TrendingUp'

        case 'travel':
            if (activity.type === 'flight_view') return 'Plane'
            if (activity.type === 'train_view') return 'Train'
            if (activity.type === 'bus_view') return 'Bus'
            if (activity.type === 'hotel_view') return 'Hotel'
            return 'MapPin'

        case 'tech':
            return 'Code'

        default:
            return 'Activity'
    }
}

/**
 * Format timestamp to readable format
 */
export function formatTimestamp(date: Date | string): string {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
}
