"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Upload, Paperclip, X, Copy, Check, StopCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { MicButton } from "@/components/ui/mic-button"
import { useTypewriter } from "@/hooks/use-typewriter"
import ReactMarkdown from "react-markdown"
import Image from "next/image"

type Message = { role: "user" | "assistant"; content: string; file?: { name: string; type: string; data: string } }

interface ResearchChatProps {
  compact?: boolean
}

export function ResearchChat({ compact = false }: ResearchChatProps) {
  const [mode, setMode] = useState<"research" | "debug" | "summarize" | "explain">("research")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hi! How can I help today?" }])
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; data: string } | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { user, token } = useAuth()

  // Typewriter effect for streaming message
  const { displayedText, isComplete } = useTypewriter(streamingMessage, 20)

  // When typewriter completes, add the message to the array
  useEffect(() => {
    if (isComplete && streamingMessage) {
      setMessages(prev => [...prev, { role: "assistant", content: streamingMessage }])
      setStreamingMessage("")
    }
  }, [isComplete, streamingMessage])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isGenerating, streamingMessage])

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

  const handleStop = () => {
    abortControllerRef.current?.abort()
    setIsGenerating(false)
    if (streamingMessage) {
      setMessages(prev => [...prev, { role: "assistant", content: streamingMessage + " [Stopped]" }])
      setStreamingMessage("")
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript.trim()) {
      const next: Message = {
        role: "user",
        content: transcript.trim(),
        file: uploadedFile || undefined,
      }

      setMessages((m) => [...m, next])
      setInput("")
      setUploadedFile(null)
      setIsGenerating(true)

      const controller = new AbortController()
      abortControllerRef.current = controller

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, messages: [...messages, next] }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) {
            setStreamingMessage("Sorry, there was an error. Please try again.")
            setIsGenerating(false)
            return
          }

          const data = await res.json()
          const reply = data.reply || "..."
          setStreamingMessage(reply)

          // Save to history
          if (user && token) {
            const newMessages = [...messages, next, { role: "assistant" as const, content: reply }]
            try {
              await fetch('/api/chat-history', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ messages: newMessages, mode })
              })
            } catch (error) {
              console.error('Failed to save chat history:', error)
            }
          }

          setIsGenerating(false)
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            setStreamingMessage("Sorry, there was an error processing your voice message.")
            setIsGenerating(false)
          }
        })
    }
  }

  const handleVoiceError = (error: string) => {
    setMessages((m) => [...m, {
      role: "assistant",
      content: `Voice input error: ${error}. Please try again or type your message.`
    }])
  }

  const onSend = async () => {
    if (!input.trim() && !uploadedFile) return

    const next: Message = {
      role: "user",
      content: input.trim() || "Analyze this file",
      file: uploadedFile || undefined,
    }
    setMessages((m) => [...m, next])
    setInput("")
    setUploadedFile(null)
    setIsGenerating(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, messages: [...messages, next] }),
        signal: controller.signal,
      })

      if (!res.ok) {
        setStreamingMessage("Sorry, there was an error. Please try again.")
        setIsGenerating(false)
        return
      }

      const data = await res.json()
      const reply = data.reply || "..."
      setStreamingMessage(reply)

      // Save to history
      if (user && token) {
        const newMessages = [...messages, next, { role: "assistant" as const, content: reply }]
        try {
          await fetch('/api/chat-history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ messages: newMessages, mode })
          })
        } catch (error) {
          console.error('Failed to save chat history:', error)
        }
      }

      setIsGenerating(false)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setStreamingMessage("Sorry, there was an error. Please try again.")
        setIsGenerating(false)
      }
    }
  }

  const copyToClipboard = (content: string, index: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className={cn(
      "flex flex-col",
      compact ? "h-full" : "h-[calc(100vh-12rem)]"
    )}>
      {/* Mode Switch - Only show if not compact */}
      {!compact && (
        <div className="flex flex-wrap gap-2 pb-4 border-b border-border/40">
          {[
            { k: "research", label: "Research", icon: "🔍" },
            { k: "debug", label: "Debug Code", icon: "🐛" },
            { k: "summarize", label: "Summarize", icon: "📝" },
            { k: "explain", label: "Explain", icon: "💡" },
          ].map((opt) => (
            <button
              key={opt.k}
              onClick={() => setMode(opt.k as any)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium border transition-all",
                mode === opt.k
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                  : "bg-card/40 hover:bg-card/70 border-border/60"
              )}
            >
              <span className="mr-1.5">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Messages - Scrollable area */}
      <div className={cn(
        "flex-1 overflow-y-auto space-y-4",
        compact ? "py-3" : "py-6",
        compact && "max-h-[350px]"
      )}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {/* AI Avatar */}
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-primary/30">
                <Image
                  src="/icon.png"
                  alt="AI"
                  width={32}
                  height={32}
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Message Content */}
            <div className={cn(
              "max-w-[85%] md:max-w-[70%] group",
              m.role === "user" ? "order-first" : ""
            )}>
              <div className={cn(
                "rounded-2xl px-4 py-3 relative",
                m.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-card/60 backdrop-blur border border-border/60"
              )}>
                {m.file && (
                  <div className="mb-2 text-xs opacity-70 flex items-center gap-2 pb-2 border-b border-current/20">
                    <Paperclip className="w-3 h-3" />
                    {m.file.name}
                  </div>
                )}
                <div className="leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                  {m.role === "assistant" ? (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  ) : (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>

                {/* Copy button for AI messages */}
                {m.role === "assistant" && (
                  <button
                    onClick={() => copyToClipboard(m.content, i)}
                    className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-background/80 hover:bg-background border border-border/60"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === i ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* User Avatar */}
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ring-1 ring-primary/30">
                <span className="text-sm">👤</span>
              </div>
            )}
          </div>
        ))}

        {/* Streaming message with typewriter */}
        {streamingMessage && (
          <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-primary/30">
              <Image
                src="/icon.png"
                alt="AI"
                width={32}
                height={32}
                className="w-full h-full"
              />
            </div>
            <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[70%]">
              <div className="leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
                <ReactMarkdown>{displayedText}</ReactMarkdown>
                {!isComplete && (
                  <span className="inline-block w-1 h-4 bg-current ml-0.5 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isGenerating && !streamingMessage && (
          <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-primary/30">
              <Image
                src="/icon.png"
                alt="AI"
                width={32}
                height={32}
                className="w-full h-full"
              />
            </div>
            <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Stop button */}
      {(isGenerating || streamingMessage) && (
        <div className="flex justify-center pb-3">
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

      {/* Uploaded file preview */}
      {uploadedFile && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/60 border border-border/60 mb-3">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm flex-1 truncate">{uploadedFile.name}</span>
          <button
            onClick={() => setUploadedFile(null)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input - Fixed at bottom */}
      <div className="border-t border-border/40 pt-4">
        <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-2 transition-all focus-within:border-primary/50 focus-within:shadow-[0_0_16px_hsl(var(--primary)/0.2)]">
          <div className="flex gap-2 items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0"
              title="Upload image or PDF"
              disabled={isGenerating}
            >
              <Upload className="w-4 h-4" />
            </Button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  onSend()
                }
              }}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent outline-none px-3 py-2 rounded-md min-w-0 resize-none max-h-32"
              rows={1}
              disabled={isGenerating}
              style={{
                height: 'auto',
                minHeight: '40px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = target.scrollHeight + 'px'
              }}
            />
            <MicButton
              onTranscript={handleVoiceTranscript}
              onError={handleVoiceError}
              size="md"
              className="shrink-0"
            />
            <Button
              onClick={onSend}
              className="transition-all hover:shadow-[0_0_12px_hsl(var(--primary)/0.4)] shrink-0"
              disabled={isGenerating || (!input.trim() && !uploadedFile)}
            >
              <span className="hidden sm:inline">Send</span>
              <span className="sm:hidden">→</span>
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  )
}
