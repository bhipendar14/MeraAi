"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Upload, Paperclip, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { MicButton } from "@/components/ui/mic-button"

type Message = { role: "user" | "assistant"; content: string; file?: { name: string; type: string; data: string } }

export function ResearchChat() {
  const [mode, setMode] = useState<"research" | "debug" | "summarize" | "explain">("research")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hi! How can I help today?" }])
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; data: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, token } = useAuth()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      alert("Please upload an image (JPEG, PNG, GIF, WebP) or PDF file")
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    // Convert to base64
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
    console.log("Voice transcript received:", transcript)
    
    // Don't set input, directly send the message
    if (transcript.trim()) {
      console.log("Auto-sending voice transcript:", transcript)
      
      const next: Message = {
        role: "user",
        content: transcript.trim(),
        file: uploadedFile || undefined,
      }
      
      setMessages((m) => [...m, next])
      setInput("") // Clear input
      setUploadedFile(null) // Clear any uploaded file
      setIsGenerating(true)

      // Send to API immediately
      fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode, messages: [...messages, next] }),
      })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text()
          console.error("[Voice] API error:", errorText)
          setMessages((m) => [...m, { role: "assistant", content: "Sorry, there was an error. Please try again." }])
          setIsGenerating(false)
          return
        }

        const data = await res.json()
        console.log("[Voice] Received reply:", data.reply?.substring(0, 50))
        const assistantMessage: Message = { role: "assistant", content: data.reply || "..." }
        const newMessages = [...messages, next, assistantMessage]
        setMessages(newMessages)
        
        // Save chat history if user is logged in
        if (user && token && newMessages.length > 1) {
          try {
            await fetch('/api/chat-history', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                messages: newMessages,
                mode
              })
            })
          } catch (error) {
            console.error('Failed to save chat history:', error)
          }
        }
        
        setIsGenerating(false)
      })
      .catch((error) => {
        console.error("[Voice] Error:", error)
        setMessages((m) => [...m, { role: "assistant", content: "Sorry, there was an error processing your voice message." }])
        setIsGenerating(false)
      })
    }
  }

  const handleVoiceError = (error: string) => {
    console.error("Voice input error:", error)
    // Show error message in chat
    setMessages((m) => [...m, {
      role: "assistant",
      content: `Voice input error: ${error}. Please try again or type your message.`
    }])
  }

  const onSend = async () => {
    console.log("onSend called with input:", input, "uploadedFile:", !!uploadedFile)
    if (!input.trim() && !uploadedFile) {
      console.log("onSend: No input or file, returning")
      return
    }

    const next: Message = {
      role: "user",
      content: input.trim() || "Analyze this file",
      file: uploadedFile || undefined,
    }
    setMessages((m) => [...m, next])
    setInput("")
    setUploadedFile(null)
    setIsGenerating(true)

    try {
      console.log("[v0] Sending message to /api/chat")
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode, messages: [...messages, next] }),
      })

      console.log("[v0] Response status:", res.status)

      if (!res.ok) {
        const errorText = await res.text()
        console.error("[v0] API error:", errorText)
        setMessages((m) => [...m, { role: "assistant", content: "Sorry, there was an error. Please try again." }])
        setIsGenerating(false)
        return
      }

      const data = await res.json()
      console.log("[v0] Received reply:", data.reply?.substring(0, 50))
      const assistantMessage: Message = { role: "assistant", content: data.reply || "..." }
      const newMessages = [...messages, next, assistantMessage]
      setMessages(newMessages)

      // Save chat history if user is logged in
      if (user && token && newMessages.length > 1) {
        try {
          await fetch('/api/chat-history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              messages: newMessages,
              mode
            })
          })
        } catch (error) {
          console.error('Failed to save chat history:', error)
        }
      }

      setIsGenerating(false)
    } catch (error) {
      console.error("[v0] Error in onSend:", error)
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, there was an error. Please try again." }])
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid gap-4">
      {/* Mode Switch */}
      <div className="flex flex-wrap gap-2">
        {[
          { k: "research", label: "Research", neon: "var(--color-accent-cyan)" },
          { k: "debug", label: "Debug Code", neon: "var(--color-accent-pink)" },
          { k: "summarize", label: "Summarize", neon: "var(--color-accent-amber)" },
          { k: "explain", label: "Explain", neon: "var(--color-accent-cyan)" },
        ].map((opt) => (
          <button
            key={opt.k}
            onClick={() => setMode(opt.k as any)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm border transition-all",
              mode === opt.k ? "bg-card/70" : "bg-card/40 hover:bg-card/60",
            )}
            style={{ ["--neon" as any]: opt.neon }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chat List */}
      <Card className="p-4 border-border/60 bg-card/60 backdrop-blur">
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i}>
              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-prose leading-relaxed",
                  m.role === "user" ? "ml-auto bg-secondary/50" : "bg-muted/40",
                )}
              >
                {m.file && (
                  <div className="mb-2 text-xs text-muted-foreground flex items-center gap-2">
                    <Paperclip className="w-3 h-3" />
                    {m.file.name}
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="rounded-lg px-3 py-2 max-w-prose bg-muted/40">
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {uploadedFile && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/60">
          <Paperclip className="w-4 h-4" />
          <span className="text-sm flex-1">{uploadedFile.name}</span>
          <button
            onClick={() => setUploadedFile(null)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div
        className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-2 transition-all"
        style={{ boxShadow: "0 0 0 0 var(--color-accent-cyan)" }}
      >
        <div className="flex gap-2 items-center">
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
          >
            <Upload className="w-4 h-4" />
          </Button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), onSend())}
            placeholder="Ask anything…"
            className="flex-1 bg-transparent outline-none px-3 py-2 rounded-md min-w-0"
            aria-label="Chat input"
            disabled={isGenerating}
          />
          <MicButton
            onTranscript={handleVoiceTranscript}
            onError={handleVoiceError}
            size="md"
            className="shrink-0"
          />
          <Button
            onClick={onSend}
            className="transition-all hover:shadow-[0_0_12px_var(--color-accent-cyan)] shrink-0"
            disabled={isGenerating}
          >
            <span className="hidden sm:inline">Send</span>
            <span className="sm:hidden">→</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
