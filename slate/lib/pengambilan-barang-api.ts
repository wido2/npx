import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface ItemPengambilanBarang {
  id: string
  pengambilan_barang_id: string
  barang_id: string
  jumlah: number
  keterangan: string | null
  created_at: string
  updated_at: string
  barang?: { id: string; kode: string; nama: string; stok: number }
}

export interface PengambilanBarang {
  id: string
  kode: string
  tanggal_pengambilan: string
  client_id: string | null
  project_id: string | null
  karyawan_id: string | null
  keterangan: string | null
  created_by: string
  created_at: string
  updated_at: string
  items_count?: number
  client?: { id: string; kode: string; nama: string }
  project?: { id: string; kode: string; nama: string }
  karyawan?: { id: string; nama: string }
  dibuat_oleh_user?: { id: string; name: string }
  items?: ItemPengambilanBarang[]
}

interface PaginatedResponse {
  data: PengambilanBarang[]
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

export async function fetchPengambilanBarangs(params?: {
  page?: number
  per_page?: number
  search?: string
  sort_field?: string
  sort_dir?: string
}): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.per_page) searchParams.set("per_page", String(params.per_page))
  if (params?.search) searchParams.set("search", params.search)
  if (params?.sort_field) searchParams.set("sort_field", params.sort_field)
  if (params?.sort_dir) searchParams.set("sort_dir", params.sort_dir)

  const res = await authFetch(`${API_BASE}/pengambilan-barang?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch pengambilan barang (${res.status})`)
  return res.json()
}

export async function fetchPengambilanBarang(id: string): Promise<PengambilanBarang> {
  const res = await authFetch(`${API_BASE}/pengambilan-barang/${id}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch pengambilan barang (${res.status})`)
  return res.json()
}

export async function createPengambilanBarang(data: {
  tanggal_pengambilan: string
  client_id?: string
  project_id?: string
  karyawan_id?: string
  keterangan?: string
  items: { barang_id: string; jumlah: number; keterangan?: string }[]
}): Promise<PengambilanBarang> {
  const res = await authFetch(`${API_BASE}/pengambilan-barang`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create pengambilan barang (${res.status})`)
  return res.json()
}

export async function deletePengambilanBarang(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/pengambilan-barang/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete pengambilan barang")
}

export async function bulkDeletePengambilanBarangs(ids: string[]): Promise<void> {
  const res = await authFetch(`${API_BASE}/pengambilan-barang/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error(`Failed to bulk delete pengambilan barang (${res.status})`)
}

export async function fetchPengambilanBarangPdf(id: string): Promise<Blob> {
  const token = getToken()
  const res = await authFetch(`${API_BASE}/pengambilan-barang/${id}/pdf`, {
    headers: {
      Accept: "application/pdf",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) throw new Error(`Failed to fetch PB PDF (${res.status})`)
  return res.blob()
}
