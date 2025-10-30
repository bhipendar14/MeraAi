"use client"

import { AuthGuard } from '@/components/auth/auth-guard'
import { ChatHistory } from '@/components/chat/chat-history'

export default function HistoryPage() {
  return (
    <AuthGuard>
      <div className="space-y-6">
        <header>
          <h2 className="text-2xl font-semibold">Chat History</h2>
          <p className="text-muted-foreground">View and manage your conversation history</p>
        </header>
        <ChatHistory />
      </div>
    </AuthGuard>
  )
}