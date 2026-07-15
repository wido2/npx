import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface POReceipt {
  id: string
  purchase_order_id: string
  nomor: string
  tanggal_terima: string
  catatan: string | null
  diterima_oleh: string | null
  created_at: string
  updated_at: string
  diterima_oleh_user?: { id: string; name: string }
  items?: POReceiptItem[]
}

export interface POReceiptItem {
  id: string
  purchase_order_receipt_id: string
  purchase_order_item_id: string
  barang_id: string
  jumlah_dipesan: number
  jumlah_diterima: number
  keterangan: string | null
  created_at: string
  updated_at: string
  barang?: { id: string; kode: string; nama: string }
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchPOReceipts(poId: string): Promise<POReceipt[]> {
  const res = await authFetch(`${API_BASE}/purchase-order/${poId}/receipts`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch receipts (${res.status})`)
  return res.json()
}

export async function fetchPOReceipt(poId: string, receiptId: string): Promise<POReceipt> {
  const res = await authFetch(`${API_BASE}/purchase-order/${poId}/receipts/${receiptId}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch receipt (${res.status})`)
  return res.json()
}
