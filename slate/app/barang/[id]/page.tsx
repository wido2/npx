import { DashboardLayout } from "@/components/dashboard-layout"
import { BarangDetail } from "@/components/barang-detail"

export default async function BarangDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return (
    <DashboardLayout>
      <BarangDetail barangId={id} />
    </DashboardLayout>
  )
}
