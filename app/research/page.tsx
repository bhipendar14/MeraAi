"use client"

import { ResearchChat } from "@/components/research-chat"

export default function ResearchPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-pretty">Research Assistant</h2>
        <p className="text-muted-foreground leading-relaxed">
          Switch modes to research, summarize, explain, or debug. The input has a subtle neon glow.
        </p>
      </header>
      <ResearchChat />
    </div>
  )
}
