"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Field, FieldLabel, FieldContent, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { LoaderIcon } from "lucide-react"
import {
  createRole,
  updateRole,
  syncRolePermissions,
  fetchPermissions,
  type RoleInfo,
  type PermissionsGrouped,
} from "@/lib/user-admin-api"

interface RoleManagerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editItem?: RoleInfo | null
}

function RoleForm({
  editItem,
  onSuccess,
  onOpenChange,
  permissionsGrouped,
}: {
  editItem?: RoleInfo | null
  onSuccess: () => void
  onOpenChange: (open: boolean) => void
  permissionsGrouped: PermissionsGrouped
}) {
  const isEdit = !!editItem
  const [name, setName] = useState(editItem?.name ?? "")
  const [permissions, setPermissions] = useState<string[]>(editItem?.permissions ?? [])
  const [submitting, setSubmitting] = useState(false)

  function togglePermission(permission: string) {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Role name is required")
      return
    }
    setSubmitting(true)
    try {
      if (isEdit && editItem) {
        await updateRole(editItem.id, name.trim())
        await syncRolePermissions(editItem.id, permissions)
        toast.success("Role updated")
      } else {
        const newRole = await createRole(name.trim())
        if (permissions.length > 0) {
          await syncRolePermissions(newRole.id, permissions)
        }
        toast.success("Role created")
      }
      onSuccess()
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save role")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 pt-0">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="role-name">Role Name</FieldLabel>
          <FieldContent>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. editor, viewer"
              required
            />
          </FieldContent>
        </Field>
      </FieldGroup>

      <Separator />

      <p className="text-xs font-semibold text-muted-foreground uppercase">Permissions</p>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {Object.entries(permissionsGrouped).map(([group, perms]) => (
          <div key={group}>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">{group}</p>
            <div className="flex flex-wrap gap-1">
              {perms.map((p) => (
                <Button
                  key={p.name}
                  variant={permissions.includes(p.name) ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => togglePermission(p.name)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="button" disabled={submitting} onClick={handleSave}>
          {submitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}

export function RoleManagerSheet({ open, onOpenChange, onSuccess, editItem }: RoleManagerSheetProps) {
  const [permissionsGrouped, setPermissionsGrouped] = useState<PermissionsGrouped>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPermissions()
      .then((perms) => {
        setPermissionsGrouped(perms)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load permissions")
        setLoading(false)
      })
  }, [])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editItem ? "Edit Role" : "Create Role"}</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <LoaderIcon className="size-6 animate-spin" />
          </div>
        ) : (
          <RoleForm
            key={editItem?.id ?? "new"}
            editItem={editItem}
            onSuccess={onSuccess}
            onOpenChange={onOpenChange}
            permissionsGrouped={permissionsGrouped}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
