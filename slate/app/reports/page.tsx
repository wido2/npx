import { DashboardLayout } from "@/components/dashboard-layout"
import { ReportCards } from "@/components/report-cards"

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Reports <span className="text-muted-foreground text-sm font-normal">/ Purchase order reports and analytics</span>
        </h1>
      </div>
      <ReportCards />
    </DashboardLayout>
  )
}
