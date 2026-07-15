import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectDetail } from "@/components/project-detail"

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return (
    <DashboardLayout>
      <ProjectDetail projectId={id} />
    </DashboardLayout>
  )
}
