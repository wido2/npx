"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { deleteNotification, fetchNotifications, fetchUnreadCount, markAllAsRead, markAsRead, type NotificationItem } from "@/lib/notification-api"
import { useAuth } from "@/lib/auth-context"

interface NotificationContextValue {
  notifications: NotificationItem[]
  unreadCount: number
  loading: boolean
  fetchMore: () => void
  hasMore: boolean
  handleMarkAsRead: (id: string) => Promise<void>
  handleMarkAllAsRead: () => Promise<void>
  handleDeleteNotification: (id: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchMore: () => {},
  hasMore: false,
  handleMarkAsRead: async () => {},
  handleMarkAllAsRead: async () => {},
  handleDeleteNotification: async () => {},
})

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadNotifications = useCallback(async (pageNum: number) => {
    setLoading(true)
    try {
      const res = await fetchNotifications(pageNum)
      if (pageNum === 1) {
        setNotifications(res.data)
      } else {
        setNotifications((prev) => [...prev, ...res.data])
      }
      setHasMore(pageNum < res.last_page)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadCount()
      setUnreadCount(count)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    if (!user) return
    loadNotifications(1)
    loadUnreadCount()

    intervalRef.current = setInterval(loadUnreadCount, 60_000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user, loadNotifications, loadUnreadCount])

  const fetchMore = useCallback(() => {
    if (loading || !hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    loadNotifications(nextPage)
  }, [loading, hasMore, page, loadNotifications])

  const handleMarkAsRead = useCallback(async (id: string) => {
    await markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })))
    setUnreadCount(0)
  }, [])

  const handleDeleteNotification = useCallback(async (id: string) => {
    await deleteNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchMore,
        hasMore,
        handleMarkAsRead,
        handleMarkAllAsRead,
        handleDeleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
