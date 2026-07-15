import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface POItem {
  id: string
  purchase_order_id: string
  barang_id: string
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

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchPOItems(poId: string): Promise<POItem[]> {
  const res = await authFetch(`${API_BASE}/purchase-order/${poId}/items`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch PO items (${res.status})`)
  return res.json()
}

export async function createPOItem(
  poId: string,
  data: {
    barang_id: string
    jumlah: number
    harga_satuan: number
    diskon?: number
    jenis_pajak_id?: string
    keterangan?: string
  }
): Promise<POItem> {
  const res = await authFetch(`${API_BASE}/purchase-order/${poId}/items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create PO item (${res.status})`)
  return res.json()
}

export async function updatePOItem(
  poId: string,
  itemId: string,
  data: Partial<{
    barang_id: string
    jumlah: number
    harga_satuan: number
    diskon: number
    jenis_pajak_id: string
    keterangan: string
  }>
): Promise<POItem> {
  const res = await authFetch(`${API_BASE}/purchase-order/${poId}/items/${itemId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update PO item (${res.status})`)
  return res.json()
}

export async function deletePOItem(poId: string, itemId: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/purchase-order/${poId}/items/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete PO item")
}
