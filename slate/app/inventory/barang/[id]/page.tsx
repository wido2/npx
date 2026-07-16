import { DashboardLayout } from "@/components/dashboard-layout"
import { InventoryBarangHistory } from "@/components/inventory-barang-history"

export default async function InventoryBarangPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <DashboardLayout>
      <InventoryBarangHistory barangId={id} />
    </DashboardLayout>
  )
}
