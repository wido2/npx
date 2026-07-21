"use client"

import { useEffect, useRef } from "react"
import { useChat } from "@/lib/chat-context"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Message, MessageContent, MessageGroup, MessageHeader } from "@/components/ui/message"
import { LoaderIcon, Menu } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { ChatInput } from "./chat-input"
export function ChatView({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { activeConversation, messages, loading, messagesLoading, loadMessages, loadMoreMessages, hasMoreMessages } =
    useChat()
  const { user } = useAuth()
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeConversation) {
      loadMessages()
    }
  }, [activeConversation?.id, loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const otherUser = activeConversation?.users.find((u) => u.id !== user?.id)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <button
          onClick={onToggleSidebar}
          className="flex md:hidden size-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
          aria-label="Buka daftar percakapan"
        >
          <Menu className="size-4" />
        </button>
        {activeConversation && (
          <>
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {(otherUser?.name ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{otherUser?.name ?? "Percakapan"}</p>
              <p className="text-[10px] text-muted-foreground">
                {activeConversation.type === "group" ? "Grup" : "Percakapan pribadi"}
              </p>
            </div>
          </>
        )}
      </div>

      {!activeConversation ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-muted p-4">
              <svg className="size-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm">Pilih percakapan untuk mulai chat</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {loading || messagesLoading ? (
              <div className="flex justify-center py-8">
                <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Belum ada pesan. Kirim pesan pertama!
              </div>
            ) : (
              <>
                {hasMoreMessages && (
                  <div className="flex justify-center py-3">
                    <button
                      onClick={loadMoreMessages}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Muat pesan sebelumnya
                    </button>
                  </div>
                )}
                <div className="space-y-1 px-4 py-4">
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id
                    return (
                      <MessageGroup key={msg.id}>
                        <Message align={isOwn ? "end" : "start"}>
                          <MessageContent>
                            <MessageHeader className={cn(isOwn ? "justify-end" : "")}>
                              {msg.sender?.name ?? "Unknown"}
                            </MessageHeader>
                            <div
                              className={cn(
                                "inline-block max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                                isOwn
                                  ? "bg-primary text-primary-foreground self-end"
                                  : "bg-muted text-foreground self-start",
                              )}
                            >
                              {msg.message}
                            </div>
                            <p
                              className={cn(
                                "px-1 text-[10px] text-muted-foreground",
                                isOwn ? "text-right" : "text-left",
                              )}
                            >
                              {format(new Date(msg.created_at), "HH:mm", { locale: id })}
                            </p>
                          </MessageContent>
                        </Message>
                      </MessageGroup>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>
              </>
            )}
          </div>
          <ChatInput />
        </>
      )}
    </div>
  )
}
