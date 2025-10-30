"use client"

import { TechModule } from "@/components/tech-module"

export default function TechPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Tech — Code Tools</h2>
        <p className="text-muted-foreground">Editor with Run, Fix, Explain actions.</p>
      </header>
      <TechModule />
    </div>
  )
}
