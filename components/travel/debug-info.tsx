"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugInfo() {
  const { user, token } = useAuth()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800 dark:text-yellow-200">Debug Info (Dev Only)</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>User:</strong> {user ? `${user.name} (${user.role})` : 'Not logged in'}
        </div>
        <div>
          <strong>Token:</strong> {token ? 'Present' : 'Missing'}
        </div>
        <div>
          <strong>Auth Token in localStorage:</strong> {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}
        </div>
        <div>
          <strong>Google Maps API Key:</strong> {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Configured' : 'Missing'}
        </div>
      </CardContent>
    </Card>
  )
}