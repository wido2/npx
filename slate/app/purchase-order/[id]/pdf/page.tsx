import { PurchaseOrderPdfView } from "@/components/purchase-order-pdf-view"

export default async function POPdfPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return <PurchaseOrderPdfView poId={id} />
}
