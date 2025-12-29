"use client"

import { useEffect } from "react"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
    id: string
    title?: string
    description: string
    type?: "success" | "error" | "info" | "warning"
    duration?: number
    onClose: (id: string) => void
}

export function Toast({ id, title, description, type = "info", duration = 5000, onClose }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id)
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [id, duration, onClose])

    const icons = {
        success: CheckCircle2,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info,
    }

    const Icon = icons[type]

    const styles = {
        success: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
        error: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100",
        warning: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100",
        info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
    }

    const iconStyles = {
        success: "text-green-600 dark:text-green-400",
        error: "text-red-600 dark:text-red-400",
        warning: "text-yellow-600 dark:text-yellow-400",
        info: "text-blue-600 dark:text-blue-400",
    }

    return (
        <div
            className={cn(
                "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border-2 shadow-lg backdrop-blur-sm animate-in slide-in-from-top-5 fade-in-0",
                styles[type]
            )}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconStyles[type])} />
                    <div className="flex-1 min-w-0">
                        {title && (
                            <p className="text-sm font-semibold mb-1">
                                {title}
                            </p>
                        )}
                        <p className="text-sm opacity-90">
                            {description}
                        </p>
                    </div>
                    <button
                        onClick={() => onClose(id)}
                        className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
