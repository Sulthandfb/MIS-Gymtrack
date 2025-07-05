"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/Sidebar"
import { OverviewTab } from "@/components/products/OverviewTab"
import { ProductListTab } from "@/components/products/ProductListTab"
import { SegmentationTab } from "@/components/products/SegmentationTab"
import { TextIcon as DocumentTextIcon, ArrowDownIcon as ArrowDownTrayIcon } from "lucide-react"

const tabs = [
  { id: "overview", name: "📊 Overview", component: OverviewTab },
  { id: "products", name: "📋 Daftar Produk", component: ProductListTab },
  { id: "segmentation", name: "🧠 Segmentasi & Simulasi", component: SegmentationTab },
]

export default function ProductsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || OverviewTab

  return (
    <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="ml-0 lg:ml-64 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">PRODUK & SUPLEMEN</h1>
            <p className="text-gray-600 text-xs lg:text-sm">
              Kelola inventori, analisis penjualan, dan optimasi produk gym
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 shadow-sm text-xs lg:text-sm">
              <DocumentTextIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Produk</span>
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-xs lg:text-sm">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Ekspor Data</span>
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <ActiveComponent />
        </div>
      </main>
    </div>
  )
}
