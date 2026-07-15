import { DashboardLayout } from "@/components/dashboard-layout"
import { PurchaseOrderWizard } from "@/components/purchase-order-wizard"

export default async function EditPOPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return (
    <DashboardLayout>
      <PurchaseOrderWizard poId={id} />
    </DashboardLayout>
  )
}
