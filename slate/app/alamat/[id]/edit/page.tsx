import { DashboardLayout } from "@/components/dashboard-layout"
import { AlamatForm } from "@/components/alamat-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditAlamatPage({ params }: Props) {
  const { id } = await params
  return (
    <DashboardLayout>
      <AlamatForm alamatId={id} />
    </DashboardLayout>
  )
}
