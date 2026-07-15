import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectTable } from "@/components/project-table"

export default function ProjectPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Project <span className="text-muted-foreground text-sm font-normal">/ Manage your projects</span>
        </h1>
      </div>
      <ProjectTable />
    </DashboardLayout>
  )
}
