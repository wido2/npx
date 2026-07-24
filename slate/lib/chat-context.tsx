"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import {
  fetchConversations,
  fetchMessages,
  sendMessage as sendMessageApi,
  createConversation as createConversationApi,
  fetchChatUsers,
  type Conversation,
  type Message,
  type UserInfo,
} from "./chat-api"

interface ChatContextValue {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Message[]
  users: UserInfo[]
  loading: boolean
  messagesLoading: boolean
  setActiveConversation: (conv: Conversation | null) => void
  sendMessage: (text: string) => Promise<void>
  createConversation: (userIds: string[]) => Promise<Conversation>
  loadMessages: () => Promise<void>
  loadMoreMessages: () => Promise<void>
  hasMoreMessages: boolean
}

const ChatContext = createContext<ChatContextValue>({
  conversations: [],
  activeConversation: null,
  messages: [],
  users: [],
  loading: false,
  messagesLoading: false,
  setActiveConversation: () => {},
  sendMessage: async () => {},
  createConversation: async () => ({ id: "", type: "individual", name: null, created_at: "", updated_at: "", users: [], pivot: { last_read_at: null } }),
  loadMessages: async () => {},
  loadMoreMessages: async () => {},
  hasMoreMessages: false,
})

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagePage, setMessagePage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const convs = await fetchConversations()
      setConversations(convs)
    } catch {
      // silent
    }
    try {
      const chatUsers = await fetchChatUsers()
      setUsers(chatUsers)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [loadData])

  const loadMessages = useCallback(async () => {
    if (!activeConversation) return
    setMessagesLoading(true)
    setMessagePage(1)
    try {
      const res = await fetchMessages(activeConversation.id)
      setMessages(res.data.reverse())
      setHasMoreMessages(res.current_page < res.last_page)
    } catch {
      // silent
    } finally {
      setMessagesLoading(false)
    }
  }, [activeConversation])

  const loadMoreMessages = useCallback(async () => {
    if (!activeConversation || !hasMoreMessages || messagesLoading) return
    const nextPage = messagePage + 1
    setMessagesLoading(true)
    try {
      const res = await fetchMessages(activeConversation.id, nextPage)
      setMessages((prev) => [...res.data.reverse(), ...prev])
      setMessagePage(nextPage)
      setHasMoreMessages(nextPage < res.last_page)
    } catch {
      // silent
    } finally {
      setMessagesLoading(false)
    }
  }, [activeConversation, hasMoreMessages, messagePage, messagesLoading])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeConversation || !text.trim()) return
      const message = await sendMessageApi(activeConversation.id, { message: text })
      setMessages((prev) => [...prev, message])
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id ? { ...c, last_message: message, updated_at: message.created_at } : c,
        ),
      )
    },
    [activeConversation],
  )

  const createConversation = useCallback(
    async (userIds: string[]) => {
      const conv = await createConversationApi(userIds)
      setConversations((prev) => {
        if (prev.some((c) => c.id === conv.id)) return prev
        return [conv, ...prev]
      })
      return conv
    },
    [],
  )

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        users,
        loading,
        messagesLoading,
        setActiveConversation,
        sendMessage,
        createConversation,
        loadMessages,
        loadMoreMessages,
        hasMoreMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  return useContext(ChatContext)
}