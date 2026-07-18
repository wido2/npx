"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PurchaseOrderWizard } from "@/components/purchase-order-wizard"

export default function CreatePOPage() {
  const { can, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !can("po.create")) {
      router.replace("/purchase-order")
    }
  }, [loading, can, router])

  if (loading || !can("po.create")) return null

  return (
    <DashboardLayout>
      <PurchaseOrderWizard />
    </DashboardLayout>
  )
}
