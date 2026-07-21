import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface ItemPembelianLangsung {
  id: string
  pembelian_langsung_id: string
  barang_id: string
  jumlah: number
  harga_satuan: number
  keterangan: string | null
  created_at: string
  updated_at: string
  barang?: { id: string; kode: string; nama: string }
}

export interface Attachment {
  id: string
  pembelian_langsung_id: string
  nama_file: string
  path: string
  mime_type: string | null
  ukuran: number | null
  created_at: string
  url: string
}

export interface PembelianLangsung {
  id: string
  kode: string
  vendor_id: string
  karyawan_id: string | null
  tanggal: string
  catatan: string | null
  created_by: string
  created_at: string
  updated_at: string
  items_count?: number
  vendor?: { id: string; kode: string; nama: string }
  karyawan?: { id: string; nama: string } | null
  items?: ItemPembelianLangsung[]
  attachments?: Attachment[]
  dibuat_oleh_user?: { id: string; name: string }
}

interface PaginatedResponse {
  data: PembelianLangsung[]
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

export async function fetchPembelianLangsungs(params?: {
  page?: number
  per_page?: number
  search?: string
  sort_field?: string
  sort_dir?: string
  date_from?: string
  date_to?: string
}): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.per_page) searchParams.set("per_page", String(params.per_page))
  if (params?.search) searchParams.set("search", params.search)
  if (params?.sort_field) searchParams.set("sort_field", params.sort_field)
  if (params?.sort_dir) searchParams.set("sort_dir", params.sort_dir)
  if (params?.date_from) searchParams.set("date_from", params.date_from)
  if (params?.date_to) searchParams.set("date_to", params.date_to)

  const res = await authFetch(`${API_BASE}/pembelian-langsung?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch pembelian langsung (${res.status})`)
  return res.json()
}

export async function fetchPembelianLangsung(id: string): Promise<PembelianLangsung> {
  const res = await authFetch(`${API_BASE}/pembelian-langsung/${id}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch pembelian langsung (${res.status})`)
  return res.json()
}

export async function createPembelianLangsung(data: {
  vendor_id: string
  karyawan_id?: string | null
  tanggal: string
  catatan?: string
  items: { barang_id: string; jumlah: number; harga_satuan: number; keterangan?: string }[]
  attachments?: File[]
}): Promise<PembelianLangsung> {
  const formData = new FormData()
  formData.append("vendor_id", data.vendor_id)
  if (data.karyawan_id) formData.append("karyawan_id", data.karyawan_id)
  formData.append("tanggal", data.tanggal)
  if (data.catatan) formData.append("catatan", data.catatan)
  formData.append("items", JSON.stringify(data.items))

  if (data.attachments) {
    for (const file of data.attachments) {
      formData.append("attachments[]", file)
    }
  }

  const token = getToken()
  const res = await authFetch(`${API_BASE}/pembelian-langsung`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })
  if (!res.ok) throw new Error(`Failed to create pembelian langsung (${res.status})`)
  return res.json()
}

export async function updatePembelianLangsung(
  id: string,
  data: {
    vendor_id?: string
    karyawan_id?: string | null
    tanggal?: string
    catatan?: string | null
    items?: { barang_id: string; jumlah: number; harga_satuan: number; keterangan?: string }[]
    attachments?: File[]
  },
): Promise<PembelianLangsung> {
  const formData = new FormData()
  formData.append("_method", "PUT")
  if (data.vendor_id) formData.append("vendor_id", data.vendor_id)
  formData.append("karyawan_id", data.karyawan_id ?? "")
  if (data.tanggal) formData.append("tanggal", data.tanggal)
  formData.append("catatan", data.catatan ?? "")
  if (data.items) formData.append("items", JSON.stringify(data.items))

  if (data.attachments) {
    for (const file of data.attachments) {
      formData.append("attachments[]", file)
    }
  }

  const token = getToken()
  const res = await authFetch(`${API_BASE}/pembelian-langsung/${id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })
  if (!res.ok) throw new Error(`Failed to update pembelian langsung (${res.status})`)
  return res.json()
}

export async function deletePembelianLangsung(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/pembelian-langsung/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete pembelian langsung")
}

export async function deletePembelianLangsungAttachment(plId: string, attachmentId: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/pembelian-langsung/${plId}/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete attachment")
}
