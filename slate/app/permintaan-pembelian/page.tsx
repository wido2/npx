import { PermintaanPembelianTable } from "@/components/permintaan-pembelian-table"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function PermintaanPembelianPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Permintaan Pembelian</h1>
        </div>
        <PermintaanPembelianTable />
      </div>
    </DashboardLayout>
  )
}