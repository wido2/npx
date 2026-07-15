import { DashboardLayout } from "@/components/dashboard-layout"
import { KontakTable } from "@/components/kontak-table"

export default function KontakPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Kontak <span className="text-muted-foreground text-sm font-normal">/ Manage your contacts</span>
        </h1>
      </div>
      <KontakTable />
    </DashboardLayout>
  )
}
