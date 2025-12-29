"use client"

import { TravelModule } from "@/components/travel-module"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function TravelPage() {
  return (
    <AuthGuard>
      <TravelModule />
    </AuthGuard>
  )
}