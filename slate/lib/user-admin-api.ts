import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export interface ManagedUser {
  id: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
  created_at: string
}

export interface RoleInfo {
  id: number
  name: string
  permissions: string[]
}

export interface PermissionsGrouped {
  [group: string]: { name: string; label: string }[]
}

export async function fetchUsers(): Promise<ManagedUser[]> {
  const res = await authFetch(`${API_BASE}/users`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export async function updateUser(id: string, data: Partial<ManagedUser>): Promise<ManagedUser> {
  const res = await authFetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to update user" }))
    throw new Error(err.message)
  }
  return res.json()
}

export async function deleteUser(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to delete user" }))
    throw new Error(err.message)
  }
}

export async function syncUserRoles(id: string, roles: string[]): Promise<ManagedUser> {
  const res = await authFetch(`${API_BASE}/users/${id}/roles`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ roles }),
  })
  if (!res.ok) throw new Error("Failed to sync roles")
  return res.json()
}

export async function syncUserPermissions(id: string, permissions: string[]): Promise<ManagedUser> {
  const res = await authFetch(`${API_BASE}/users/${id}/permissions`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ permissions }),
  })
  if (!res.ok) throw new Error("Failed to sync permissions")
  return res.json()
}

export async function fetchRoles(): Promise<RoleInfo[]> {
  const res = await authFetch(`${API_BASE}/roles`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch roles")
  return res.json()
}

export async function syncRolePermissions(roleId: number, permissions: string[]): Promise<RoleInfo> {
  const res = await authFetch(`${API_BASE}/roles/${roleId}/permissions`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ permissions }),
  })
  if (!res.ok) throw new Error("Failed to sync role permissions")
  return res.json()
}

export async function fetchPermissions(): Promise<PermissionsGrouped> {
  const res = await authFetch(`${API_BASE}/permissions`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch permissions")
  return res.json()
}

export async function createRole(name: string, permissions: string[] = []): Promise<RoleInfo> {
  const res = await authFetch(`${API_BASE}/roles`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, permissions }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to create role" }))
    throw new Error(err.message)
  }
  return res.json()
}

export async function fetchRole(roleId: number): Promise<RoleInfo> {
  const roles = await fetchRoles()
  const role = roles.find((r) => r.id === roleId)
  if (!role) throw new Error("Role not found")
  return role
}

export async function updateRole(roleId: number, name: string): Promise<RoleInfo> {
  const res = await authFetch(`${API_BASE}/roles/${roleId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to update role" }))
    throw new Error(err.message)
  }
  return res.json()
}

export async function deleteRole(roleId: number): Promise<void> {
  const res = await authFetch(`${API_BASE}/roles/${roleId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to delete role" }))
    throw new Error(err.message)
  }
}
