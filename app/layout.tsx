import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import ThemeToggle from "@/components/theme-toggle"
import { AuthProvider } from "@/contexts/auth-context"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { ToastProvider } from "@/components/ui/toast-provider"

const MobileNav = dynamic(() => import("@/components/mobile-nav"), { ssr: false })
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mera AI - Your Super App",
  description: "All-in-one AI-powered super app",
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <ToastProvider>
              <Suspense fallback={null}>
                <div className="flex h-screen overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto">
                    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <div className="flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                          <MobileNav />
                          <h1 className="text-xl font-bold">
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
              </Suspense>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
