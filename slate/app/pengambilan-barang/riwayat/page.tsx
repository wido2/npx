"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { RiwayatPengambilanTable } from "@/components/riwayat-pengambilan-table"

export default function RiwayatPengambilanPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Riwayat Pengambilan Barang{" "}
          <span className="text-muted-foreground text-sm font-normal">/ Log barang yang diambil</span>
        </h1>
      </div>
      <RiwayatPengambilanTable />
    </DashboardLayout>
  )
}
