"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react"
import Image from "next/image"
import { useMusicPlayer } from "@/lib/music-player-context"
import { usePathname } from "next/navigation"

export function GlobalMusicPlayer() {
    const {
        currentTrack,
        isPlaying,
        pause,
        resume,
        next,
        previous,
        volume,
        setVolume,
        progress,
        duration,
        seek,
    } = useMusicPlayer()

    const pathname = usePathname()
    const isEntertainmentPage = pathname === "/entertainment"
    const playerRef = useRef<any>(null)
    const [isMuted, setIsMuted] = useState(false)

    // YouTube IFrame Player API
    useEffect(() => {
        if (!currentTrack) return

        // Load YouTube IFrame API
        if (!(window as any).YT) {
            const tag = document.createElement("script")
            tag.src = "https://www.youtube.com/iframe_api"
            const firstScriptTag = document.getElementsByTagName("script")[0]
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
        }

        // Initialize player when API is ready
        ; (window as any).onYouTubeIframeAPIReady = () => {
            if (playerRef.current) {
                playerRef.current.destroy()
            }

            playerRef.current = new (window as any).YT.Player("youtube-audio-player", {
                height: "0",
                width: "0",
                videoId: currentTrack.videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                },
                events: {
                    onReady: (event: any) => {
                        event.target.setVolume(volume * 100)
                        if (isPlaying) {
                            event.target.playVideo()
                        }
                    },
                    onStateChange: (event: any) => {
                        // Handle player state changes
                    },
                },
            })
        }

        // If API already loaded
        if ((window as any).YT && (window as any).YT.Player) {
            ; (window as any).onYouTubeIframeAPIReady()
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy()
            }
        }
    }, [currentTrack])

    // Control playback
    useEffect(() => {
        if (playerRef.current && playerRef.current.playVideo) {
            if (isPlaying) {
                playerRef.current.playVideo()
            } else {
                playerRef.current.pauseVideo()
            }
        }
    }, [isPlaying])

    // Control volume
    useEffect(() => {
        if (playerRef.current && playerRef.current.setVolume) {
            playerRef.current.setVolume(isMuted ? 0 : volume * 100)
        }
    }, [volume, isMuted])

    if (!currentTrack) return null

    // Hide on Entertainment page (to avoid duplicate controls)
    if (isEntertainmentPage) return <div id="youtube-audio-player" style={{ display: "none" }} />

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <>
            <div id="youtube-audio-player" style={{ display: "none" }} />
            <Card className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-green-600/30 p-3 z-50 md:left-64">
                <div className="container mx-auto">
                    <div className="flex items-center gap-3">
                        {/* Track Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Image
                                src={currentTrack.image}
                                alt={currentTrack.title}
                                width={48}
                                height={48}
                                className="rounded"
                                unoptimized
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate text-white">{currentTrack.title}</h4>
                                <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={previous}
                                className="text-green-600 hover:text-green-500 h-8 w-8"
                            >
                                <SkipBack className="w-4 h-4" />
                            </Button>
                            <Button
                                size="icon"
                                onClick={() => (isPlaying ? pause() : resume())}
                                className="bg-green-600 hover:bg-green-700 h-10 w-10"
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={next}
                                className="text-green-600 hover:text-green-500 h-8 w-8"
                            >
                                <SkipForward className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Volume */}
                        <div className="hidden md:flex items-center gap-2 w-32">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setIsMuted(!isMuted)}
                                className="h-8 w-8"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="w-4 h-4" />
                                ) : (
                                    <Volume2 className="w-4 h-4" />
                                )}
                            </Button>
                            <Slider
                                value={[isMuted ? 0 : volume * 100]}
                                onValueChange={([value]) => {
                                    setVolume(value / 100)
                                    setIsMuted(false)
                                }}
                                max={100}
                                step={1}
                                className="w-20"
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </>
    )
}
