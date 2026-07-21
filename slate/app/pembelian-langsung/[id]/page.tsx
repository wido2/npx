"use client"

import { use } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PembelianLangsungDetail } from "@/components/pembelian-langsung-detail"

export default function PembelianLangsungDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <DashboardLayout>
      <PembelianLangsungDetail id={id} />
    </DashboardLayout>
  )
}
