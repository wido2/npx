"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { LoaderIcon } from "lucide-react"

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { loading } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push("/")
    }
  }, [loading, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoaderIcon className="size-6 animate-spin text-muted-foreground" /></div>
  }

  return <>{children}</>
}
