import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface RevisionChange {
  type: "header" | "item_added" | "item_removed" | "item_modified"
  field?: string
  label: string
  oldValue: string | null
  newValue: string | null
}

export interface PORevision {
  id: string
  purchase_order_id: string
  version: number
  data: Record<string, unknown>
  changed_fields: string[]
  changes: RevisionChange[]
  changed_by: string | null
  created_at: string
  updated_at: string
  changed_by_user?: { id: string; name: string }
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchPORevisions(poId: string): Promise<PORevision[]> {
  const res = await authFetch(`${API_BASE}/purchase-order/${poId}/revisions`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch revisions (${res.status})`)
  return res.json()
}

export async function fetchPORevision(poId: string, revisionId: string): Promise<PORevision> {
  const res = await authFetch(`${API_BASE}/purchase-order/${poId}/revisions/${revisionId}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch revision (${res.status})`)
  return res.json()
}
