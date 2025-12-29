"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, LogOut, Settings, Moon, Sun, X, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { navItems } from "./nav-items"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { SidebarWeather } from "@/components/sidebar-weather"
import { useTheme } from "next-themes"
import Image from "next/image"

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar:collapsed")
      if (saved != null) setCollapsed(saved === "1")
    } catch { }
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0")
    } catch { }
  }, [collapsed])

  const pathname = usePathname()

  // Filter nav items based on auth status and role
  const filteredNavItems = navItems.filter(item => {
    if (item.requireAuth && !user) return false
    if (item.adminOnly && user?.role !== 'admin') return false
    return true
  })
  return (
    <aside
      aria-label="Primary"
      className={cn(
        "hidden md:block sticky top-0 h-dvh border-r border-border/60 bg-sidebar/80 backdrop-blur",
        collapsed ? "w-16" : "w-64",
      )}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div className="h-full flex flex-col">
        <div className="p-4">
          {collapsed ? (
            <div className="flex items-center justify-center">
              <Image
                src="/icon.png"
                alt="MeraAi"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="sr-only">MeraAi</span>
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 bg-card/60 p-4 flex items-center gap-3">
              <Image
                src="/icon.png"
                alt="MeraAi"
                width={32}
                height={32}
                className="rounded-full"
              />
              <div className="text-lg font-semibold">MeraAi</div>
            </div>
          )}
        </div>

        <nav className="px-3 pb-6 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                style={{ ["--neon" as any]: item.accent }}
                className={cn(
                  "group flex items-center rounded-lg transition-all border border-transparent",
                  active ? "bg-card/70" : "bg-card/40",
                  "hover:shadow-[0_0_12px_var(--neon)] hover:border-border/60",
                  collapsed ? "justify-center gap-0 p-2" : "gap-3 px-3 py-2",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            )
          })}

          {!user && (
            <Link
              href="/auth"
              className={cn(
                "group flex items-center rounded-lg transition-all border border-transparent bg-card/40 hover:bg-card/60",
                collapsed ? "justify-center gap-0 p-2" : "gap-3 px-3 py-2",
              )}
            >
              <LogOut className="size-5 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="text-sm">Sign In</span>}
            </Link>
          )}
        </nav>

        <div className="mt-auto border-t border-border/60 p-3 space-y-3">
          {/* Weather Display */}
          <SidebarWeather collapsed={collapsed} />

          {user && (
            <div className="space-y-2">
              {!collapsed && (
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium">{user.name}</div>
                  <div className="capitalize">{user.role}</div>
                </div>
              )}
            </div>
          )}

          {/* Settings Button - Available for ALL users */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "w-full transition-colors",
                collapsed ? "px-2" : "justify-start"
              )}
              title="Settings"
            >
              <Settings className="size-4" aria-hidden="true" />
              {!collapsed && <span className="ml-2">Settings</span>}
            </Button>

            {/* Settings Dropdown */}
            {showSettings && (
              <>
                {/* Invisible overlay to close dropdown when clicking outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSettings(false)}
                />
                <div className={cn(
                  "absolute bottom-full mb-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50",
                  collapsed ? "left-full ml-2 w-48" : "left-0 w-full"
                )}>
                  {/* Header with X button */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="font-semibold text-sm">Settings</span>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="hover:bg-muted rounded-full p-1 transition-colors"
                      aria-label="Close settings"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-2 space-y-1">
                    {/* Theme Toggle */}
                    <button
                      onClick={() => {
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                        setShowSettings(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="h-4 w-4" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>

                    {/* Contact Us Button */}
                    <Link href="/contact" onClick={() => setShowSettings(false)}>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Contact Us</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sign Out Button - Only for logged in users */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className={cn(
                "w-full transition-colors",
                collapsed ? "px-2" : "justify-start"
              )}
            >
              <LogOut className="size-4" aria-hidden="true" />
              {!collapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "w-full flex items-center justify-center rounded-md border border-border/60 bg-card/60 px-2 py-2 hover:bg-card/80 transition-colors",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <ChevronRight className="size-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="size-4" aria-hidden="true" />
            )}
          </button>
          {!collapsed && <div className="mt-3 text-center text-xs text-muted-foreground">MeraAi v1.0</div>}
        </div>
      </div>
    </aside>
  )
}
