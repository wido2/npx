import { BarangTable } from "@/components/barang-table"
import { BarangOverviewCards } from "@/components/barang-overview-cards"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function BarangPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Barang <span className="text-muted-foreground text-sm font-normal">/ Manage your inventory items</span>
        </h1>
      </div>
      <BarangOverviewCards />
      <div className="h-4" />
      <BarangTable />
    </DashboardLayout>
  )
}
