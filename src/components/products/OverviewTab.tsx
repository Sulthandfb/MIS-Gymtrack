"use client"
import { useEffect, useState } from "react"
import { Package, Pill, TrendingUp, AlertTriangle, ShoppingCart } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { AIInsights } from "@/components/AIInsights"
import { fetchProductDashboardData } from "@/services/api"
import type { ProductStats, TopSalesData, CategoryData, SalesTrendData, ProductInsight } from "@/types/product"

export function OverviewTab() {
  const [stats, setStats] = useState<ProductStats>({
    total_products: 0,
    total_supplements: 0,
    weekly_sales: 0,
    low_stock: 0,
  })
  const [topSales, setTopSales] = useState<TopSalesData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [salesTrend, setSalesTrend] = useState<SalesTrendData[]>([])
  const [insights, setInsights] = useState<ProductInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await fetchProductDashboardData()

        setStats(data.stats)
        setTopSales(data.topSales)
        setCategoryData(data.categoryData)
        setSalesTrend(data.salesTrend)
        setInsights(data.insights)
      } catch (err) {
        console.error("Error loading product dashboard:", err)
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="w-full p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full p-4 lg:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-800 font-medium">Error loading dashboard</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen p-4 lg:p-6">
      {/* ✅ Fixed: Full width container with proper grid */}
      <div className="w-full max-w-none">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* Summary Cards - Full width on mobile, 4 columns on desktop */}
          <div className="col-span-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs lg:text-sm font-medium text-gray-600">Total Produk</div>
                  <Package className="w-4 lg:w-5 h-4 lg:h-5 text-blue-500" />
                </div>
                <div className="text-xl lg:text-3xl font-bold text-gray-900">{stats.total_products}</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                  <span>+8% minggu ini</span>
                </div>
              </div>
              <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs lg:text-sm font-medium text-gray-600">Total Suplemen</div>
                  <Pill className="w-4 lg:w-5 h-4 lg:h-5 text-green-500" />
                </div>
                <div className="text-xl lg:text-3xl font-bold text-gray-900">{stats.total_supplements}</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                  <span>+12% minggu ini</span>
                </div>
              </div>
              <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs lg:text-sm font-medium text-gray-600">Terjual Minggu Ini</div>
                  <ShoppingCart className="w-4 lg:w-5 h-4 lg:h-5 text-orange-500" />
                </div>
                <div className="text-xl lg:text-3xl font-bold text-gray-900">{stats.weekly_sales}</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                  <span>+15% minggu ini</span>
                </div>
              </div>
              <div className="bg-white p-3 lg:p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs lg:text-sm font-medium text-gray-600">Stok Rendah</div>
                  <AlertTriangle className="w-4 lg:w-5 h-4 lg:h-5 text-red-500" />
                </div>
                <div className="text-xl lg:text-3xl font-bold text-gray-900">{stats.low_stock}</div>
                <div className="flex items-center text-xs text-red-600 mt-1">
                  <AlertTriangle className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                  <span>Perlu restok</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 - Responsive layout */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100 h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">Produk Terlaris</h3>
                  <p className="text-xs lg:text-sm text-gray-500">Top 5 produk berdasarkan penjualan</p>
                </div>
              </div>
              <div className="h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSales} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" fontSize={12} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100 h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">Kategori Produk</h3>
                  <p className="text-xs lg:text-sm text-gray-500">Distribusi berdasarkan kategori</p>
                </div>
              </div>
              <div className="h-64 lg:h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sales Trend Chart - Full width */}
          <div className="col-span-12">
            <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">Tren Penjualan Mingguan</h3>
                  <p className="text-xs lg:text-sm text-gray-500">Penjualan 7 hari terakhir</p>
                </div>
              </div>
              <div className="h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, fill: "#2563eb" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Insights and Notifications - Side by side on desktop */}
          <div className="col-span-12 lg:col-span-6">
            <AIInsights insights={insights} />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Notifikasi AI
              </h3>
              <div className="space-y-3">
                {stats.low_stock > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Stok Kritis</p>
                        <p className="text-xs text-red-600">{stats.low_stock} produk memerlukan restok segera!</p>
                      </div>
                    </div>
                  </div>
                )}
                {topSales.length > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Tren Naik</p>
                        <p className="text-xs text-orange-600">{topSales[0].name} mengalami peningkatan permintaan</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Package className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Rekomendasi</p>
                      <p className="text-xs text-blue-600">
                        Pertimbangkan bundling produk terlaris untuk meningkatkan penjualan
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
