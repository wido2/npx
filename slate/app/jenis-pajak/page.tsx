import { DashboardLayout } from "@/components/dashboard-layout"
import { JenisPajakTable } from "@/components/jenis-pajak-table"

export default function JenisPajakPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Jenis Pajak <span className="text-muted-foreground text-sm font-normal">/ Manage tax types</span>
        </h1>
      </div>
      <JenisPajakTable />
    </DashboardLayout>
  )
}
