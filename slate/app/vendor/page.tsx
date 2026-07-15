import { DashboardLayout } from "@/components/dashboard-layout"
import { VendorTable } from "@/components/vendor-table"

export default function VendorPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Vendor <span className="text-muted-foreground text-sm font-normal">/ Manage your vendors</span>
        </h1>
      </div>
      <VendorTable />
    </DashboardLayout>
  )
}
