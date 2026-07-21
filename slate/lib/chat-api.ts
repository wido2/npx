import { getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

async function authHeaders(): Promise<Record<string, string>> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export interface UserInfo {
  id: string
  name: string
}

export interface Conversation {
  id: string
  type: "individual" | "group"
  name: string | null
  created_at: string
  updated_at: string
  users: UserInfo[]
  last_message?: Message | null
  pivot: {
    last_read_at: string | null
  }
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender?: UserInfo
  message: string
  type: string
  file_path: string | null
  created_at: string
  updated_at: string
}

interface PaginatedMessages {
  data: Message[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/conversations`, { headers: await authHeaders() })
  if (!res.ok) throw new Error("Failed to fetch conversations")
  return res.json()
}

export async function fetchConversation(id: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/conversations/${id}`, { headers: await authHeaders() })
  if (!res.ok) throw new Error("Failed to fetch conversation")
  return res.json()
}

export async function createConversation(userIds: string[]): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ user_ids: userIds }),
  })
  if (!res.ok) throw new Error("Failed to create conversation")
  return res.json()
}

export async function fetchMessages(conversationId: string, page = 1): Promise<PaginatedMessages> {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages?page=${page}`, {
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch messages")
  return res.json()
}

export async function sendMessage(
  conversationId: string,
  data: { message?: string; type?: string; file?: File },
): Promise<Message> {
  const token = getToken()
  if (data.file) {
    const formData = new FormData()
    if (data.message) formData.append("message", data.message)
    if (data.type) formData.append("type", data.type)
    formData.append("file", data.file)
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })
    if (!res.ok) throw new Error("Failed to send message")
    return res.json()
  }

  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ message: data.message, type: data.type || "text" }),
  })
  if (!res.ok) throw new Error("Failed to send message")
  return res.json()
}

export interface UnreadItem {
  id: string
  conversation_id: string
  username: string
  last_message: string
  last_message_at: string
  sender_id: string
  sender_name: string
}

export interface UnreadResponse {
  total_unread: number
  unread_items: UnreadItem[]
}

export async function fetchUnreadMessages(): Promise<UnreadResponse> {
  const res = await fetch(`${API_BASE}/chat/unread`, { headers: await authHeaders() })
  if (!res.ok) throw new Error("Failed to fetch unread messages")
  return res.json()
}

export async function fetchChatUsers(): Promise<UserInfo[]> {
  const res = await fetch(`${API_BASE}/chat/users`, { headers: await authHeaders() })
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}
