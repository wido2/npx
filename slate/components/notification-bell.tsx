"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { Bell, CheckCircle, InboxIcon, AlertTriangle, Tag, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/lib/notification-context"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

function NotificationIcon({ type }: { type: string }) {
  const className = "size-4 shrink-0 mt-0.5"
  switch (type) {
    case "po_approved":
      return <CheckCircle className={cn(className, "text-green-500")} />
    case "po_received":
      return <CheckCircle className={cn(className, "text-blue-500")} />
    case "pb_created":
      return <InboxIcon className={cn(className, "text-orange-500")} />
    case "stock_minimum":
      return <AlertTriangle className={cn(className, "text-red-500")} />
    case "vendor_price_changed":
      return <Tag className={cn(className, "text-purple-500")} />
    default:
      return <Bell className={cn(className, "text-muted-foreground")} />
  }
}

export function NotificationBell() {
  const { notifications, unreadCount, loading, fetchMore, hasMore, handleMarkAsRead, handleMarkAllAsRead } =
    useNotifications()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || loading || !hasMore) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
      fetchMore()
    }
  }, [loading, hasMore, fetchMore])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative shrink-0"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border bg-popover text-popover-foreground shadow-lg">
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
            className="max-h-96 overflow-y-auto"
          >
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                <Bell className="size-8 opacity-50" />
                <span>Tidak ada notifikasi</span>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const isUnread = !notification.read_at
                  return (
                    <Link
                      key={notification.id}
                      href={notification.data.action_url || "#"}
                      onClick={() => {
                        if (isUnread) handleMarkAsRead(notification.id)
                        setOpen(false)
                      }}
                      className={cn(
                        "flex gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50",
                        isUnread && "bg-muted/30",
                      )}
                    >
                      <NotificationIcon type={notification.data.type} />
                      <div className="flex-1 space-y-1 overflow-hidden">
                        <p className={cn("text-xs font-medium", isUnread ? "text-foreground" : "text-muted-foreground")}>
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
                      {isUnread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />}
                    </Link>
                  )
                })}
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-3">
                <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
