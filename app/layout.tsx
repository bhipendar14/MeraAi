import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import Sidebar from "@/components/sidebar"
import ThemeToggle from "@/components/theme-toggle"
import { AuthProvider } from "@/contexts/auth-context"
import dynamic from "next/dynamic"
const MobileNav = dynamic(() => import("@/components/mobile-nav"), { ssr: false })

export const metadata: Metadata = {
  title: "Mera AI — Super App",
  description: "Multi-module AI Super App",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark antialiased">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-dvh flex">
              <Sidebar />
              <div className="flex-1 flex min-w-0">
                <main className="flex-1 min-w-0">
                  <header className="sticky top-0 z-20 border-b border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                    <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MobileNav />
                        <h1 className="text-pretty text-lg md:text-2xl font-semibold tracking-tight">
                          Mera AI
                          <span className="ml-2 text-sm font-normal text-muted-foreground">Super App</span>
                        </h1>
                      </div>
                      <ThemeToggle />
                    </div>
                  </header>
                  <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
                </main>
              </div>
            </div>
          </Suspense>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
