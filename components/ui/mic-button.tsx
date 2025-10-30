"use client"

import { useState, useRef } from "react"
import { Mic, MicOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MicButtonProps {
    onTranscript: (text: string) => void
    onError?: (error: string) => void
    className?: string
    size?: "sm" | "md" | "lg"
}

type ListeningState = "idle" | "listening" | "processing" | "error"

export function MicButton({ onTranscript, onError, className = "", size = "md" }: MicButtonProps) {
    const [state, setState] = useState<ListeningState>("idle")
    const [transcript, setTranscript] = useState("")
    
    const recognitionRef = useRef<any>(null)
    const finalTranscriptRef = useRef("")

    const startListening = () => {
        // Check if browser supports speech recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        
        if (!SpeechRecognition) {
            onError?.("Speech recognition not supported. Please use Chrome or Edge browser.")
            return
        }

        try {
            const recognition = new SpeechRecognition()
            recognitionRef.current = recognition
            finalTranscriptRef.current = ""
            
            // Configure recognition
            recognition.continuous = false  // Changed to false for better reliability
            recognition.interimResults = true
            recognition.lang = "en-US"
            
            setState("listening")
            setTranscript("")
            
            recognition.onstart = () => {
                console.log("🎤 Started listening...")
                setState("listening")
            }
            
            recognition.onresult = (event: any) => {
                let interimTranscript = ""
                let finalTranscript = ""
                
                for (let i = 0; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript
                    } else {
                        interimTranscript += transcript
                    }
                }
                
                // Update display transcript
                const displayTranscript = finalTranscript + interimTranscript
                setTranscript(displayTranscript)
                
                // Store final transcript
                if (finalTranscript) {
                    finalTranscriptRef.current = finalTranscript
                    console.log("📝 Final transcript:", finalTranscript)
                }
                
                console.log("🔄 Interim:", interimTranscript, "Final:", finalTranscript)
            }
            
            recognition.onend = () => {
                console.log("🛑 Recognition ended")
                const finalText = finalTranscriptRef.current.trim()
                
                if (finalText) {
                    console.log("✅ Sending transcript:", finalText)
                    setState("processing")
                    
                    // Send the transcript after a brief delay
                    setTimeout(() => {
                        onTranscript(finalText)
                        setState("idle")
                        setTranscript("")
                        finalTranscriptRef.current = ""
                    }, 500)
                } else {
                    console.log("❌ No speech detected")
                    setState("idle")
                    setTranscript("")
                    onError?.("No speech detected. Please try again.")
                }
            }
            
            recognition.onerror = (event: any) => {
                console.error("❌ Speech error:", event.error)
                setState("error")
                
                let errorMessage = "Speech recognition error"
                switch (event.error) {
                    case "not-allowed":
                        errorMessage = "Microphone permission denied. Please allow microphone access."
                        break
                    case "no-speech":
                        errorMessage = "No speech detected. Please speak clearly."
                        break
                    case "network":
                        errorMessage = "Network error. Please check your connection."
                        break
                    default:
                        errorMessage = `Error: ${event.error}. Please try again.`
                }
                
                onError?.(errorMessage)
                setTimeout(() => setState("idle"), 2000)
            }
            
            // Start recognition
            recognition.start()
            
            // Auto-stop after 10 seconds
            setTimeout(() => {
                if (recognitionRef.current && state === "listening") {
                    console.log("⏰ Auto-stopping after 10 seconds")
                    recognitionRef.current.stop()
                }
            }, 10000)
            
        } catch (error) {
            console.error("Failed to start recognition:", error)
            setState("error")
            onError?.("Failed to start speech recognition. Please try again.")
            setTimeout(() => setState("idle"), 2000)
        }
    }

    const stopListening = () => {
        if (recognitionRef.current) {
            console.log("🛑 Manually stopping recognition")
            recognitionRef.current.stop()
        }
    }

    const handleClick = () => {
        console.log("🖱️ Mic clicked, current state:", state)
        
        switch (state) {
            case "idle":
                startListening()
                break
            case "listening":
                stopListening()
                break
            case "error":
                setState("idle")
                break
            case "processing":
                // Do nothing while processing
                break
        }
    }

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12"
    }

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6"
    }

    const getButtonStyle = () => {
        switch (state) {
            case "listening":
                return "bg-red-500 hover:bg-red-600 text-white animate-pulse"
            case "processing":
                return "bg-blue-500 hover:bg-blue-600 text-white"
            case "error":
                return "bg-orange-500 hover:bg-orange-600 text-white"
            default:
                return "bg-muted hover:bg-muted/80"
        }
    }

    const getTooltip = () => {
        switch (state) {
            case "listening":
                return "Listening... Click to stop"
            case "processing":
                return "Processing speech..."
            case "error":
                return "Error - Click to retry"
            default:
                return "Click to start voice input"
        }
    }

    return (
        <div className="relative">
            <Button
                onClick={handleClick}
                variant="ghost"
                size="icon"
                className={`${sizeClasses[size]} ${getButtonStyle()} transition-all duration-200 ${className}`}
                title={getTooltip()}
                disabled={state === "processing"}
            >
                {state === "listening" ? (
                    <div className="relative">
                        <MicOff className={iconSizes[size]} />
                        {/* Simple waveform */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex space-x-0.5 items-end h-3">
                                <div className="w-0.5 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
                                <div className="w-0.5 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                                <div className="w-0.5 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                            </div>
                        </div>
                    </div>
                ) : state === "processing" ? (
                    <div className="animate-spin">
                        <Mic className={iconSizes[size]} />
                    </div>
                ) : state === "error" ? (
                    <X className={iconSizes[size]} />
                ) : (
                    <Mic className={iconSizes[size]} />
                )}
            </Button>

            {/* Transcript preview */}
            {transcript && state === "listening" && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 max-w-sm">
                    <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg">
                        <div className="text-center whitespace-nowrap overflow-hidden text-ellipsis">
                            {transcript || "Listening..."}
                        </div>
                    </div>
                </div>
            )}

            {/* Listening indicator */}
            {state === "listening" && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                </div>
            )}
        </div>
    )
}