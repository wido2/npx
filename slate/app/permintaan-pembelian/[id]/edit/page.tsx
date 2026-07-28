import { DashboardLayout } from "@/components/dashboard-layout"
import { PermintaanPembelianWizard } from "@/components/permintaan-pembelian-wizard"

export default async function EditPPPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Edit Permintaan Pembelian</h1>
        <PermintaanPembelianWizard ppId={id} />
      </div>
    </DashboardLayout>
  )
}