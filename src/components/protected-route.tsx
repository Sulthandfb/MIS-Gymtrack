// src/components/protected-route.tsx
"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom" //

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate() //
  const location = useLocation() //
  const pathname = location.pathname //

  const [isAuthorized, setIsAuthorized] = useState(false) //
  const [isLoading, setIsLoading] = useState(true) //

  useEffect(() => {
    // Nonaktifkan sementara logika pemeriksaan login
    // const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    // Jika ini adalah halaman login dan pengguna sudah login, redirect ke dashboard
    // if (pathname === "/login" && isLoggedIn) {
    //   navigate("/dashboard")
    //   return
    // }

    // Jika ini bukan halaman login dan pengguna belum login, redirect ke login
    // if (pathname !== "/login" && !isLoggedIn) {
    //   navigate("/login")
    //   return
    // }

    // Untuk sementara, selalu anggap pengguna diizinkan karena halaman login belum dibuat
    setIsAuthorized(true) //
    setIsLoading(false) //

  }, [pathname, navigate]) //

  // Tampilkan loading state saat memeriksa otorisasi
  if (isLoading) { //
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  // Jika diotorisasi, tampilkan konten halaman
  return isAuthorized ? <>{children}</> : null //
}