import { getToken } from "@/lib/api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface NotificationData {
  title: string
  message: string
  action_url: string
  action_text: string
  type: string
  [key: string]: unknown
}

export interface NotificationItem {
  id: string
  type: string
  data: NotificationData
  read_at: string | null
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  data: NotificationItem[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

async function authHeaders(): Promise<HeadersInit> {
  const token = getToken()
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  }
}

export async function fetchNotifications(page = 1): Promise<PaginatedResponse> {
  const res = await fetch(`${API_BASE}/notifications?page=${page}&per_page=20`, {
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch notifications")
  return res.json()
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: await authHeaders(),
  })
  if (!res.ok) return 0
  const data = await res.json()
  return data.count
}

export async function markAsRead(id: string): Promise<void> {
  await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "POST",
    headers: await authHeaders(),
  })
}

export async function markAllAsRead(): Promise<void> {
  await fetch(`${API_BASE}/notifications/read-all`, {
    method: "POST",
    headers: await authHeaders(),
  })
}
