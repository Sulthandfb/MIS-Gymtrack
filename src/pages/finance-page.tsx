"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinanceDashboardTab } from "@/components/finance/finance-dashboard-tab"
import { FinanceForecastTab } from "@/components/finance/finance-forecast-tab"
import { FinanceBreakdownTab } from "@/components/finance/finance-breakdown-tab"
import { DollarSign, Download } from "lucide-react"

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Finance Management</h1>
                <p className="text-gray-600">Kelola dan analisis keuangan gym Anda</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 shadow-sm text-xs lg:text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">Tambah Transaksi</span>
                </button>
                <button className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-xs lg:text-sm">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Ekspor Laporan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <TabsList className="grid w-full grid-cols-3 bg-transparent">
                <TabsTrigger
                  value="dashboard"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  📊 Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="forecast"
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  📈 Forecast
                </TabsTrigger>
                <TabsTrigger
                  value="breakdown"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                >
                  💰 Breakdown
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <TabsContent value="dashboard" className="m-0">
                <FinanceDashboardTab />
              </TabsContent>

              <TabsContent value="forecast" className="m-0">
                <FinanceForecastTab />
              </TabsContent>

              <TabsContent value="breakdown" className="m-0">
                <FinanceBreakdownTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
