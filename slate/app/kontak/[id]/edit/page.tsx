import { DashboardLayout } from "@/components/dashboard-layout"
import { KontakForm } from "@/components/kontak-form"

export default async function EditKontakPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return (
    <DashboardLayout>
      <KontakForm kontakId={id} />
    </DashboardLayout>
  )
}
