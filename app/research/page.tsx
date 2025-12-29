"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Send, Loader2, X, Play, ExternalLink, Upload, Paperclip, StopCircle } from "lucide-react"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import { useAuth } from "@/contexts/auth-context"
import { MicButton } from "@/components/ui/mic-button"
import { useTypewriter } from "@/hooks/use-typewriter"

interface Message {
  role: "user" | "assistant"
  content: string
  videos?: any[]
  links?: any[]
  images?: any[]
  file?: { name: string; type: string; data: string }
}

export default function ResearchPage() {
  const { user, token } = useAuth()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")
  const [streamingData, setStreamingData] = useState<{ videos?: any[], links?: any[], images?: any[] } | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; data: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Typewriter effect for streaming message
  const { displayedText, isComplete } = useTypewriter(streamingMessage, 15)

  // When typewriter completes, add the full message to the array
  useEffect(() => {
    if (isComplete && streamingMessage && streamingData) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: streamingMessage,
        videos: streamingData.videos || [],
        links: streamingData.links || [],
        images: streamingData.images || []
      }])
      setStreamingMessage("")
      setStreamingData(null)
    }
  }, [isComplete, streamingMessage, streamingData])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading, streamingMessage])

  // Fetch AI-powered suggestions
  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: input }),
        })
        const data = await res.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(data.suggestions?.length > 0)
      } catch (error) {
        console.error("Suggestions error:", error)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [input])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      alert("Please upload an image (JPEG, PNG, GIF, WebP) or PDF file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setUploadedFile({
        name: file.name,
        type: file.type,
        data: base64,
      })
    }
    reader.readAsDataURL(file)
  }

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript.trim()) {
      setInput(transcript.trim())
      setShowSuggestions(false) // Hide suggestions when using voice
      // Auto-submit after voice input
      setTimeout(() => handleSearch(transcript.trim()), 100)
    }
  }

  const handleVoiceError = (error: string) => {
    console.error('Voice input error:', error)
    // Optionally show error to user
  }

  const handleStop = () => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
    if (streamingMessage) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: streamingMessage + " [Stopped]",
        videos: streamingData?.videos || [],
        links: streamingData?.links || [],
        images: streamingData?.images || []
      }])
      setStreamingMessage("")
      setStreamingData(null)
    }
  }

  const handleSearch = async (query?: string) => {
    const searchQuery = query || input
    if (!searchQuery.trim() || isLoading) return

    // Hide suggestions when searching
    setShowSuggestions(false)
    setSuggestions([])

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: searchQuery,
      file: uploadedFile || undefined,
    }
    setMessages(prev => [...prev, userMessage])

    setInput("")
    setUploadedFile(null)
    setIsLoading(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, file: uploadedFile }),
        signal: controller.signal,
      })

      const data = await res.json()

      // Set streaming message and data for typewriter effect
      setStreamingMessage(data.aiResponse || "I couldn't find an answer.")
      setStreamingData({
        videos: data.videos || [],
        links: data.links || [],
        images: data.images || []
      })

      // Save to chat history if user is authenticated
      if (user && token) {
        const aiMessage = {
          role: "assistant" as const,
          content: data.aiResponse || "I couldn't find an answer."
        }
        const updatedMessages = [...messages, userMessage, aiMessage]
        try {
          await fetch('/api/chat-history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
              mode: 'research'
            })
          })
        } catch (error) {
          console.error('Failed to save research history:', error)
        }
      }

      setIsLoading(false)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Research error:", error)
        setStreamingMessage("Sorry, I encountered an error. Please try again.")
        setStreamingData({ videos: [], links: [], images: [] })
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto">
      {/* Chat Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Welcome Message */}
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-3">AI Research</h1>
            <p className="text-muted-foreground mb-6">
              Ask anything - get AI answers, videos, links, and images
            </p>
            <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
              {["What is React?", "Python tutorials", "Machine learning basics", "JavaScript tips"].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(suggestion)}
                  className="p-4 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-card/60 transition-all text-left text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, i) => (
          <div key={i} className={message.role === "user" ? "flex justify-end" : ""}>
            {message.role === "user" ? (
              // User Message
              <div className="max-w-[85%] sm:max-w-[75%] bg-primary text-primary-foreground rounded-2xl px-4 py-3">
                {message.file && (
                  <div className="mb-2 text-xs opacity-80 flex items-center gap-2 pb-2 border-b border-primary-foreground/20">
                    <Paperclip className="w-3 h-3" />
                    {message.file.name}
                  </div>
                )}
                <p className="text-sm break-words">{message.content}</p>
              </div>
            ) : (
              // AI Message
              <div className="space-y-4 w-full">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <Image
                      src="/icon.png"
                      alt="AI"
                      width={32}
                      height={32}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-4">
                    {/* AI Text Response */}
                    <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90 prose-sm prose-pre:max-w-full prose-pre:overflow-x-auto">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>

                    {/* Videos */}
                    {message.videos && message.videos.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <span>📺</span> Related Videos
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {message.videos.map((video, vi) => (
                            <div
                              key={vi}
                              onClick={() => setSelectedVideo(video)}
                              className="group cursor-pointer rounded-lg border border-border/40 hover:border-primary/50 transition-all overflow-hidden"
                            >
                              <div className="relative aspect-video">
                                <Image
                                  src={video.thumbnail}
                                  alt={video.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                    <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                                  </div>
                                </div>
                              </div>
                              <div className="p-2 bg-card/40">
                                <p className="text-xs font-medium line-clamp-2">{video.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{video.channel}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {message.links && message.links.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <span>🔗</span> Sources
                        </h3>
                        <div className="space-y-2">
                          {message.links.slice(0, 3).map((link, li) => (
                            <a
                              key={li}
                              href={link.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-card/60 transition-all group text-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs group-hover:text-primary transition-colors line-clamp-1">
                                    {link.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
                                    {link.snippet}
                                  </p>
                                </div>
                                <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Images */}
                    {message.images && message.images.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <span>🖼️</span> Images
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {message.images.slice(0, 4).map((img, ii) => (
                            <div
                              key={ii}
                              onClick={() => setSelectedImage(img)}
                              className="group cursor-pointer rounded-lg overflow-hidden border border-border/40 hover:border-primary/50 transition-all aspect-square relative"
                            >
                              <Image
                                src={img.thumbnail}
                                alt={img.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                unoptimized
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Streaming message with typewriter */}
        {streamingMessage && (
          <div className="space-y-4 w-full">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                <Image
                  src="/icon.png"
                  alt="AI"
                  width={32}
                  height={32}
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-4">
                {/* AI Text Response with Typewriter */}
                <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90 prose-sm prose-pre:max-w-full prose-pre:overflow-x-auto">
                  <ReactMarkdown>{displayedText}</ReactMarkdown>
                  {!isComplete && (
                    <span className="inline-block w-1 h-4 bg-current ml-0.5 animate-pulse" />
                  )}
                </div>

                {/* Videos/Links/Images only show after typewriter completes */}
                {isComplete && streamingData && (
                  <>
                    {/* Videos */}
                    {streamingData.videos && streamingData.videos.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <span>📺</span> Related Videos
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {streamingData.videos.map((video, vi) => (
                            <div
                              key={vi}
                              onClick={() => setSelectedVideo(video)}
                              className="group cursor-pointer rounded-lg border border-border/40 hover:border-primary/50 transition-all overflow-hidden"
                            >
                              <div className="relative aspect-video">
                                <Image
                                  src={video.thumbnail}
                                  alt={video.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                    <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                                  </div>
                                </div>
                              </div>
                              <div className="p-2 bg-card/40">
                                <p className="text-xs font-medium line-clamp-2">{video.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{video.channel}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {streamingData.links && streamingData.links.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <span>🔗</span> Sources
                        </h3>
                        <div className="space-y-2">
                          {streamingData.links.slice(0, 3).map((link, li) => (
                            <a
                              key={li}
                              href={link.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-card/60 transition-all group text-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs group-hover:text-primary transition-colors line-clamp-1">
                                    {link.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
                                    {link.snippet}
                                  </p>
                                </div>
                                <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Images */}
                    {streamingData.images && streamingData.images.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <span>🖼️</span> Images
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {streamingData.images.slice(0, 4).map((img, ii) => (
                            <div
                              key={ii}
                              onClick={() => setSelectedImage(img)}
                              className="group cursor-pointer rounded-lg overflow-hidden border border-border/40 hover:border-primary/50 transition-all aspect-square relative"
                            >
                              <Image
                                src={img.thumbnail}
                                alt={img.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                unoptimized
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && !streamingMessage && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
              <Image
                src="/icon.png"
                alt="AI"
                width={32}
                height={32}
                className="w-full h-full"
              />
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Stop button */}
      {(isLoading || streamingMessage) && (
        <div className="flex justify-center py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            className="border-red-500/50 hover:bg-red-500/10 hover:border-red-500"
          >
            <StopCircle className="w-4 h-4 mr-2" />
            Stop Generating
          </Button>
        </div>
      )}

      {/* Input Area - Sticky at bottom */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-border/60 p-4">
        {/* Uploaded file preview */}
        {uploadedFile && (
          <div className="max-w-4xl mx-auto mb-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/60 border border-border/60">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{uploadedFile.name}</span>
              <button
                onClick={() => setUploadedFile(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <div className="relative max-w-4xl mx-auto">
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute bottom-full mb-2 w-full bg-card border border-border/60 rounded-xl shadow-lg overflow-hidden z-10">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(suggestion)
                    setShowSuggestions(false)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors text-sm border-b border-border/40 last:border-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="flex gap-3 items-center rounded-2xl border border-border/60 bg-background px-4 py-3 focus-within:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 p-2 hover:bg-secondary/50 rounded-lg transition-colors"
              title="Upload image or PDF"
              disabled={isLoading}
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onBlur={() => {
                // Delay hiding to allow clicking on suggestions
                setTimeout(() => setShowSuggestions(false), 200)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSearch()
                }
                if (e.key === "Escape") {
                  setShowSuggestions(false)
                  setSuggestions([])
                }
              }}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent outline-none text-base"
              disabled={isLoading}
            />
            <MicButton
              onTranscript={handleVoiceTranscript}
              onError={handleVoiceError}
              size="md"
              className="shrink-0"
            />
            <Button
              onClick={() => handleSearch()}
              disabled={isLoading || (!input.trim() && !uploadedFile)}
              size="icon"
              className="shrink-0 h-9 w-9 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* YouTube Video Modal */}
      {
        selectedVideo && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <Button
                  className="absolute -top-12 right-0 bg-white/90 hover:bg-white text-black"
                  size="icon"
                  onClick={() => setSelectedVideo(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="mt-4 bg-card rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">{selectedVideo.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedVideo.channel}</p>
              </div>
            </div>
          </div>
        )
      }

      {/* Image Lightbox Modal */}
      {
        selectedImage && (
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full max-h-[85vh] rounded-lg overflow-hidden bg-black">
                <Image
                  src={selectedImage.link}
                  alt={selectedImage.title}
                  width={1200}
                  height={800}
                  className="w-full h-auto max-h-[85vh] object-contain"
                  unoptimized
                />
              </div>
              <Button
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black"
                size="icon"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="mt-4 bg-card rounded-lg p-4">
                <h3 className="font-bold mb-2">{selectedImage.title}</h3>
                {selectedImage.context && (
                  <a
                    href={selectedImage.context}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View source
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}