import axios from "axios"
import type { ChatRequest, ChatResponse, ChatSession, ChatMessage } from "@/types/chatbot"

// ✅ Configuration untuk API URL - sesuaikan dengan setup Anda
const API_CONFIG = {
  // Ganti dengan URL backend Anda
  BASE_URL: "http://localhost:8000",
  // Atau bisa juga menggunakan environment variable jika tersedia
  // BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000",
}

// Chatbot API Functions
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    console.log("Sending chat message:", request)
    const res = await axios.post(`${API_CONFIG.BASE_URL}/api/ai/chat`, request, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    })
    console.log("Chat response:", res.data)
    return res.data as ChatResponse
  } catch (error) {
    console.error("Error sending chat message:", error)
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error("Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.")
      }
      if (error.response?.status === 500) {
        throw new Error("Terjadi kesalahan di server. Silakan coba lagi.")
      }
      if (error.response?.status === 404) {
        throw new Error("Endpoint tidak ditemukan. Periksa konfigurasi API.")
      }
    }
    throw new Error("Gagal mengirim pesan. Silakan coba lagi.")
  }
}

export const getChatHistory = async (sessionId: number, limit = 10): Promise<ChatMessage[]> => {
  try {
    console.log("Getting chat history for session:", sessionId)
    const res = await axios.get(`${API_CONFIG.BASE_URL}/api/ai/chat/history/${sessionId}?limit=${limit}`, {
      timeout: 10000,
    })
    console.log("Chat history:", res.data)
    return res.data as ChatMessage[]
  } catch (error) {
    console.error("Error fetching chat history:", error)
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error("Tidak dapat terhubung ke server.")
      }
    }
    throw new Error("Gagal mengambil riwayat chat.")
  }
}

export const getOrCreateSession = async (userId?: string): Promise<ChatSession> => {
  try {
    console.log("Getting or creating session for user:", userId || "anonymous")
    const res = await axios.get(`${API_CONFIG.BASE_URL}/api/ai/chat/session/${userId || "anonymous"}`, {
      timeout: 10000,
    })
    console.log("Session:", res.data)
    return res.data as ChatSession
  } catch (error) {
    console.error("Error getting/creating session:", error)
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error("Tidak dapat terhubung ke server.")
      }
    }
    throw new Error("Gagal membuat sesi chat.")
  }
}

// ✅ Helper function untuk test koneksi
export const testConnection = async (): Promise<boolean> => {
  try {
    const res = await axios.get(`${API_CONFIG.BASE_URL}/api/ai/chat/session/test`, {
      timeout: 5000,
    })
    return res.status === 200
  } catch (error) {
    console.error("Connection test failed:", error)
    return false
  }
}

// ✅ Export API config untuk debugging
export { API_CONFIG }
