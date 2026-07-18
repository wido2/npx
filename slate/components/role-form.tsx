"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  createRole,
  updateRole,
  syncRolePermissions,
  fetchPermissions,
  fetchRole,
  type PermissionsGrouped,
} from "@/lib/user-admin-api"
import { ArrowLeftIcon, LoaderIcon, SaveIcon, ShieldIcon } from "lucide-react"

interface Props {
  roleId?: number
}

interface PermItem {
  name: string
  label: string
}

interface SubGroup {
  key: string
  label: string | null
  items: PermItem[]
}

const CORE_ROLES = ["super_admin", "manager", "user"]

function humanize(text: string): string {
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function categorize(perms: PermItem[]): SubGroup[] {
  const map = new Map<string, PermItem[]>()

  for (const p of perms) {
    const parts = p.name.split(".")
    const entity = parts.length >= 3 ? parts[1] : "__root"
    if (!map.has(entity)) map.set(entity, [])
    map.get(entity)!.push(p)
  }

  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: key === "__root" ? null : humanize(key),
    items,
  }))
}

export function RoleForm({ roleId }: Props) {
  const router = useRouter()
  const isEdit = !!roleId
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [isCoreRole, setIsCoreRole] = useState(false)
  const [permissions, setPermissions] = useState<string[]>([])
  const [permissionsGrouped, setPermissionsGrouped] = useState<PermissionsGrouped>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const perms = await fetchPermissions()
      setPermissionsGrouped(perms)

      if (isEdit && roleId) {
        const role = await fetchRole(roleId)
        setName(role.name)
        setPermissions(role.permissions)
        setIsCoreRole(CORE_ROLES.includes(role.name))
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load data")
      router.push("/settings/users")
    } finally {
      setLoading(false)
    }
  }, [isEdit, roleId, router])

  useEffect(() => {
    load()
  }, [load])

  const allPermNames = useMemo(
    () => Object.values(permissionsGrouped).flat().map((p) => p.name),
    [permissionsGrouped]
  )

  const totalCount = allPermNames.length
  const selectedCount = permissions.length

  function toggle(name: string) {
    setPermissions((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    )
  }

  function setMany(names: string[], checked: boolean) {
    setPermissions((prev) => {
      if (checked) return Array.from(new Set([...prev, ...names]))
      return prev.filter((p) => !names.includes(p))
    })
  }

  function toggleAll(checked: boolean) {
    setPermissions(checked ? [...allPermNames] : [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Nama role wajib diisi")
      return
    }
    setSubmitting(true)
    try {
      if (isEdit && roleId) {
        if (!isCoreRole) {
          await updateRole(roleId, name.trim())
        }
        await syncRolePermissions(roleId, permissions)
        toast.success("Role diperbarui")
      } else {
        await createRole(name.trim(), permissions)
        toast.success("Role dibuat")
      }
      router.push("/settings/users")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan role")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => router.push("/settings/users")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Role" : "Buat Role"}</h1>
          <p className="text-muted-foreground">
            {isEdit ? "Perbarui nama role dan hak aksesnya" : "Buat role baru beserta hak aksesnya"}
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/settings/users")}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            <SaveIcon /> {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Role</CardTitle>
          <CardDescription>Nama role digunakan untuk mengelompokkan hak akses pengguna.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="role-name">Nama Role *</FieldLabel>
              <FieldContent>
                <Input
                  id="role-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="contoh: editor, viewer, logistik"
                  disabled={isCoreRole}
                  required
                />
                {isCoreRole && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Role bawaan tidak dapat diganti namanya, tetapi hak aksesnya masih bisa diatur.
                  </p>
                )}
              </FieldContent>
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldIcon className="size-4" /> Hak Akses
            </CardTitle>
            <CardDescription>Pilih hak akses per kategori.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{selectedCount} / {totalCount}</Badge>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={totalCount > 0 && selectedCount === totalCount}
                onCheckedChange={(v) => toggleAll(!!v)}
              />
              <span>Pilih Semua</span>
            </label>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Object.entries(permissionsGrouped).map(([group, perms]) => {
          const groupNames = perms.map((p) => p.name)
          const groupSelected = groupNames.filter((n) => permissions.includes(n)).length
          const groupAll = groupSelected === groupNames.length && groupNames.length > 0
          const subGroups = categorize(perms)

          return (
            <Card key={group} className="flex flex-col">
              <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 border-b">
                <div>
                  <CardTitle className="text-base">{group}</CardTitle>
                  <CardDescription>{groupSelected} dari {groupNames.length} dipilih</CardDescription>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    checked={groupAll}
                    onCheckedChange={(v) => setMany(groupNames, !!v)}
                  />
                  <span>Semua</span>
                </label>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pt-4">
                {subGroups.map((sub) => {
                  const subNames = sub.items.map((i) => i.name)
                  const subAll = subNames.every((n) => permissions.includes(n))
                  return (
                    <div key={sub.key} className="space-y-2">
                      {sub.label && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {sub.label}
                          </p>
                          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Checkbox
                              className="size-3.5"
                              checked={subAll}
                              onCheckedChange={(v) => setMany(subNames, !!v)}
                            />
                            <span>Semua</span>
                          </label>
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {sub.items.map((p) => {
                          const active = permissions.includes(p.name)
                          return (
                            <label
                              key={p.name}
                              className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${
                                active
                                  ? "border-primary/40 bg-primary/5"
                                  : "border-transparent hover:bg-muted/50"
                              }`}
                            >
                              <Checkbox checked={active} onCheckedChange={() => toggle(p.name)} />
                              <span className="truncate">{p.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end gap-2 sm:hidden">
        <Button type="button" variant="outline" onClick={() => router.push("/settings/users")}>
          Batal
        </Button>
        <Button type="submit" disabled={submitting}>
          <SaveIcon /> {submitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  )
}
