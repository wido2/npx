import { DashboardLayout } from "@/components/dashboard-layout"
import { LaporanBarangContent } from "@/components/laporan-barang-content"

export default function LaporanBarangPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Laporan Barang <span className="text-muted-foreground text-sm font-normal">/ Ringkasan dan analisis barang</span>
        </h1>
      </div>
      <LaporanBarangContent />
    </DashboardLayout>
  )
}