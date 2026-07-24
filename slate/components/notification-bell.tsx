"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { Bell, CheckCircle, InboxIcon, AlertTriangle, Tag, CheckCheck, Send, Clock, ClipboardCheck, X, FolderKanbanIcon, UsersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/lib/notification-context"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function NotificationIcon({ type }: { type: string }) {
  const className = "size-4 shrink-0 mt-0.5"
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
    case "project_created":
      return <FolderKanbanIcon className={cn(className, "text-cyan-500")} />
    case "client_created":
      return <UsersIcon className={cn(className, "text-amber-500")} />
    default:
      return <Bell className={cn(className, "text-muted-foreground")} />
  }
}

export function NotificationBell() {
  const { notifications, unreadCount, loading, fetchMore, hasMore, handleMarkAsRead, handleMarkAllAsRead, handleDeleteNotification } =
    useNotifications()
  const [open, setOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || loading || !hasMore) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
      fetchMore()
    }
  }, [loading, hasMore, fetchMore])

  const unreadNotifications = notifications.filter((n) => !n.read_at)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative shrink-0">
        <PopoverTrigger
          render={
            <Button variant="ghost" size="icon">
              <Bell className="size-5" />
            </Button>
          }
        />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
      <PopoverContent align="end" sideOffset={8} className="w-96 max-sm:max-w-[calc(100vw-1rem)] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notifikasi</span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="size-3.5" />
              Tandai semua dibaca
            </button>
          )}
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-96 max-sm:max-h-[60vh] overflow-y-auto"
        >
          {unreadNotifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-sm text-muted-foreground">
              <Bell className="size-8 opacity-50" />
              <span>Tidak ada notifikasi</span>
            </div>
          ) : (
            <div className="divide-y">
              {unreadNotifications.map((notification) => (
                <div key={notification.id} className="group relative">
                  <Link
                    href={notification.data.action_url || "#"}
                    onClick={() => {
                      handleMarkAsRead(notification.id)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex gap-3 px-4 py-3 pr-8 text-sm transition-colors hover:bg-muted/50",
                    )}
                  >
                    <NotificationIcon type={notification.data.type} />
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p className="text-xs font-medium text-foreground">
                        {notification.data.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.data.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNotification(notification.id)
                    }}
                    className="absolute right-1.5 top-3 rounded p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                    title="Hapus notifikasi"
                  >
                    <X className="size-3.5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-3">
              <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          )}
        </div>

        <Link
          href="/notifications"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center border-t px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          Lihat Semua Notifikasi
        </Link>
      </PopoverContent>
    </Popover>
  )
}
