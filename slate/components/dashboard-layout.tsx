"use client"

import type { ReactNode } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { SiteHeader } from "@/components/site-header"
import { Toaster } from "@/components/ui/sonner"

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </AuthGuard>
  )
}
