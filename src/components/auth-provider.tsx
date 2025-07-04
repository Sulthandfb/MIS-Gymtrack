"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  userRole: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  login: async () => false,
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Periksa status autentikasi saat komponen dimuat
    const checkAuth = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true"
      const role = localStorage.getItem("userRole")

      setIsAuthenticated(loggedIn)
      setUserRole(role)
      setIsLoading(false)

      // Redirect ke login jika tidak terautentikasi dan bukan di halaman login
      if (!loggedIn && pathname !== "/login" && !pathname.startsWith("/auth/")) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [pathname, router])

  const login = async (email: string, password: string) => {
    // Implementasi login sederhana
    if (email === "admin@gymtrack.com" && password === "password") {
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userRole", "admin")
      setIsAuthenticated(true)
      setUserRole("admin")
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    setIsAuthenticated(false)
    setUserRole(null)
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>{children}</AuthContext.Provider>
}
