import { DashboardLayout } from "@/components/dashboard-layout"
import { InventoryTabs } from "@/components/inventory-tabs"

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Inventory <span className="text-muted-foreground text-sm font-normal">/ Stock management</span>
        </h1>
      </div>
      <InventoryTabs />
    </DashboardLayout>
  )
}
