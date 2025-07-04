"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, Package, Users, UserCircle, Menu, X, Wallet, BoxIcon, MessageSquare, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const routes = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Member Insights",
      href: "/members",
      icon: Users,
    },
    {
      name: "Trainer Insights",
      href: "/trainers",
      icon: UserCircle,
    },
    {
      name: "Product & Supplement",
      href: "/products",
      icon: Package,
    },
    {
      name: "Finance",
      href: "/finance",
      icon: Wallet,
    },
    {
      name: "Feedback & Sentiment",
      href: "/feedback",
      icon: MessageSquare,
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: BoxIcon,
    },
    {
      name: "GymTrack AI",
      href: "/chatbot",
      icon: Bot,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-white">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex border-r border-gray-200" variant="sidebar" collapsible="icon">
          <SidebarHeader className="flex h-16 items-center border-b border-gray-200 px-4">
            <div className="flex items-center gap-2 font-semibold">
              <div className="h-8 w-8 rounded-md bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold">
                GT
              </div>
              <span className="text-xl font-bold text-gray-800">GymTrack</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {routes.map((route) => (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.name}>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center gap-2",
                        pathname === route.href ? "text-teal-600" : "text-gray-600 hover:text-teal-600",
                      )}
                    >
                      <route.icon className="h-5 w-5" />
                      <span>{route.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>© 2025 GymTrack</span>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Menu Button */}
        <div className="fixed left-4 top-4 z-50 md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="bg-white border-gray-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-white p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex h-14 items-center border-b border-gray-200 px-4">
                <div className="flex items-center gap-2 font-semibold">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    GT
                  </div>
                  <span className="text-xl font-bold text-gray-800">GymTrack</span>
                </div>
              </div>
              <div className="mt-6 space-y-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                      pathname === route.href
                        ? "bg-teal-50 text-teal-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-teal-600",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <route.icon className="h-5 w-5" />
                    <span>{route.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">{children}</div>
      </div>
    </SidebarProvider>
  )
}
