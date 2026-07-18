"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ClientForm } from "@/components/client-form"

export default function CreateClientPage() {
  const { can, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !can("master.client.create")) {
      router.replace("/client")
    }
  }, [loading, can, router])

  if (loading || !can("master.client.create")) return null

  return (
    <DashboardLayout>
      <ClientForm />
    </DashboardLayout>
  )
}
