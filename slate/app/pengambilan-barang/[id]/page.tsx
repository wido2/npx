import { DashboardLayout } from "@/components/dashboard-layout"
import { PengambilanBarangDetail } from "@/components/pengambilan-barang-detail"

export default async function PBDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return (
    <DashboardLayout>
      <PengambilanBarangDetail pbId={id} />
    </DashboardLayout>
  )
}
