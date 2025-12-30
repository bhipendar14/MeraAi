"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageLightboxProps {
    images: Array<{ url: string; thumb: string; alt: string; photographer?: string }>
    initialIndex?: number
    onClose: () => void
}

export function ImageLightbox({ images, initialIndex = 0, onClose }: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [isHovered, setIsHovered] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
            if (e.key === "ArrowLeft") handlePrevious()
            if (e.key === "ArrowRight") handleNext()
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [currentIndex])

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [])

    const handlePrevious = () => {
        setIsLoading(true)
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const handleNext = () => {
        setIsLoading(true)
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    const currentImage = images[currentIndex]

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={onClose}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Close Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={`absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0 md:opacity-100"
                    }`}
            >
                <X className="h-6 w-6" />
            </Button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-sm font-medium">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Main Image Container */}
            <div
                className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Previous Button */}
                {images.length > 1 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevious}
                        className={`absolute left-2 md:left-4 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </Button>
                )}

                {/* Image */}
                <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    )}
                    <img
                        src={currentImage.url}
                        alt={currentImage.alt}
                        className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"
                            }`}
                        onLoad={() => setIsLoading(false)}
                    />
                </div>

                {/* Next Button */}
                {images.length > 1 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNext}
                        className={`absolute right-2 md:right-4 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <ChevronRight className="h-8 w-8" />
                    </Button>
                )}
            </div>

            {/* Image Info */}
            {currentImage.alt && (
                <div
                    className={`absolute bottom-4 left-1/2 -translate-x-1/2 max-w-2xl px-4 py-2 rounded-full bg-black/50 backdrop-blur text-white text-sm text-center transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"
                        }`}
                >
                    {currentImage.alt}
                    {currentImage.photographer && (
                        <span className="text-white/70"> • Photo by {currentImage.photographer}</span>
                    )}
                </div>
            )}

            {/* Thumbnail Navigation (Desktop Only) */}
            {images.length > 1 && (
                <div
                    className={`hidden md:flex absolute bottom-20 left-1/2 -translate-x-1/2 gap-2 p-2 rounded-lg bg-black/50 backdrop-blur max-w-4xl overflow-x-auto transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"
                        }`}
                >
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setIsLoading(true)
                                setCurrentIndex(idx)
                            }}
                            className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all ${idx === currentIndex
                                    ? "ring-2 ring-white scale-110"
                                    : "opacity-60 hover:opacity-100"
                                }`}
                        >
                            <img
                                src={img.thumb}
                                alt={img.alt}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
