"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PurchaseOrderWizard } from "@/components/purchase-order-wizard"

export default function CreatePOPage() {
  const { can, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const ppId = searchParams.get("pp_id")

  useEffect(() => {
    if (loading) return
    if (!can("po.create")) {
      router.replace("/purchase-order")
    } else if (ppId && !can("pp.create_po")) {
      router.replace("/purchase-order")
    }
  }, [loading, can, router, ppId])

  if (loading || !can("po.create") || (ppId && !can("pp.create_po"))) return null

  return (
    <DashboardLayout>
      <PurchaseOrderWizard />
    </DashboardLayout>
  )
}
