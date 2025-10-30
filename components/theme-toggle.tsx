"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("theme-dark")
    const isDark = saved ? saved === "true" : true
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem("theme-dark", String(next))
    document.documentElement.classList.toggle("dark", next)
  }

  return (
    <Button variant="secondary" onClick={toggle} className="gap-2">
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="sr-only">Toggle theme</span>
      {dark ? "Light" : "Dark"}
    </Button>
  )
}
