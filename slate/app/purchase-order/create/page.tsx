import { DashboardLayout } from "@/components/dashboard-layout"
import { PurchaseOrderWizard } from "@/components/purchase-order-wizard"

export default function CreatePOPage() {
  return (
    <DashboardLayout>
      <PurchaseOrderWizard />
    </DashboardLayout>
  )
}
