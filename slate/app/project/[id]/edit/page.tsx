import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectForm } from "@/components/project-form"

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return (
    <DashboardLayout>
      <ProjectForm projectId={id} />
    </DashboardLayout>
  )
}
