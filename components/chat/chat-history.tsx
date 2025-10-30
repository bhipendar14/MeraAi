"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { History, Trash2, Loader2, MessageSquare } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  file?: { name: string; type: string; data: string }
}

interface ChatHistory {
  id: string
  messages: ChatMessage[]
  mode: string
  createdAt: string
  updatedAt: string
}

export function ChatHistory() {
  const [history, setHistory] = useState<ChatHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [clearLoading, setClearLoading] = useState(false)
  const [error, setError] = useState('')
  const { token } = useAuth()

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/chat-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setHistory(data.history)
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError('Failed to fetch chat history')
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    setClearLoading(true)
    
    try {
      const response = await fetch('/api/chat-history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setHistory([])
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (error) {
      setError('Failed to clear chat history')
    } finally {
      setClearLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <Card className="border-border/60 bg-card/60 backdrop-blur">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading chat history...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Chat History ({history.length})
          </CardTitle>
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={clearLoading}>
                  {clearLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to clear all your chat history? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearHistory}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Clear History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {history.map((chat) => (
            <div key={chat.id} className="border border-border/40 rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium capitalize">{chat.mode} Chat</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(chat.createdAt).toLocaleString()}
                </span>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {chat.messages.slice(0, 3).map((message, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-muted-foreground">
                      {message.role === 'user' ? 'You: ' : 'AI: '}
                    </span>
                    <span className="text-foreground">
                      {message.content.length > 100 
                        ? `${message.content.substring(0, 100)}...` 
                        : message.content
                      }
                    </span>
                    {message.file && (
                      <span className="text-xs text-muted-foreground ml-2">
                        📎 {message.file.name}
                      </span>
                    )}
                  </div>
                ))}
                {chat.messages.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{chat.messages.length - 3} more messages
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {history.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No chat history found</p>
            <p className="text-sm">Start a conversation to see your history here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}