import { DashboardLayout } from "@/components/dashboard-layout"
import { PengambilanBarangTable } from "@/components/pengambilan-barang-table"

export default function PengambilanBarangPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Pengambilan Barang <span className="text-muted-foreground text-sm font-normal">/ Pengeluaran barang dari gudang</span>
        </h1>
      </div>
      <PengambilanBarangTable />
    </DashboardLayout>
  )
}
