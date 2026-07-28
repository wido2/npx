import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface PermintaanPembelian {
  id: string
  kode: string | null
  dibuat_oleh: string
  project_id: string | null
  client_id: string | null
  tanggal_diminta: string
  tanggal_diperlukan: string | null
  status: string
  catatan: string | null
  alasan_ditolak: string | null
  diverifikasi_oleh: string | null
  tanggal_diverifikasi: string | null
  created_at: string
  updated_at: string
  dibuat_oleh_user?: { id: string; name: string }
  diverifikasi_oleh_user?: { id: string; name: string } | null
  client?: { id: string; kode: string; nama: string } | null
  project?: { id: string; kode: string; nama: string } | null
  items?: PermintaanPembelianItem[]
  purchase_orders?: { id: string; kode: string; status: string }[]
}

export interface PermintaanPembelianItem {
  id: string
  permintaan_pembelian_id: string
  barang_id: string
  jumlah_diminta: number
  jumlah_disetujui: number | null
  catatan: string | null
  catatan_logistik: string | null
  created_at: string
  updated_at: string
  barang?: { id: string; kode: string; nama: string; vendor_id: string; vendor?: { id: string; nama: string } }
  purchase_order_item?: { id: string; purchase_order?: { id: string; kode: string; status: string } } | null
}

interface PaginatedResponse {
  data: PermintaanPembelian[]
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

export async function fetchPPs(params?: {
  page?: number
  per_page?: number
  search?: string
  status?: string
  date_from?: string
  date_to?: string
  sort_field?: string
  sort_dir?: string
}): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.per_page) searchParams.set("per_page", String(params.per_page))
  if (params?.search) searchParams.set("search", params.search)
  if (params?.status) searchParams.set("status", params.status)
  if (params?.date_from) searchParams.set("date_from", params.date_from)
  if (params?.date_to) searchParams.set("date_to", params.date_to)
  if (params?.sort_field) searchParams.set("sort_field", params.sort_field)
  if (params?.sort_dir) searchParams.set("sort_dir", params.sort_dir)

  const res = await authFetch(`${API_BASE}/permintaan-pembelian?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch PP (${res.status})`)
  return res.json()
}

export async function fetchPP(id: string): Promise<PermintaanPembelian> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/${id}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch PP (${res.status})`)
  return res.json()
}

export async function createPP(data: {
  project_id?: string
  client_id?: string
  tanggal_diminta: string
  tanggal_diperlukan?: string
  catatan?: string
}): Promise<PermintaanPembelian> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create PP (${res.status})`)
  return res.json()
}

export async function updatePP(
  id: string,
  data: Partial<{
    project_id: string
    client_id: string
    tanggal_diminta: string
    tanggal_diperlukan: string
    catatan: string
  }>
): Promise<PermintaanPembelian> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update PP (${res.status})`)
  return res.json()
}

export async function deletePP(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete PP")
}

export async function bulkDeletePPs(ids: string[]): Promise<void> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error("Failed to bulk delete PP(s)")
}

export async function kirimPP(id: string): Promise<PermintaanPembelian> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/${id}/kirim`, {
    method: "PUT",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to submit PP")
  return res.json()
}

export async function verifikasiPP(
  id: string,
  items: { id: string; jumlah_disetujui: number; catatan_logistik?: string }[]
): Promise<PermintaanPembelian> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/${id}/verifikasi`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ items }),
  })
  if (!res.ok) throw new Error("Failed to verify PP")
  return res.json()
}

export async function tolakPP(id: string, alasan_ditolak?: string): Promise<PermintaanPembelian> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/${id}/tolak`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ alasan_ditolak: alasan_ditolak || null }),
  })
  if (!res.ok) throw new Error("Failed to reject PP")
  return res.json()
}

export async function batalkanPP(id: string): Promise<PermintaanPembelian> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/${id}/batalkan`, {
    method: "PUT",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to cancel PP")
  return res.json()
}

export async function buatPOdariPP(
  ppId: string,
  data: {
    vendor_id: string
    tanggal_po?: string
    catatan?: string
    syarat_pembayaran?: string
    alamat_kirim?: string
    diskon?: number
    items: {
      pp_item_id?: string
      barang_id?: string
      jumlah: number
      harga_satuan?: number
      diskon?: number
      jenis_pajak_id?: string
      keterangan?: string
    }[]
  }
): Promise<any> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/${ppId}/buat-po`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create PO from PP")
  return res.json()
}

export async function fetchPPItems(ppId: string): Promise<PermintaanPembelianItem[]> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/${ppId}/items`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch PP items (${res.status})`)
  return res.json()
}

export async function createPPItem(
  ppId: string,
  data: { barang_id: string; jumlah_diminta: number; catatan?: string }
): Promise<PermintaanPembelianItem> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/${ppId}/items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create PP item")
  return res.json()
}

export async function updatePPItem(
  ppId: string,
  itemId: string,
  data: Partial<{ barang_id: string; jumlah_diminta: number; catatan: string }>
): Promise<PermintaanPembelianItem> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/${ppId}/items/${itemId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update PP item")
  return res.json()
}

export async function deletePPItem(ppId: string, itemId: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/permintaan-pembelian/${ppId}/items/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete PP item")
}