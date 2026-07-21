"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PembelianLangsungTable } from "@/components/pembelian-langsung-table"

export default function PembelianLangsungPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Pembelian Langsung</h1>
        <PembelianLangsungTable />
      </div>
    </DashboardLayout>
  )
}
