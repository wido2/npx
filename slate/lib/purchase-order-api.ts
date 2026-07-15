import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface PurchaseOrder {
  id: string
  kode: string | null
  vendor_id: string
  client_id: string | null
  project_id: string | null
  tanggal_po: string
  tanggal_kirim_expected: string | null
  status: string
  subtotal: number
  diskon: number
  total: number
  catatan: string | null
  syarat_pembayaran: string | null
  alamat_kirim: string | null
  dibuat_oleh: string
  disetujui_oleh: string | null
  diterima_oleh: string | null
  tanggal_disetujui: string | null
  tanggal_diterima: string | null
  created_at: string
  updated_at: string
  vendor?: { id: string; kode: string; nama: string }
  client?: { id: string; kode: string; nama: string }
  project?: { id: string; kode: string; nama: string }
  dibuat_oleh_user?: { id: string; name: string }
  disetujui_oleh_user?: { id: string; name: string } | null
  diterima_oleh_user?: { id: string; name: string } | null
  items?: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  display_type: "section" | "note" | null
  urutan: number
  barang_id: string | null
  jumlah: number
  harga_satuan: number
  diskon: number
  subtotal: number
  jenis_pajak_id: string | null
  nilai_pajak: number
  total_setelah_pajak: number
  keterangan: string | null
  created_at: string
  updated_at: string
  barang?: { id: string; kode: string; nama: string }
  jenis_pajak?: { id: string; nama: string; persentase: number }
}

interface PaginatedResponse {
  data: PurchaseOrder[]
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

export async function fetchPurchaseOrders(params?: {
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

  const res = await authFetch(`${API_BASE}/purchase-order?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch purchase orders (${res.status})`)
  return res.json()
}

export async function fetchPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const res = await authFetch(`${API_BASE}/purchase-order/${id}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch purchase order (${res.status})`)
  return res.json()
}

export async function createPurchaseOrder(data: {
  vendor_id: string
  client_id?: string
  project_id?: string
  tanggal_po: string
  tanggal_kirim_expected?: string
  catatan?: string
  syarat_pembayaran?: string
  alamat_kirim?: string
}): Promise<PurchaseOrder> {
  const res = await authFetch(`${API_BASE}/purchase-order`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create purchase order (${res.status})`)
  return res.json()
}

export interface UpdatePOItem {
  id?: string
  barang_id: string
  jumlah: number
  harga_satuan: number
  diskon?: number
  jenis_pajak_id?: string
  keterangan?: string
}

export async function updatePurchaseOrder(
  id: string,
  data: Partial<{
    vendor_id: string
    client_id: string
    project_id: string
    tanggal_po: string
    tanggal_kirim_expected: string
    catatan: string
    syarat_pembayaran: string
    alamat_kirim: string
    items: UpdatePOItem[]
  }>
): Promise<PurchaseOrder> {
  const res = await authFetch(`${API_BASE}/purchase-order/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update purchase order (${res.status})`)
  return res.json()
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/purchase-order/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete purchase order")
}

export async function bulkDeletePurchaseOrders(ids: string[]): Promise<void> {
  const res = await authFetch(`${API_BASE}/purchase-order/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error(`Failed to bulk delete purchase orders (${res.status})`)
}

export async function kirimPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const res = await authFetch(`${API_BASE}/purchase-order/${id}/kirim`, {
    method: "PUT",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to submit purchase order (${res.status})`)
  return res.json()
}

export async function setujuiPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const res = await authFetch(`${API_BASE}/purchase-order/${id}/setujui`, {
    method: "PUT",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to approve purchase order (${res.status})`)
  return res.json()
}

export async function terimaPurchaseOrder(
  id: string,
  items: { purchase_order_item_id: string; jumlah_diterima: number; keterangan?: string }[]
): Promise<PurchaseOrder> {
  const res = await authFetch(`${API_BASE}/purchase-order/${id}/terima`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ items }),
  })
  if (!res.ok) throw new Error(`Failed to receive purchase order (${res.status})`)
  return res.json()
}

export interface POStats {
  total_bulan_ini: number
  total_nilai_bulan_ini: number
  total_disetujui_bulan_ini: number
  total_nilai_disetujui_bulan_ini: number
  draft: number
  draft_nilai: number
  dikirim: number
  dikirim_nilai: number
  disetujui: number
  disetujui_nilai: number
  diterima: number
  diterima_nilai: number
  diterima_sebagian: number
  diterima_sebagian_nilai: number
  dibatalkan: number
  dibatalkan_nilai: number
}

export interface DailyPOValue {
  date: string
  disetujui: number
  pending: number
}

export async function fetchPurchaseOrderDaily(dateFrom: string, dateTo: string): Promise<DailyPOValue[]> {
  const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo })
  const res = await authFetch(`${API_BASE}/reports/purchase-order/per-hari?${params}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch daily PO data (${res.status})`)
  return res.json()
}

export async function fetchPurchaseOrderStats(): Promise<POStats> {
  const res = await authFetch(`${API_BASE}/purchase-order/stats`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch PO stats (${res.status})`)
  return res.json()
}

export async function batalkanPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const res = await authFetch(`${API_BASE}/purchase-order/${id}/batalkan`, {
    method: "PUT",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to cancel purchase order (${res.status})`)
  return res.json()
}

export async function fetchPurchaseOrderPdf(id: string, options?: { useClientCode?: boolean }): Promise<Blob> {
  const token = getToken()
  const params = options?.useClientCode ? "?use_code=1" : ""
  const res = await authFetch(`${API_BASE}/purchase-order/${id}/pdf${params}`, {
    headers: {
      Accept: "application/pdf",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) throw new Error(`Failed to fetch PO PDF (${res.status})`)
  return res.blob()
}

export async function reorderPurchaseOrderItems(poId: string, itemIds: string[]): Promise<void> {
  const res = await authFetch(`${API_BASE}/purchase-order/${poId}/items/reorder`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ item_ids: itemIds }),
  })
  if (!res.ok) throw new Error("Failed to reorder items")
}
