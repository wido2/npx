import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Project {
  id: string
  kode: string
  nama: string
  client_id: string
  unit_id: string
  jumlah: number | null
  deskripsi: string | null
  nilai_kontrak: number | null
  tanggal_mulai: string | null
  tanggal_selesai: string | null
  status: string
  aktif: boolean
  created_at: string
  updated_at: string
  client?: { id: string; kode: string; nama: string }
  unit?: { id: string; nama: string }
}

interface PaginatedResponse {
  data: Project[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchProjects(params?: {
  page?: number
  per_page?: number
  search?: string
  client_id?: string
  sort_field?: string
  sort_dir?: string
}): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.per_page) searchParams.set("per_page", String(params.per_page))
  if (params?.search) searchParams.set("search", params.search)
  if (params?.client_id) searchParams.set("client_id", params.client_id)
  if (params?.sort_field) searchParams.set("sort_field", params.sort_field)
  if (params?.sort_dir) searchParams.set("sort_dir", params.sort_dir)

  const res = await authFetch(`${API_BASE}/project?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch projects (${res.status})`)
  return res.json()
}

export async function createProject(data: {
  kode: string
  nama: string
  client_id: string
  unit_id: string
  deskripsi?: string
  nilai_kontrak?: number
  jumlah?: number
  tanggal_mulai?: string
  tanggal_selesai?: string
  status?: string
  aktif?: boolean
}): Promise<Project> {
  const res = await authFetch(`${API_BASE}/project`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create project (${res.status})`)
  return res.json()
}

export async function updateProject(
  id: string,
  data: Partial<{
    kode: string
    nama: string
  client_id: string
  unit_id: string
  jumlah: number | null
    deskripsi: string
    nilai_kontrak: number
    tanggal_mulai: string
    tanggal_selesai: string
    status: string
    aktif: boolean
  }>
): Promise<Project> {
  const res = await authFetch(`${API_BASE}/project/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update project (${res.status})`)
  return res.json()
}

export async function deleteProject(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/project/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete project")
}

export async function bulkDeleteProjects(ids: string[]): Promise<void> {
  const res = await authFetch(`${API_BASE}/project/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error(`Failed to bulk delete projects (${res.status})`)
}

export async function fetchProject(id: string): Promise<Project> {
  const res = await authFetch(`${API_BASE}/project/${id}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch project (${res.status})`)
  return res.json()
}
