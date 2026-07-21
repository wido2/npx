"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PembelianLangsungWizard } from "@/components/pembelian-langsung-wizard"

export default function CreatePembelianLangsungPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Buat Pembelian Langsung</h1>
        <PembelianLangsungWizard />
      </div>
    </DashboardLayout>
  )
}
