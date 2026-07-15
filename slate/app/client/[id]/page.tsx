import { DashboardLayout } from "@/components/dashboard-layout"
import { ClientDetail } from "@/components/client-detail"

export default async function ClientDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return (
    <DashboardLayout>
      <ClientDetail clientId={id} />
    </DashboardLayout>
  )
}
