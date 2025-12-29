"use client"

import { useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { ChatHistory } from '@/components/chat/chat-history'
import { EntertainmentHistory } from '@/components/history/entertainment-history'
import { NewsHistory } from '@/components/history/news-history'
import { StocksHistory } from '@/components/history/stocks-history'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Film, Newspaper, TrendingUp, History } from 'lucide-react'

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <AuthGuard>
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <History className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Activity History</h2>
          </div>
          <p className="text-muted-foreground">View and manage all your activities across the platform</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="entertainment" className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Entertainment</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
            <TabsTrigger value="stocks" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Stocks</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <ChatHistory />
          </TabsContent>

          <TabsContent value="entertainment" className="mt-6">
            <EntertainmentHistory />
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <NewsHistory />
          </TabsContent>

          <TabsContent value="stocks" className="mt-6">
            <StocksHistory />
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}