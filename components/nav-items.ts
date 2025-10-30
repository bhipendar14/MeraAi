import { Home, Search, Film, Newspaper, TrendingUp, Bus, Code2, Gamepad2, User, History, Shield, type LucideIcon } from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  accent: string
  requireAuth?: boolean
  adminOnly?: boolean
}

export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home, accent: "var(--color-accent-cyan)" },
  { href: "/research", label: "Research", icon: Search, accent: "var(--color-accent-cyan)" },
  { href: "/entertainment", label: "Entertainment", icon: Film, accent: "var(--color-accent-pink)" },
  { href: "/news", label: "News", icon: Newspaper, accent: "var(--color-accent-amber)" },
  { href: "/stocks", label: "Stocks", icon: TrendingUp, accent: "var(--color-accent-cyan)" },
  { href: "/travel", label: "Travel", icon: Bus, accent: "var(--color-accent-amber)" },
  { href: "/tech", label: "Tech", icon: Code2, accent: "var(--color-accent-pink)" },
  { href: "/games", label: "Games", icon: Gamepad2, accent: "var(--color-accent-cyan)" },
  { href: "/profile", label: "Profile", icon: User, accent: "var(--color-accent-pink)", requireAuth: true },
  { href: "/history", label: "History", icon: History, accent: "var(--color-accent-amber)", requireAuth: true },
  { href: "/admin", label: "Admin", icon: Shield, accent: "var(--color-accent-pink)", requireAuth: true, adminOnly: true },
]
