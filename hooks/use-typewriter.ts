import { useState, useEffect } from 'react'

export function useTypewriter(text: string, speed: number = 20) {
    const [displayedText, setDisplayedText] = useState('')
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        // Reset when text changes
        setDisplayedText('')
        setIsComplete(false)

        if (!text) {
            return
        }

        let currentIndex = 0
        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1))
                currentIndex++
            } else {
                setIsComplete(true)
                clearInterval(interval)
            }
        }, speed)

        return () => clearInterval(interval)
    }, [text, speed])

    return { displayedText, isComplete }
}
