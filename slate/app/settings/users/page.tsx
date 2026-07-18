"use client"

import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  fetchUsers,
  fetchRoles,
  fetchPermissions,
  syncUserRoles,
  syncRolePermissions,
  deleteUser,
  deleteRole,
  type ManagedUser,
  type RoleInfo,
  type PermissionsGrouped,
} from "@/lib/user-admin-api"
import { useAuth } from "@/lib/auth-context"
import { getToken } from "@/lib/api"
import {
  LoaderIcon,
  Trash2Icon,
  ShieldIcon,
  UserPlusIcon,
  PlusIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    super_admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    user: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  }
  return (
    <Badge variant="outline" className={colors[role] ?? "bg-gray-100 text-gray-800"}>
      {role}
    </Badge>
  )
}

function UserRoleEditor({ userId, currentRoles, onClose }: { userId: string; currentRoles: string[]; onClose: () => void }) {
  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles)
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [permissionsGrouped, setPermissionsGrouped] = useState<PermissionsGrouped>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchRoles(), fetchPermissions()]).then(([r, p]) => {
      setRoles(r)
      setPermissionsGrouped(p)
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    try {
      await syncUserRoles(userId, selectedRoles)
      toast.success("Roles updated")
      onClose()
    } catch {
      toast.error("Failed to update roles")
    }
  }

  async function handleRolePermissionToggle(permission: string) {
    if (!selectedRoleId) return
    const role = roles.find((r) => r.id === selectedRoleId)
    if (!role) return
    const updated = role.permissions.includes(permission)
      ? role.permissions.filter((p) => p !== permission)
      : [...role.permissions, permission]
    await syncRolePermissions(selectedRoleId, updated)
    const fresh = await fetchRoles()
    setRoles(fresh)
    toast.success("Role permissions updated")
  }

  if (loading) return <div className="flex justify-center p-8"><LoaderIcon className="size-6 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold mb-2">Assign Roles</h4>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <Button
              key={r.id}
              variant={selectedRoles.includes(r.name) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedRoles((prev) =>
                  prev.includes(r.name) ? prev.filter((n) => n !== r.name) : [...prev, r.name]
                )
              }}
            >
              {r.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Edit Role Permissions</h4>
        <div className="flex flex-wrap gap-1 mb-3">
          {roles.map((r) => (
            <Button
              key={r.id}
              variant={selectedRoleId === r.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedRoleId(r.id)}
            >
              {r.name}
            </Button>
          ))}
        </div>
        {selectedRoleId && (
          <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
            {Object.entries(permissionsGrouped).map(([group, perms]) => (
              <div key={group}>
                <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">{group}</h5>
                <div className="flex flex-wrap gap-1">
                  {perms.map((p) => {
                    const role = roles.find((r) => r.id === selectedRoleId)
                    const active = role?.permissions.includes(p.name) ?? false
                    return (
                      <Button
                        key={p.name}
                        variant={active ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-6"
                        onClick={() => handleRolePermissionToggle(p.name)}
                      >
                        {p.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Roles</Button>
      </div>
    </div>
  )
}

function CreateUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [roleOptions, setRoleOptions] = useState<RoleInfo[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setRole("")
      fetchRoles().then(setRoleOptions).catch(() => {})
    }
  }, [open])

  async function handleCreate() {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, email, password, role }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || Object.values(err.errors || {}).flat().join(", "))
      }
      toast.success("User created")
      router.refresh()
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create User</AlertDialogTitle>
        </AlertDialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Role</FieldLabel>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="" disabled>Pilih role...</option>
              {roleOptions.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </Field>
        </FieldGroup>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={loading || !role} onClick={handleCreate}>
            {loading ? "Creating..." : "Create"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function UsersPage() {
  const { can } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null)

  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<RoleInfo | null>(null)

  const load = useCallback(async () => {
    try {
      const u = await fetchUsers()
      setUsers(u)
    } catch {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const loadRoles = useCallback(async () => {
    try {
      const r = await fetchRoles()
      setRoles(r)
    } catch {
      toast.error("Failed to load roles")
    } finally {
      setRolesLoading(false)
    }
  }, [])

  useEffect(() => { loadRoles() }, [loadRoles])

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteUser(deleteTarget.id)
      toast.success("User deleted")
      setDeleteTarget(null)
      load()
    } catch {
      toast.error("Failed to delete user")
    }
  }

  async function handleDeleteRole() {
    if (!deleteRoleTarget) return
    try {
      await deleteRole(deleteRoleTarget.id)
      toast.success("Role deleted")
      setDeleteRoleTarget(null)
      loadRoles()
    } catch {
      toast.error("Failed to delete role")
    }
  }

  if (!can("users.view")) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground py-20">You do not have permission to view this page.</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Settings <span className="text-muted-foreground text-sm font-normal">/ Manage user accounts, roles, and permissions</span>
            </h1>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Role Manager</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Users</h2>
            {can("users.manage") && (
              <Button onClick={() => setCreating(true)}>
                <UserPlusIcon className="mr-2 size-4" />
                Add User
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center"><LoaderIcon className="size-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : users.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No users found</TableCell></TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {u.roles.map((r) => <RoleBadge key={r} role={r} />)}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {u.permissions.length} permission(s)
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setEditingUserId(u.id)}>
                              <ShieldIcon className="size-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(u)}>
                              <Trash2Icon className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Role Manager</h2>
            {can("users.manage") && (
              <Button onClick={() => router.push("/settings/roles/create")}>
                <PlusIcon className="mr-2 size-4" />
                Create Role
              </Button>
            )}
          </div>

          {rolesLoading ? (
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
                    <CardTitle className="text-base capitalize">{role.name.replace(/_/g, " ")}</CardTitle>
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
                        onClick={() => setDeleteRoleTarget(role)}
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
        </TabsContent>
      </Tabs>

      {editingUserId && (
        <AlertDialog open={true} onOpenChange={() => setEditingUserId(null)}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Edit User Roles & Permissions</AlertDialogTitle>
            </AlertDialogHeader>
            <UserRoleEditor
              userId={editingUserId}
              currentRoles={users.find((u) => u.id === editingUserId)?.roles ?? []}
              onClose={() => { setEditingUserId(null); load() }}
            />
          </AlertDialogContent>
        </AlertDialog>
      )}

      <CreateUserDialog open={creating} onClose={() => { setCreating(false); load() }} />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteTarget?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteRoleTarget} onOpenChange={() => setDeleteRoleTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the role &ldquo;{deleteRoleTarget?.name}&rdquo;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
