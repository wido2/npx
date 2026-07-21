"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { MessageCircle, X, Reply } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchUnreadMessages, type UnreadItem } from "@/lib/chat-api"
import { getToken } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

export function ChatBell() {
  const [open, setOpen] = useState(false)
  const [unreadItems, setUnreadItems] = useState<UnreadItem[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const echoRef = useRef<{ destroy: () => void } | null>(null)

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
    function onUnreadUpdate() { load() }
    window.addEventListener("chat:unread-update", onUnreadUpdate)
    return () => {
      clearInterval(interval)
      window.removeEventListener("chat:unread-update", onUnreadUpdate)
    }
  }, [load])

  useEffect(() => {
    if (!user?.id) return

    let echo: any = null
    import("laravel-echo").then((EchoModule) => {
      import("pusher-js").then((PusherModule) => {
        const token = getToken()
        if (!token) return
        const Echo = EchoModule.default || EchoModule
        const Pusher = PusherModule.default || PusherModule
        const options: Record<string, any> = {
          broadcaster: "reverb",
          Pusher,
          key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
          wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
          wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || undefined,
          wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || undefined,
          forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
          enabledTransports: ["ws", "wss"],
          authEndpoint: `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api$/, "")}/broadcasting/auth`,
          userAuthentication: {
            endpoint: `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api$/, "")}/broadcasting/user-auth`,
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
          auth: {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        }
        echo = new Echo(options as any)

        echoRef.current = echo

        echo.private(`App.Models.User.${user.id}`).listen(".NewChatMessage", () => {
          load()
        })
      })
    })

    return () => {
      if (echo) {
        try { echo.disconnect() } catch {}
      }
    }
  }, [user?.id, load])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => setOpen(!open)}
        aria-label="Chat"
      >
        <MessageCircle className="size-5" />
      </Button>
      {totalUnread > 0 && (
        <span className="absolute -right-1 -top-1 flex size-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white">
          {totalUnread > 99 ? "99+" : totalUnread}
        </span>
      )}

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border bg-popover text-popover-foreground shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold">Pesan Baru</span>
          </div>

          <div className="max-h-96 overflow-y-auto">
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
        </div>
      )}
    </div>
  )
}
