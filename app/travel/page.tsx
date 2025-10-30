"use client"

import { TravelModule } from "@/components/travel-module"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function TravelPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Travel & Booking</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Search transportation, discover destinations, and book your next journey with AI-powered recommendations.
          </p>
        </div>
        <TravelModule />
      </div>
    </AuthGuard>
  )
}