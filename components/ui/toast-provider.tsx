"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { Toast, ToastProps } from "./toast-custom"

interface ToastContextType {
    showToast: (toast: Omit<ToastProps, "id" | "onClose">) => void
    showSuccess: (description: string, title?: string) => void
    showError: (description: string, title?: string) => void
    showInfo: (description: string, title?: string) => void
    showWarning: (description: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastProps[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback((toast: Omit<ToastProps, "id" | "onClose">) => {
        const id = Math.random().toString(36).substring(7)
        setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }])
    }, [removeToast])

    const showSuccess = useCallback((description: string, title?: string) => {
        showToast({ type: "success", description, title })
    }, [showToast])

    const showError = useCallback((description: string, title?: string) => {
        showToast({ type: "error", description, title })
    }, [showToast])

    const showInfo = useCallback((description: string, title?: string) => {
        showToast({ type: "info", description, title })
    }, [showToast])

    const showWarning = useCallback((description: string, title?: string) => {
        showToast({ type: "warning", description, title })
    }, [showToast])

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4 sm:px-0">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within ToastProvider")
    }
    return context
}
