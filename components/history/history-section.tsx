"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Loader2, X } from 'lucide-react'
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
import { formatTimestamp } from '@/lib/history-utils'

interface HistorySectionProps {
    title: string
    icon: React.ComponentType<{ className?: string }>
    activities: any[]
    loading: boolean
    error: string
    emptyMessage: string
    renderActivity: (activity: any, index: number) => React.ReactNode
    onDeleteItem: (itemId: string) => Promise<void>
    onClearAll: () => Promise<void>
    categoryColor?: string
}

export function HistorySection({
    title,
    icon: Icon,
    activities,
    loading,
    error,
    emptyMessage,
    renderActivity,
    onDeleteItem,
    onClearAll,
    categoryColor = 'blue'
}: HistorySectionProps) {
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
    const [clearLoading, setClearLoading] = useState(false)

    const handleDeleteItem = async (itemId: string) => {
        setDeleteLoading(itemId)
        try {
            await onDeleteItem(itemId)
        } finally {
            setDeleteLoading(null)
        }
    }

    const handleClearAll = async () => {
        setClearLoading(true)
        try {
            await onClearAll()
        } finally {
            setClearLoading(false)
        }
    }

    if (loading) {
        return (
            <Card className="border-border/60 bg-card/60 backdrop-blur">
                <CardContent className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading {title.toLowerCase()}...</span>
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
                        <Icon className="w-5 h-5" />
                        {title} ({activities.length})
                    </CardTitle>
                    {activities.length > 0 && (
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
                                    <AlertDialogTitle>Clear {title}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to clear all your {title.toLowerCase()}? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleClearAll}
                                        className="bg-red-500 hover:bg-red-600"
                                    >
                                        Clear All
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

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activities.map((activity, index) => (
                        <div
                            key={activity.id}
                            className="border border-border/40 rounded-lg p-3 bg-muted/20 hover:bg-muted/30 transition-colors group"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    {renderActivity(activity, index)}
                                    <div className="text-xs text-muted-foreground mt-2">
                                        {formatTimestamp(activity.timestamp)}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteItem(activity.id)}
                                    disabled={deleteLoading === activity.id}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                >
                                    {deleteLoading === activity.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <X className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {activities.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{emptyMessage}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
