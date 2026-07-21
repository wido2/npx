"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  CheckCircle,
  InboxIcon,
  AlertTriangle,
  Tag,
  CheckCheck,
  Send,
  Clock,
  ClipboardCheck,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LoaderIcon,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteNotification, fetchNotifications, markAsRead, markAllAsRead, type NotificationItem } from "@/lib/notification-api"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

function NotificationIcon({ type }: { type: string }) {
  const className = "size-5 shrink-0 mt-0.5"
  switch (type) {
    case "po_approved":
      return <CheckCircle className={cn(className, "text-green-500")} />
    case "po_received":
      return <CheckCircle className={cn(className, "text-blue-500")} />
    case "po_submitted":
      return <Send className={cn(className, "text-yellow-500")} />
    case "po_overdue":
      return <Clock className={cn(className, "text-red-600")} />
    case "pb_created":
      return <InboxIcon className={cn(className, "text-orange-500")} />
    case "stock_minimum":
      return <AlertTriangle className={cn(className, "text-red-500")} />
    case "stock_opname":
      return <ClipboardCheck className={cn(className, "text-blue-500")} />
    case "vendor_price_changed":
      return <Tag className={cn(className, "text-purple-500")} />
    default:
      return <Bell className={cn(className, "text-muted-foreground")} />
  }
}

function NotificationLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    po_approved: "PO Disetujui",
    po_received: "PO Diterima",
    po_submitted: "PO Dikirim",
    po_overdue: "PO Terlambat",
    pb_created: "PB Dibuat",
    stock_minimum: "Stok Menipis",
    stock_opname: "Stok Opname",
    vendor_price_changed: "Harga Vendor Berubah",
  }
  return <span>{labels[type] || type}</span>
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(async (pageNum: number) => {
    setLoading(true)
    try {
      const res = await fetchNotifications(pageNum)
      setNotifications(res.data)
      setLastPage(res.last_page)
      setTotal(res.total)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page)
  }, [page, load])

  async function handleMarkAsRead(item: NotificationItem) {
    if (item.read_at) return
    await markAsRead(item.id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)),
    )
  }

  async function handleMarkAllAsRead() {
    setMarkingAll(true)
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })))
    } finally {
      setMarkingAll(false)
    }
  }

  async function handleDelete(item: NotificationItem) {
    await deleteNotification(item.id)
    setNotifications((prev) => prev.filter((n) => n.id !== item.id))
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Notifikasi</h1>
            <p className="text-sm text-muted-foreground">Semua notifikasi berdasarkan peran Anda</p>
          </div>
          {total > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={markingAll}>
              <CheckCheck className="size-4" />
              {markingAll ? "..." : "Tandai Semua Dibaca"}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <Bell className="size-12 opacity-40" />
            <p className="text-sm">Belum ada notifikasi</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {notifications.map((item) => {
                const isUnread = !item.read_at
                return (
                  <div key={item.id} className="group relative">
                    <button
                      onClick={() => handleMarkAsRead(item)}
                      className={cn(
                        "flex w-full gap-4 rounded-lg border p-4 pr-10 text-left transition-colors hover:bg-muted/50",
                        isUnread ? "border-l-4 border-l-blue-500 bg-muted/20" : "border-border",
                      )}
                    >
                      <NotificationIcon type={item.data.type} />
                      <div className="flex-1 space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium", isUnread ? "text-foreground" : "text-muted-foreground")}>
                            {item.data.title}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                            <NotificationLabel type={item.data.type} />
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.data.message}</p>
                        {item.data.action_url && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(item.data.action_url)
                            }}
                            className="inline-block text-xs font-medium text-blue-600 hover:underline"
                          >
                            {item.data.action_text || "Lihat Detail"}
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground/60">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: id })}
                        </p>
                      </div>
                      {isUnread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item)
                      }}
                      className="absolute right-2 top-4 rounded p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                      title="Hapus notifikasi"
                    >
                      <X className="size-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                )
              })}
            </div>

            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Sebelumnya
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {page} dari {lastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                >
                  Selanjutnya
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
