// Unsplash API integration for travel destination images

const UNSPLASH_ACCESS_KEY = 'vZOZ3K4G2SQgqzhvBDcsGZFFoqNNak-woHxzzui3eN8'
const UNSPLASH_API_URL = 'https://api.unsplash.com'

export interface UnsplashPhoto {
    id: string
    urls: {
        raw: string
        full: string
        regular: string
        small: string
        thumb: string
    }
    user: {
        name: string
        username: string
        links: {
            html: string
        }
    }
    links: {
        html: string
    }
    alt_description: string | null
    description: string | null
}

export async function searchDestinationImages(
    query: string,
    count: number = 10
): Promise<UnsplashPhoto[]> {
    try {
        const url = `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query + ' travel destination')}&per_page=${count}&orientation=landscape`

        const response = await fetch(url, {
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        })

        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`)
        }

        const data = await response.json()
        return data.results || []
    } catch (error) {
        console.error('Error fetching Unsplash images:', error)
        return []
    }
}

export async function getRandomTravelPhoto(): Promise<UnsplashPhoto | null> {
    try {
        const url = `${UNSPLASH_API_URL}/photos/random?query=travel&orientation=landscape`

        const response = await fetch(url, {
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        })

        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching random Unsplash photo:', error)
        return null
    }
}

export function getAttributionText(photo: UnsplashPhoto): string {
    return `Photo by ${photo.user.name} on Unsplash`
}

export function getAttributionLink(photo: UnsplashPhoto): string {
    return `${photo.links.html}?utm_source=ai-super-app&utm_medium=referral`
}

export function getPhotographerLink(photo: UnsplashPhoto): string {
    return `${photo.user.links.html}?utm_source=ai-super-app&utm_medium=referral`
}
