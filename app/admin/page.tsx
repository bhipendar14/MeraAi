"use client"

import { useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { UsersTable } from '@/components/admin/users-table'
import { BookingsTable } from '@/components/admin/bookings-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Package } from 'lucide-react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <AuthGuard requireAdmin>
      <div className="space-y-6">
        <header>
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage users and view booking records</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UsersTable />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <BookingsTable />
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}