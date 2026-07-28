"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { MessageCircle, X, Reply } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchUnreadMessages, type UnreadItem } from "@/lib/chat-api"
import { getToken } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export function ChatBell() {
  const [open, setOpen] = useState(false)
  const [unreadItems, setUnreadItems] = useState<UnreadItem[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    try {
      const res = await fetchUnreadMessages()
      setUnreadItems(res.unread_items)
      setTotalUnread(res.total_unread)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => {
      clearInterval(interval)
    }
  }, [load])

  const markAsRead = useCallback(
    async (conversationId: string) => {
      const token = getToken()
      if (!token) return
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/conversations/${conversationId}/messages?page=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          },
        )
        setUnreadItems((prev) => prev.filter((i) => i.conversation_id !== conversationId))
        setTotalUnread((prev) => Math.max(0, prev - 1))
      } catch {
      }
    },
    [],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative shrink-0">
        <PopoverTrigger
          render={
            <Button variant="ghost" size="icon">
              <Tooltip>
                <TooltipTrigger render={<MessageCircle className="size-5" />} />
                <TooltipContent side="bottom">Pesan</TooltipContent>
              </Tooltip>
            </Button>
          }
        />
        {totalUnread > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </div>
      <PopoverContent align="end" sideOffset={8} className="w-96 max-sm:max-w-[calc(100vw-1rem)] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Pesan Baru</span>
        </div>

        <div className="max-h-96 max-sm:max-h-[60vh] overflow-y-auto">
          {unreadItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-sm text-muted-foreground">
              <MessageCircle className="size-8 opacity-50" />
              <span>Tidak ada pesan baru</span>
            </div>
          ) : (
            <div className="divide-y">
              {unreadItems.map((item) => (
                <div key={item.id} className="group relative px-4 py-3 transition-colors hover:bg-muted/50">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {item.sender_name || item.username}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {formatDistanceToNow(new Date(item.last_message_at), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {item.last_message}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1">
                    <Link href={`/chat?conversation=${item.conversation_id}`} onClick={() => setOpen(false)}>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                        <Reply className="size-3" />
                        Balas
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                      onClick={() => markAsRead(item.conversation_id)}
                    >
                      <X className="size-3" />
                      Hapus
                    </Button>
                  </div>
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
          href="/chat"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center border-t px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          Lihat Semua Pesan
        </Link>
      </PopoverContent>
    </Popover>
  )
}
