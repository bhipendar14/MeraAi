"use client"

import { AuthGuard } from '@/components/auth/auth-guard'
import { UsersTable } from '@/components/admin/users-table'

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      <div className="space-y-6">
        <header>
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage users and system settings</p>
        </header>
        <UsersTable />
      </div>
    </AuthGuard>
  )
}