import { PermintaanPembelianDetail } from "@/components/permintaan-pembelian-detail"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function PPDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return (
    <DashboardLayout>
      <PermintaanPembelianDetail ppId={id} />
    </DashboardLayout>
  )
}