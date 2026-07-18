"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectForm } from "@/components/project-form"

export default function CreateProjectPage() {
  const { can, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !can("master.project.create")) {
      router.replace("/project")
    }
  }, [loading, can, router])

  if (loading || !can("master.project.create")) return null

  return (
    <DashboardLayout>
      <ProjectForm />
    </DashboardLayout>
  )
}
