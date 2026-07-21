"use client"

import { useState } from "react"
import { useChat } from "@/lib/chat-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

export function ChatInput() {
  const { activeConversation, sendMessage } = useChat()
  const [text, setText] = useState("")

  async function handleSend() {
    if (!text.trim() || !activeConversation) return
    try {
      await sendMessage(text)
      setText("")
    } catch {
      // silent
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!activeConversation) return null

  return (
    <div className="border-t p-4">
      <div className="flex items-end gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan... (Enter untuk kirim)"
          className="min-h-10 resize-none text-sm"
          rows={1}
        />
        <Button onClick={handleSend} disabled={!text.trim()} size="icon" className="size-10 shrink-0">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}
