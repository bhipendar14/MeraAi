"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, LogOut, Mail } from "lucide-react"
import { navItems } from "./nav-items"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import * as React from "react"
import Image from "next/image"

export default function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const { user, logout } = useAuth()

  React.useEffect(() => {
    // Close the sheet when route changes
    setOpen(false)
  }, [pathname])

  // Filter nav items based on auth status and role
  const filteredNavItems = navItems.filter(item => {
    if (item.requireAuth && !user) return false
    if (item.adminOnly && user?.role !== 'admin') return false
    return true
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <div className="p-4 border-b border-border/60 flex items-center gap-3">
          <Image
            src="/icon.png"
            alt="MeraAi"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="text-sm font-medium">MeraAi</div>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {filteredNavItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ ["--neon" as any]: item.accent }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all border border-transparent",
                  active ? "bg-card/70" : "bg-card/40",
                  "hover:shadow-[0_0_12px_var(--neon)] hover:border-border/60",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}

          {!user && (
            <Link
              href="/auth"
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all border border-transparent bg-card/40 hover:bg-card/60"
            >
              <LogOut className="size-5 shrink-0" aria-hidden="true" />
              <span className="text-sm">Sign In</span>
            </Link>
          )}
        </nav>

        <div className="mt-auto border-t border-border/60 p-3 space-y-3">
          {user && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                <div className="font-medium">{user.name}</div>
                <div className="capitalize">{user.role}</div>
              </div>
            </div>
          )}

          {/* Settings Link - Available for all users */}
          <Link href="/contact" className="block">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <Mail className="size-4 mr-2" />
              Contact Us
            </Button>
          </Link>

          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start"
            >
              <LogOut className="size-4 mr-2" />
              Sign Out
            </Button>
          )}

          <div className="text-xs text-muted-foreground">MeraAi v1.0</div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
