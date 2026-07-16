import { DashboardLayout } from "@/components/dashboard-layout"
import { KaryawanTable } from "@/components/karyawan-table"

export default function KaryawanPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Karyawan <span className="text-muted-foreground text-sm font-normal">/ Data pegawai</span>
        </h1>
      </div>
      <KaryawanTable />
    </DashboardLayout>
  )
}
