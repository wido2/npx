import { DashboardLayout } from "@/components/dashboard-layout"
import { PurchaseOrderDetail } from "@/components/purchase-order-detail"

export default async function PODetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return (
    <DashboardLayout>
      <PurchaseOrderDetail poId={id} />
    </DashboardLayout>
  )
}
