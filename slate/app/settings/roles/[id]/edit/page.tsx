"use client"

import { use, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RoleForm } from "@/components/role-form"

export default function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
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
      <RoleForm roleId={Number(id)} />
    </DashboardLayout>
  )
}
