"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ChatProvider, useChat } from "@/lib/chat-context"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatView } from "@/components/chat-view"
import { Sheet, SheetContent } from "@/components/ui/sheet"

function ChatContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { conversations, loading, setActiveConversation } = useChat()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("conversation")

  useEffect(() => {
    if (!conversationId || loading) return
    const conv = conversations.find((c) => c.id === conversationId)
    if (conv) {
      setActiveConversation(conv)
    }
  }, [conversationId, conversations, loading, setActiveConversation])

  return (
    <div className="flex h-[calc(100vh-8rem)] -mx-4 -mb-4 overflow-hidden">
      <div className="hidden w-72 shrink-0 md:block">
        <ChatSidebar />
      </div>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0" showCloseButton={false}>
          <ChatSidebar />
        </SheetContent>
      </Sheet>
      <div className="flex-1">
        <ChatView onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <DashboardLayout>
      <ChatProvider>
        <ChatContent />
      </ChatProvider>
    </DashboardLayout>
  )
}
