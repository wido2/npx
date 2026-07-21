"use client"

import { useState } from "react"
import { useChat } from "@/lib/chat-context"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { MessageCircle, Plus, Search, Users } from "lucide-react"
import { type Conversation } from "@/lib/chat-api"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

export function ChatSidebar() {
  const { conversations, activeConversation, setActiveConversation, users, createConversation } = useChat()
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [newChatOpen, setNewChatOpen] = useState(false)

  const filtered = conversations.filter((c) => {
    if (!search) return true
    const name = getConversationName(c, user?.id ?? "")
    return name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex h-full flex-col border-r">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Percakapan</h2>
        <Sheet open={newChatOpen} onOpenChange={setNewChatOpen}>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setNewChatOpen(true)}>
              <Plus className="size-4" />
            </Button>
          </div>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Percakapan Baru</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-1">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={async () => {
                    const conv = await createConversation([u.id])
                    setActiveConversation(conv)
                    setNewChatOpen(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{u.name}</span>
                </button>
              ))}
              {users.length === 0 && (
                <p className="px-3 py-4 text-sm text-muted-foreground">Tidak ada pengguna lain</p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="border-b px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari percakapan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-sm text-muted-foreground">
            <MessageCircle className="size-8 opacity-50" />
            <span>Belum ada percakapan</span>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {filtered.map((conv) => {
              const isActive = activeConversation?.id === conv.id
              const otherUser = conv.users.find((u) => u.id !== user?.id)
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted",
                    isActive && "bg-muted",
                  )}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {conv.type === "group" ? (
                      <Users className="size-4" />
                    ) : (
                      (otherUser?.name ?? "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">
                        {getConversationName(conv, user?.id ?? "")}
                      </span>
                      {conv.last_message && (
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message.created_at), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {conv.last_message?.message || "Belum ada pesan"}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

function getConversationName(conv: Conversation, userId: string): string {
  if (conv.name) return conv.name
  const others = conv.users.filter((u) => u.id !== userId)
  return others.map((u) => u.name).join(", ") || "Unknown"
}
