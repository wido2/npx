"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PermintaanPembelianWizard } from "@/components/permintaan-pembelian-wizard"

export default function PermintaanPembelianCreatePage() {
  const { can, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !can("pp.create")) {
      router.push("/permintaan-pembelian")
    }
  }, [loading, can, router])

  if (loading || !can("pp.create")) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Buat Permintaan Pembelian</h1>
        <PermintaanPembelianWizard />
      </div>
    </DashboardLayout>
  )
}