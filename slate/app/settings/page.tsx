import { DashboardLayout } from "@/components/dashboard-layout"
import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Settings <span className="text-muted-foreground text-sm font-normal">/ Manage application settings</span>
        </h1>
      </div>
      <SettingsForm />
    </DashboardLayout>
  )
}
