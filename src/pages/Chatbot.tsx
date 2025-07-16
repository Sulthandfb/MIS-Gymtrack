
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Brain,
  Send,
  ChevronRight,
  ChevronLeft,
  Clock,
  Save,
  Trash,
  BarChart,
  Users,
  Heart,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AppSidebar } from "@/components/Sidebar"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: string
}

interface ChatbotProps {
  isOpen?: boolean
  onToggle?: () => void
}

export default function Chatbot({ isOpen, onToggle }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Halo! Saya GymTrack AI, asisten virtual yang siap membantu Anda menganalisis data gym. Apa yang ingin Anda ketahui hari ini?",
      sender: "ai",
      timestamp: new Date().toISOString(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [promptsOpen, setPromptsOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Contoh riwayat chat
  const chatHistory = [
    {
      id: "chat1",
      title: "Analisis Member Baru",
      preview: "Bagaimana tren member baru dalam 3 bulan terakhir?",
      date: "15 Mei 2023",
    },
    {
      id: "chat2",
      title: "Performa Trainer",
      preview: "Siapa trainer dengan rating tertinggi bulan ini?",
      date: "12 Mei 2023",
    },
    {
      id: "chat3",
      title: "Analisis Pendapatan",
      preview: "Bandingkan pendapatan Q1 dan Q2 tahun ini",
      date: "10 Mei 2023",
    },
    {
      id: "chat4",
      title: "Prediksi Kehadiran",
      preview: "Prediksi kehadiran member untuk minggu depan",
      date: "5 Mei 2023",
    },
  ]

  // Contoh saran prompt
  const promptSuggestions = {
    "Member Insights": [
      "Berapa tingkat retensi member dalam 6 bulan terakhir?",
      "Apa alasan utama member berhenti berlangganan?",
      "Bagaimana demografi member kita berubah tahun ini?",
      "Member dari kelompok usia mana yang paling aktif?",
    ],
    "Fitness Trends": [
      "Kelas apa yang paling populer bulan ini?",
      "Bagaimana tren penggunaan alat kardio vs beban?",
      "Waktu kunjungan terbanyak dalam seminggu?",
      "Berapa rata-rata durasi latihan member?",
    ],
    "Business Analytics": [
      "Bagaimana perbandingan pendapatan tahun ini vs tahun lalu?",
      "Produk apa yang memberikan margin tertinggi?",
      "Berapa biaya akuisisi per member baru?",
      "Prediksi pendapatan untuk kuartal berikutnya",
    ],
  }

  // Efek scroll ke bawah saat ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulasi respons AI
  const simulateResponse = (userMessage: string) => {
    setIsTyping(true)

    // Simulasi delay respons
    setTimeout(() => {
      let response = ""

      // Logika sederhana untuk menentukan respons berdasarkan kata kunci
      if (userMessage.toLowerCase().includes("member")) {
        response =
          "Berdasarkan data terkini, kita memiliki 1,248 member aktif dengan tingkat retensi 87%. Terjadi peningkatan 12% dari bulan sebelumnya. Mayoritas member baru berasal dari program referral dan kampanye media sosial."
      } else if (userMessage.toLowerCase().includes("pendapatan") || userMessage.toLowerCase().includes("revenue")) {
        response =
          "Pendapatan bulan ini mencapai Rp 45,8 juta, meningkat 8% dari bulan sebelumnya. Sumber pendapatan terbesar berasal dari membership (65%), diikuti oleh penjualan produk (20%), dan personal training (15%)."
      } else if (userMessage.toLowerCase().includes("trainer") || userMessage.toLowerCase().includes("pelatih")) {
        response =
          "Saat ini ada 24 trainer aktif dengan rata-rata rating 4.7/5. Trainer dengan performa tertinggi adalah Budi dengan rating 4.9/5 dan tingkat retensi klien 95%. Kelas yang dipimpin oleh trainer memiliki tingkat kehadiran 78%."
      } else if (userMessage.toLowerCase().includes("kelas") || userMessage.toLowerCase().includes("class")) {
        response =
          "Kelas paling populer bulan ini adalah HIIT dengan rata-rata kehadiran 92%. Diikuti oleh Yoga (85%) dan Zumba (80%). Kelas pagi (6-8 pagi) memiliki tingkat kehadiran tertinggi dibandingkan slot waktu lainnya."
      } else {
        response =
          "Berdasarkan analisis data terkini, performa gym menunjukkan tren positif dengan peningkatan di beberapa area kunci. Apakah ada metrik atau area spesifik yang ingin Anda ketahui lebih detail?"
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: response,
          sender: "ai",
          timestamp: new Date().toISOString(),
        },
      ])
      setIsTyping(false)
    }, 2000)
  }

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return

    const newMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user" as const,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Fokus kembali ke input setelah mengirim pesan
    inputRef.current?.focus()

    // Simulasi respons AI
    simulateResponse(inputValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt)
    inputRef.current?.focus()
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Sidebar */}
      <AppSidebar />
      
      {/* Chat Sidebar */}
      <div
        className={cn(
          "bg-white text-gray-800 border-r border-gray-200 transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-0",
        )}
      >
        {sidebarOpen && (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-emerald-500">
                  <Brain className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-lg">GymTrack AI</h2>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-800"
                onClick={() => {
                  setMessages([
                    {
                      id: "1",
                      content:
                        "Halo! Saya GymTrack AI, asisten virtual yang siap membantu Anda menganalisis data gym. Apa yang ingin Anda ketahui hari ini?",
                      sender: "ai",
                      timestamp: new Date().toISOString(),
                    },
                  ])
                }}
              >
                Chat Baru
              </Button>
            </div>

            <Tabs defaultValue="history" className="flex-1 flex flex-col">
              <TabsList className="bg-gray-100 p-1 mx-4 mt-4">
                <TabsTrigger
                  value="history"
                  className="flex-1 data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-gray-600"
                >
                  Riwayat
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="flex-1 data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-gray-600"
                >
                  Tersimpan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="flex-1 p-4 space-y-3 overflow-auto">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className="p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors group shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm text-gray-800">{chat.title}</h3>
                      <Clock className="h-3 w-3 text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">{chat.preview}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{chat.date}</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="saved" className="flex-1 p-4">
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <Save className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">Belum ada chat tersimpan</p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Toggle sidebar button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-64 top-1/2 transform -translate-y-1/2 z-10 bg-white text-gray-800 border border-gray-200 border-l-0 rounded-none rounded-r-full h-12 shadow-sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex items-start gap-3", message.sender === "user" ? "justify-end" : "justify-start")}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 bg-emerald-600 text-white">
                    <AvatarFallback>AI</AvatarFallback>
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  </Avatar>
                )}

                <div
                  className={cn(
                    "rounded-lg p-4 max-w-[80%] shadow-sm",
                    message.sender === "user"
                      ? "bg-emerald-500 text-white"
                      : "bg-white border border-gray-200 text-gray-800",
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={cn("text-xs mt-2", message.sender === "user" ? "text-emerald-100" : "text-gray-500")}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.sender === "user" && (
                  <Avatar className="h-8 w-8 bg-gray-300">
                    <AvatarFallback>U</AvatarFallback>
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 bg-emerald-600 text-white">
                  <AvatarFallback>AI</AvatarFallback>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                </Avatar>

                <div className="bg-white border border-gray-200 text-gray-800 rounded-lg p-4 shadow-sm">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Prompt suggestions */}
        {promptsOpen && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-800">Saran Prompt</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-800"
                  onClick={() => setPromptsOpen(false)}
                >
                  Sembunyikan
                </Button>
              </div>

              <Tabs defaultValue="Member Insights">
                <TabsList className="bg-gray-100 mb-3">
                  <TabsTrigger
                    value="Member Insights"
                    className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-gray-600"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Member
                  </TabsTrigger>
                  <TabsTrigger
                    value="Fitness Trends"
                    className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-gray-600"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Fitness
                  </TabsTrigger>
                  <TabsTrigger
                    value="Business Analytics"
                    className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-gray-600"
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Bisnis
                  </TabsTrigger>
                </TabsList>

                {Object.entries(promptSuggestions).map(([category, prompts]) => (
                  <TabsContent key={category} value={category} className="m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {prompts.map((prompt, index) => (
                        <Card
                          key={index}
                          className="bg-white border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors shadow-sm"
                          onClick={() => handlePromptClick(prompt)}
                        >
                          <CardContent className="p-3">
                            <p className="text-xs text-gray-700">{prompt}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            {!promptsOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-800"
                onClick={() => setPromptsOpen(true)}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            )}

            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanyakan sesuatu tentang data gym Anda..."
                className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full text-gray-500 hover:text-emerald-500"
                onClick={handleSendMessage}
                disabled={inputValue.trim() === ""}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
