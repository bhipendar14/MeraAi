"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && user) {
            router.push('/')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }

    if (user) {
        return null
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
            <div className="w-full max-w-md">
                {isLogin ? (
                    <LoginForm onToggleMode={() => setIsLogin(false)} />
                ) : (
                    <RegisterForm onToggleMode={() => setIsLogin(true)} />
                )}
            </div>
        </div>
    )
}