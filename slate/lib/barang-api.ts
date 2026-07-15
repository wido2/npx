import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Kategori {
  id: string
  nama: string
}

export interface Unit {
  id: string
  nama: string
  singkatan: string
}

export interface Barang {
  id: string
  kode: string
  nama: string
  deskripsi: string | null
  stok: number
  stok_minimum: number
  harga_beli: number | null
  harga_jual: number | null
  gambar: string | null
  keterangan: string | null
  aktif: boolean
  kategori_id: string | null
  kategori_barang_id: string | null
  unit_id: string | null
  vendor_id: string | null
  created_at: string
  updated_at: string
  kategori?: Kategori
  unit?: Unit
  vendor?: { id: string; kode: string; nama: string }
}

interface PaginatedResponse {
  data: Barang[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface KategoriResponse {
  data: Kategori[]
}

interface UnitResponse {
  data: Unit[]
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchBarangs(params?: {
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

  const res = await authFetch(`${API_BASE}/barang?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch barangs (${res.status})`)
  return res.json()
}

export async function fetchCategories(): Promise<Kategori[]> {
  const res = await authFetch(`${API_BASE}/kategori`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch categories (${res.status})`)
  const json: KategoriResponse = await res.json()
  return json.data
}

export async function createCategory(nama: string): Promise<Kategori> {
  const res = await authFetch(`${API_BASE}/kategori`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ nama }),
  })
  if (!res.ok) throw new Error(`Failed to create category (${res.status})`)
  return res.json()
}

export async function fetchUnits(): Promise<Unit[]> {
  const res = await authFetch(`${API_BASE}/unit`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch units (${res.status})`)
  const json: UnitResponse = await res.json()
  return json.data
}

export async function createUnit(nama: string, singkatan: string): Promise<Unit> {
  const res = await authFetch(`${API_BASE}/unit`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ nama, singkatan }),
  })
  if (!res.ok) throw new Error(`Failed to create unit (${res.status})`)
  return res.json()
}

export async function createBarang(data: {
  kode: string
  nama: string
  deskripsi?: string
  kategori_id?: string
  unit_id?: string
  harga_beli?: number
  stok?: number
  stok_minimum?: number
  gambar?: string
  aktif?: boolean
}): Promise<Barang> {
  const res = await authFetch(`${API_BASE}/barang`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create barang (${res.status})`)
  return res.json()
}

export async function updateBarang(
  id: string,
  data: Partial<{
    kode: string
    nama: string
    deskripsi: string
    kategori_id: string
    unit_id: string
    harga_beli: number
    stok: number
    stok_minimum: number
    gambar: string
    aktif: boolean
  }>
): Promise<Barang> {
  const res = await authFetch(`${API_BASE}/barang/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update barang (${res.status})`)
  return res.json()
}

export async function deleteBarang(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/barang/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete barang")
}

export async function bulkDeleteBarangs(ids: string[]): Promise<void> {
  const res = await authFetch(`${API_BASE}/barang/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error(`Failed to bulk delete barangs (${res.status})`)
}
