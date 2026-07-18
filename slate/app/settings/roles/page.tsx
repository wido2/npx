"use client"

import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { toast } from "sonner"
import { fetchRoles, deleteRole, type RoleInfo } from "@/lib/user-admin-api"
import { useAuth } from "@/lib/auth-context"
import { LoaderIcon, Trash2Icon, PlusIcon, ShieldIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function RolesPage() {
  const { can, loading: authLoading } = useAuth()
  const router = useRouter()
  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<RoleInfo | null>(null)

  const loadRoles = useCallback(async () => {
    try {
      const r = await fetchRoles()
      setRoles(r)
    } catch {
      toast.error("Failed to load roles")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRoles() }, [loadRoles])

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteRole(deleteTarget.id)
      toast.success("Role deleted")
      setDeleteTarget(null)
      loadRoles()
    } catch {
      toast.error("Failed to delete role")
    }
  }

  if (authLoading || !can("users.view")) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground py-20">
          You do not have permission to view this page.
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Roles <span className="text-muted-foreground text-sm font-normal">/ Manage roles and permissions</span>
            </h1>
          </div>
          {can("users.manage") && (
            <Button onClick={() => router.push("/settings/roles/create")}>
              <PlusIcon className="mr-2 size-4" />
              Create Role
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : roles.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center text-muted-foreground">
            No roles found. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldIcon className="size-4" />
                  {role.name.replace(/_/g, " ")}
                </CardTitle>
                <CardDescription>{role.permissions.length} permission(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3">
                  {role.permissions.slice(0, 6).map((p) => (
                    <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                  ))}
                  {role.permissions.length > 6 && (
                    <Badge variant="outline" className="text-[10px]">+{role.permissions.length - 6}</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/settings/roles/${role.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(role)}
                    className="text-destructive"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the role &ldquo;{deleteTarget?.name}&rdquo;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}