import { DashboardLayout } from "@/components/dashboard-layout"
import { PurchaseOrderOverviewCards } from "@/components/purchase-order-overview-cards"
import { PurchaseOrderTable } from "@/components/purchase-order-table"

export default function PurchaseOrderPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Purchase Order <span className="text-muted-foreground text-sm font-normal">/ Manage purchase orders</span>
        </h1>
      </div>
      <PurchaseOrderOverviewCards />
      <div className="h-4" />
      <PurchaseOrderTable />
    </DashboardLayout>
  )
}
