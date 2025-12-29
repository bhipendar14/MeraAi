import { ObjectId } from 'mongodb'

// Base activity history interface
export interface BaseActivity {
    _id?: ObjectId
    userId: string
    category: 'entertainment' | 'news' | 'stocks' | 'travel' | 'tech'
    timestamp: Date
}

// Entertainment History Types
export interface EntertainmentActivity extends BaseActivity {
    category: 'entertainment'
    type: 'youtube' | 'music' | 'movie'
    data: {
        title: string
        thumbnail?: string
        artist?: string // for music
        id: string
        url?: string
    }
}

// News History Types
export interface NewsActivity extends BaseActivity {
    category: 'news'
    type: 'article' | 'search' | 'video'
    data: {
        title: string
        source?: string
        url?: string
        thumbnail?: string
        query?: string // for search
    }
}

// Stocks History Types
export interface StocksActivity extends BaseActivity {
    category: 'stocks'
    type: 'search' | 'view'
    data: {
        symbol: string
        name?: string
        price?: number
        change?: number
    }
}

// Travel History Types
export interface TravelActivity extends BaseActivity {
    category: 'travel'
    type: 'destination_search' | 'hotel_view' | 'flight_view' | 'train_view' | 'bus_view'
    data: {
        destination?: string
        from?: string
        to?: string
        date?: string
        type?: string
        name?: string // hotel name, etc.
    }
}

// Tech History Types
export interface TechActivity extends BaseActivity {
    category: 'tech'
    type: 'article' | 'tool' | 'search'
    data: {
        title: string
        url?: string
        description?: string
        query?: string // for search
    }
}

// Union type for all activities
export type ActivityHistory =
    | EntertainmentActivity
    | NewsActivity
    | StocksActivity
    | TravelActivity
    | TechActivity

// Helper to create activity
export function createActivity<T extends ActivityHistory>(
    userId: string,
    category: T['category'],
    type: T['type'],
    data: T['data']
): Omit<T, '_id'> {
    return {
        userId,
        category,
        type,
        data,
        timestamp: new Date()
    } as Omit<T, '_id'>
}
