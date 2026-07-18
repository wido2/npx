"use client"

import type { ReactNode } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { SiteHeader } from "@/components/site-header"
import { Toaster } from "@/components/ui/sonner"
import { NotificationProvider } from "@/lib/notification-context"

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <NotificationProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1 p-4">
            {children}
          </main>
        </div>
      </NotificationProvider>
      <Toaster position="top-right" />
    </AuthGuard>
  )
}
