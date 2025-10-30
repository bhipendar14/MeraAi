"use client"

import { AuthGuard } from '@/components/auth/auth-guard'
import { ProfileForm } from '@/components/profile/profile-form'

export default function ProfilePage() {
  return (
    <AuthGuard>
      <div className="space-y-6">
        <header>
          <h2 className="text-2xl font-semibold">Profile Settings</h2>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </header>
        <ProfileForm />
      </div>
    </AuthGuard>
  )
}