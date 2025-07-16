"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppSidebar } from "@/components/Sidebar"
import { Brain, Send, ArrowLeft, Star, Trash, Mic, Paperclip, Plus, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { sendChatMessage, getChatHistory, getOrCreateSession, testConnection, API_CONFIG } from "@/services/chatbot-api"
import type { ChatSession } from "@/types/chatbot"

interface Message {
  id: string
  content: string
  sender: "ai" | "user"
  timestamp: string
  context_used?: Record<string, any>
  data_sources?: string[]
}

interface ChatHistory {
  id: string
  title: string
  preview: string
  date: string
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Halo! Saya GymTrack AI, asisten virtual yang siap membantu Anda menganalisis data gym. Apa yang ingin Anda ketahui hari ini?",
      sender: "ai",
      timestamp: "6:38 pm",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedTab, setSelectedTab] = useState("Member")
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sample chat history
  const chatHistory: ChatHistory[] = [
    {
      id: "chat1",
      title: "Analisis Member Baru",
      preview: "Bagaimana tren member baru dalam 3 bulan terakhir?",
      date: "15 Mei 2023",
    },
    {
      id: "chat2",
      title: "Performa Trainer",
      preview: "Siapa trainer dengan rating tertinggi?",
      date: "12 Mei 2023",
    },
  ]

  // Business-focused prompts untuk gym management
  const prompts = {
    Member: [
      "Berapa total member aktif saat ini?",
      "Bagaimana distribusi jenis membership?",
      "Siapa member yang baru bergabung minggu ini?",
      "Berapa tingkat retensi member bulan ini?",
    ],
    Trainer: [
      "Siapa trainer dengan rating tertinggi?",
      "Bagaimana distribusi spesialisasi trainer?",
      "Berapa jumlah trainer aktif saat ini?",
      "Trainer mana yang paling banyak diminati?",
    ],
    Keuangan: [
      "Bagaimana performa pendapatan bulan ini?",
      "Berapa total pengeluaran bulan ini?",
      "Apa sumber pendapatan terbesar?",
      "Bagaimana profit margin bulan ini?",
    ],
    Inventori: [
      "Peralatan apa yang perlu maintenance?",
      "Berapa total peralatan yang berfungsi baik?",
      "Kategori peralatan apa yang paling banyak?",
      "Peralatan apa yang baru dibeli?",
    ],
    Feedback: [
      "Bagaimana sentiment feedback member secara keseluruhan?",
      "Apa keluhan yang paling sering muncul?",
      "Berapa rating rata-rata dari member?",
      "Feedback positif apa yang paling banyak?",
    ],
    Produk: [
      "Produk apa yang paling laris?",
      "Berapa stok produk yang tersisa?",
      "Produk mana yang perlu restock?",
      "Bagaimana performa penjualan produk?",
    ],
  }

  // Test connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus("checking")
      const isConnected = await testConnection()
      setConnectionStatus(isConnected ? "connected" : "disconnected")

      if (!isConnected) {
        setError(`Tidak dapat terhubung ke server di ${API_CONFIG.BASE_URL}. Pastikan backend sedang berjalan.`)
      }
    }

    checkConnection()
  }, [])

  // Initialize session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      if (connectionStatus !== "connected") return

      try {
        setIsLoading(true)
        setError(null)
        const session = await getOrCreateSession()
        setCurrentSession(session)

        // Load chat history if session has messages
        if (session.session_id) {
          const history = await getChatHistory(session.session_id, 20)
          if (history.length > 0) {
            const formattedHistory = history.reverse().map((msg) => ({
              id: msg.message_id.toString(),
              content: msg.content,
              sender: msg.message_type === "user" ? ("user" as const) : ("ai" as const),
              timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }))
            setMessages((prev) => [...prev, ...formattedHistory])
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Gagal menginisialisasi sesi chat."
        setError(errorMessage)
        console.error("Session initialization error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
  }, [connectionStatus])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSession || isTyping || connectionStatus !== "connected") return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    setError(null)

    try {
      const response = await sendChatMessage({
        message: inputValue,
        session_id: currentSession.session_id,
        user_id: currentSession.user_id || "anonymous",
      })

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        context_used: response.context_used,
        data_sources: response.data_sources,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pesan."
      setError(errorMessage)
      console.error("Chat error:", err)
    } finally {
      setIsTyping(false)
    }
  }

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewChat = async () => {
    if (connectionStatus !== "connected") return

    try {
      setIsLoading(true)
      setError(null)
      const newSession = await getOrCreateSession()
      setCurrentSession(newSession)
      setMessages([
        {
          id: "1",
          content:
            "Halo! Saya GymTrack AI, asisten virtual yang siap membantu Anda menganalisis data gym. Apa yang ingin Anda ketahui hari ini?",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal membuat chat baru."
      setError(errorMessage)
      console.error("New chat error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetryConnection = async () => {
    setConnectionStatus("checking")
    setError(null)
    const isConnected = await testConnection()
    setConnectionStatus(isConnected ? "connected" : "disconnected")

    if (!isConnected) {
      setError(`Tidak dapat terhubung ke server di ${API_CONFIG.BASE_URL}. Pastikan backend sedang berjalan.`)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AppSidebar />

      {/* Chat History Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col ml-64">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">GYMTRACK AI</h2>
              <p className="text-sm text-gray-500">Konsultasi dengan ChatBot GymTrack</p>
            </div>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleNewChat}
            disabled={isLoading || connectionStatus !== "connected"}
          >
            <Plus className="w-4 h-4 mr-2" />
            Chat Baru
          </Button>
        </div>

        {/* Connection Status */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            {connectionStatus === "connected" && (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Terhubung</span>
              </>
            )}
            {connectionStatus === "disconnected" && (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-red-600">Terputus</span>
                <Button size="sm" variant="outline" onClick={handleRetryConnection} className="ml-auto bg-transparent">
                  Coba Lagi
                </Button>
              </>
            )}
            {connectionStatus === "checking" && (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-gray-600">Memeriksa...</span>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <Button
              variant={selectedTab === "Riwayat" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTab("Riwayat")}
              className="flex-1"
            >
              Riwayat
            </Button>
            <Button
              variant={selectedTab === "Tersimpan" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTab("Tersimpan")}
              className="flex-1"
            >
              Tersimpan
            </Button>
          </div>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 p-4">
          {chatHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Brain className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Belum ada chat tersimpan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <Card key={chat.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 mb-1">{chat.title}</h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{chat.preview}</p>
                    <p className="text-xs text-gray-400">{chat.date}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold">GymTrack AI</h1>
              {currentSession && <span className="text-sm text-gray-500">Session: {currentSession.session_id}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Star className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Trash className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              {connectionStatus === "disconnected" && (
                <Button size="sm" variant="outline" onClick={handleRetryConnection} className="ml-auto bg-transparent">
                  Coba Lagi
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3", message.sender === "user" ? "justify-end" : "justify-start")}
              >
                {message.sender === "ai" && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/api/placeholder/32/32" />
                    <AvatarFallback className="bg-blue-600 text-white text-xs">AI</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-3",
                    message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.data_sources && message.data_sources.length > 0 && (
                    <div className="mt-2 text-xs opacity-70">
                      <span className="font-medium">Sumber data: </span>
                      {message.data_sources.join(", ")}
                    </div>
                  )}
                  <p
                    className={cn(
                      "text-xs mt-1 opacity-70",
                      message.sender === "user" ? "text-blue-100" : "text-gray-500",
                    )}
                  >
                    {message.timestamp}
                  </p>
                </div>

                {message.sender === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/api/placeholder/32/32" />
                    <AvatarFallback className="bg-gray-600 text-white text-xs">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">AI</AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Suggested Prompts */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Saran Prompt</h3>
              <Button variant="ghost" size="sm" className="text-blue-600">
                Sembunyikan
              </Button>
            </div>

            {/* Prompt Categories */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {Object.keys(prompts).map((category) => (
                <Button
                  key={category}
                  variant={selectedTab === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTab(category)}
                  className={cn("rounded-full", selectedTab === category ? "bg-blue-600 text-white" : "")}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Prompt Suggestions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {prompts[selectedTab as keyof typeof prompts]?.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 text-left justify-start text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-200 bg-transparent"
                  onClick={() => handlePromptClick(prompt)}
                  disabled={isTyping || connectionStatus !== "connected"}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    connectionStatus === "connected"
                      ? "Tanyakan tentang data gym Anda..."
                      : "Menunggu koneksi ke server..."
                  }
                  className="pr-20 py-3 rounded-lg border-gray-300"
                  disabled={isTyping || isLoading || connectionStatus !== "connected"}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="w-8 h-8" disabled>
                    <Mic className="w-4 h-4 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8" disabled>
                    <Paperclip className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={
                  !inputValue.trim() || isTyping || isLoading || !currentSession || connectionStatus !== "connected"
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                {isTyping ? "Mengirim..." : "Send"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Debug Info */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
                API URL: {API_CONFIG.BASE_URL} | Status: {connectionStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
