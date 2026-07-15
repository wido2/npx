import { DashboardLayout } from "@/components/dashboard-layout"
import { ClientForm } from "@/components/client-form"

export default async function EditClientPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return (
    <DashboardLayout>
      <ClientForm clientId={id} />
    </DashboardLayout>
  )
}
