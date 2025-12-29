"use client"

import { TechModule } from "@/components/tech-module"
import { Code2, Zap, Brain, Sparkles } from "lucide-react"

export default function TechPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
            <Code2 className="w-6 h-6 text-cyan-500" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Tech — AI Code Editor
          </h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Professional code editor powered by Monaco (VS Code) with AI assistance
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-cyan-500" />
            <span>Auto-completion</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Code2 className="w-4 h-4 text-purple-500" />
            <span>Syntax highlighting</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4 text-pink-500" />
            <span>AI code assistance</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Code templates</span>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
          <span className="px-2 py-1 rounded bg-accent/20">
            <kbd className="font-mono">Ctrl+Enter</kbd> Run code
          </span>
          <span className="px-2 py-1 rounded bg-accent/20">
            <kbd className="font-mono">Ctrl+S</kbd> Save (download)
          </span>
          <span className="px-2 py-1 rounded bg-accent/20">
            <kbd className="font-mono">Ctrl+/</kbd> Comment
          </span>
        </div>
      </header>

      <TechModule />
    </div>
  )
}
