import { DashboardLayout } from "@/components/dashboard-layout"
import { ClientTable } from "@/components/client-table"

export default function ClientPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Client <span className="text-muted-foreground text-sm font-normal">/ Manage your clients</span>
        </h1>
      </div>
      <ClientTable />
    </DashboardLayout>
  )
}
