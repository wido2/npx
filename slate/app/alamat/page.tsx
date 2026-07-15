import { DashboardLayout } from "@/components/dashboard-layout"
import { AlamatTable } from "@/components/alamat-table"

export default function AlamatPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Alamat <span className="text-muted-foreground text-sm font-normal">/ Manage your addresses</span>
        </h1>
      </div>
      <AlamatTable />
    </DashboardLayout>
  )
}
