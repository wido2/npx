import { DashboardLayout } from "@/components/dashboard-layout"
import { BarangReportCards } from "@/components/barang-report-cards"

export default function LaporanBarangPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Laporan Barang <span className="text-muted-foreground text-sm font-normal">/ Barang reports and analytics</span>
        </h1>
      </div>
      <BarangReportCards />
    </DashboardLayout>
  )
}
