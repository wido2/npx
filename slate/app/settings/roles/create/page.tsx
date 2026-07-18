"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RoleForm } from "@/components/role-form"

export default function CreateRolePage() {
  const { can, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !can("users.manage")) {
      router.replace("/settings/users")
    }
  }, [loading, can, router])

  if (loading || !can("users.manage")) return null

  return (
    <DashboardLayout>
      <RoleForm />
    </DashboardLayout>
  )
}
