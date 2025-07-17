"use client"

import { useEffect, useState } from "react"
import {
  Download,
  FileText,
  AlertCircle,
  Lightbulb,
  Box,
  Replace,
  Zap,
  Wrench,
  ShoppingCart,
  PackageCheck,
  PackageX,
  PackageMinus,
  Package,
  PenLineIcon,
  BarChart2,
  ClipboardList,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Truck,
  CalendarDays,
  Tag,
  DollarSign,
  Percent,
  MapPin,
  Hash,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  BarChart,
  Bar,
  Line,
} from "recharts"
import { AppSidebar } from "@/components/Sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import type {
  InventorySummary,
  EquipmentTableItem,
  InventoryTrends,
  InventoryFilters,
  EquipmentCategory,
  AIInventoryRecommendation,
} from "@/types/inventory"
import { fetchInventoryDashboardData, fetchDashboardEquipmentList, fetchAIRecommendations } from "@/services/api"
import { formatCurrency, formatCompactCurrency } from "@/lib/utils"

export default function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null)
  const [equipmentList, setEquipmentList] = useState<EquipmentTableItem[]>([])
  const [inventoryTrends, setInventoryTrends] = useState<InventoryTrends | null>(null)
  const [equipmentCategories, setEquipmentCategories] = useState<EquipmentCategory[]>([])
  const [aiRecommendations, setAIRecommendations] = useState<AIInventoryRecommendation[]>([])
  const [equipmentFilters, setEquipmentFilters] = useState<InventoryFilters>({})
  const [aiRecFilter, setAiRecFilter] = useState<string>("Pending")
  const [selectedAIRecommendation, setSelectedAIRecommendation] = useState<AIInventoryRecommendation | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { toast } = useToast()

  const loadDashboardData = async (filters?: InventoryFilters) => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchInventoryDashboardData(filters)
      setInventorySummary(data.summary)
      setEquipmentList(data.equipmentList)
      setInventoryTrends(data.trends)
      setEquipmentCategories(data.equipmentCategories)
      const initialAI = await fetchAIRecommendations("Pending")
      setAIRecommendations(initialAI)
    } catch (err: any) {
      setError("Failed to load inventory data. Please try again.")
      console.error("Error loading inventory dashboard data:", err)
      toast({
        title: "Error",
        description: "Failed to load inventory data. " + (err.message || String(err)),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyEquipmentFilters = async (filters: InventoryFilters) => {
    try {
      setLoading(true)
      setEquipmentFilters(filters)
      const filteredList = await fetchDashboardEquipmentList(filters)
      setEquipmentList(filteredList)
    } catch (err: any) {
      setError("Failed to filter equipment list.")
      console.error("Error filtering equipment list:", err)
      toast({
        title: "Error",
        description: "Failed to filter equipment list. " + (err.message || String(err)),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    applyEquipmentFilters({ ...equipmentFilters, search_query: searchQuery || undefined })
  }

  const applyAIRecommendationFilter = async (decision: string) => {
    try {
      setLoading(true)
      setAiRecFilter(decision)
      const filteredRecommendations = await fetchAIRecommendations(decision)
      setAIRecommendations(filteredRecommendations)
    } catch (err: any) {
      setError("Failed to filter AI recommendations.")
      console.error("Error filtering AI recommendations:", err)
      toast({
        title: "Error",
        description: "Failed to filter AI recommendations. " + (err.message || String(err)),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Baik":
        return <PackageCheck className="w-5 h-5 text-emerald-500" />
      case "Rusak":
        return <PackageX className="w-5 h-5 text-red-500" />
      case "Dalam Perbaikan":
        return <PackageMinus className="w-5 h-5 text-blue-500" />
      case "Perlu Diganti":
        return <Package className="w-5 h-5 text-yellow-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Baik":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "Rusak":
        return "bg-red-100 text-red-700 border-red-200"
      case "Dalam Perbaikan":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Perlu Diganti":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "Accepted":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case "Pending":
        return <Clock className="w-4 h-4 text-orange-500" />
      case "Declined":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "Deferred":
        return <RotateCcw className="w-4 h-4 text-blue-500" />
      case "Replaced from Backup":
        return <Box className="w-4 h-4 text-purple-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getDecisionBadgeClass = (decision: string) => {
    switch (decision) {
      case "Accepted":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "Pending":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "Declined":
        return "bg-red-100 text-red-700 border-red-200"
      case "Deferred":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Replaced from Backup":
        return "bg-purple-100 text-purple-700 border-purple-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const cleanAiText = (text?: string | null) => {
    return text ? text.replace(/\*\*/g, "").trim() : "N/A"
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
        <AppSidebar />
        <main className="ml-0 lg:ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inventory data...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
        <AppSidebar />
        <main className="ml-0 lg:ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => loadDashboardData()}>Try Again</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
      <AppSidebar />
      <main className="ml-0 lg:ml-64 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">INVENTARIS</h1>
            <p className="text-gray-600 text-xs lg:text-sm">
              Kelola peralatan gym Anda, pantau status, dan dapatkan rekomendasi AI untuk pengadaan.
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 shadow-sm text-xs lg:text-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Report</span>
            </Button>
            <Button
              variant="outline"
              className="border border-gray-300 text-gray-700 font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-xs lg:text-sm bg-white"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Data</span>
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-6 flex-1 overflow-y-auto min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-blue data-[state=active]:shadow-sm rounded-md text-gray-700 hover:text-blue-600 transition-colors"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="equipment-list"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-blue data-[state=active]:shadow-sm rounded-md text-gray-700 hover:text-blue-600 transition-colors"
              >
                Daftar Alat
              </TabsTrigger>
              <TabsTrigger
                value="ai-recommendations"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-blue data-[state=active]:shadow-sm rounded-md text-gray-700 hover:text-blue-600 transition-colors"
              >
                Rekomendasi AI
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-12 gap-4 lg:gap-6">
                {/* Left & Center Column */}
                <div className="col-span-12 xl:col-span-8 space-y-4 lg:space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs lg:text-sm font-medium text-gray-600">Total Alat Aktif</div>
                        <Zap className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                      </div>
                      <div className="text-xl lg:text-3xl font-bold text-gray-900">
                        {inventorySummary?.total_active_equipment ?? 0}
                      </div>
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <span className="text-xs">Unit alat dalam kondisi baik</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                        <div className="bg-emerald-500 h-1 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                    </div>

                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs lg:text-sm font-medium text-gray-600">Total Alat Rusak</div>
                        <PackageX className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                      </div>
                      <div className="text-xl lg:text-3xl font-bold text-gray-900">
                        {inventorySummary?.total_broken_equipment ?? 0}
                      </div>
                      <div className="flex items-center text-xs text-orange-600 mt-1">
                        <span className="text-xs">Unit alat perlu perbaikan atau ganti</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                        <div className="bg-orange-500 h-1 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                    </div>

                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs lg:text-sm font-medium text-gray-600">Gudang Cadangan</div>
                        <Box className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                      </div>
                      <div className="text-xl lg:text-3xl font-bold text-gray-900">
                        {inventorySummary?.total_backup_stock ?? 0}
                      </div>
                      <div className="flex items-center text-xs text-blue-600 mt-1">
                        <span className="text-xs">Unit alat tersedia di gudang</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                    </div>

                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs lg:text-sm font-medium text-gray-600">Total Perlu Diganti</div>
                        <Replace className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                      </div>
                      <div className="text-xl lg:text-3xl font-bold text-gray-900">
                        {inventorySummary?.total_replacement_needed_equipment ?? 0}
                      </div>
                      <div className="flex items-center text-xs text-purple-600 mt-1">
                        <span className="text-xs">Unit alat butuh penggantian segera</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                        <div className="bg-purple-500 h-1 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                    </div>

                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs lg:text-sm font-medium text-gray-600">Dalam Perbaikan</div>
                        <Wrench className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                      </div>
                      <div className="text-xl lg:text-3xl font-bold text-gray-900">
                        {inventorySummary?.total_in_maintenance_equipment ?? 0}
                      </div>
                      <div className="flex items-center text-xs text-orange-600 mt-1">
                        <span className="text-xs">Unit alat sedang diperbaiki</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                        <div className="bg-orange-500 h-1 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                    </div>

                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs lg:text-sm font-medium text-gray-600">Total Nilai Aset</div>
                        <ShoppingCart className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                      </div>
                      <div className="text-xl lg:text-3xl font-bold text-gray-900">
                        {formatCompactCurrency(inventorySummary?.total_equipment_value ?? 0)}
                      </div>
                      <div className="flex items-center text-xs text-emerald-600 mt-1">
                        <span className="text-xs">Total nilai aset pembelian alat</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                        <div className="bg-emerald-500 h-1 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Trends Chart */}
                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <div>
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900">Tren & Penggunaan Alat</h3>
                        <p className="text-xs lg:text-sm text-gray-500">
                          Jumlah alat beroperasi per bulan & alat paling sering digunakan
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-64 lg:h-80">
                      {/* Operational Equipment Trend */}
                      <div className="h-full">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                          <PenLineIcon className="w-4 h-4" /> Tren Alat Beroperasi per Bulan
                        </h4>
                        {inventoryTrends?.operational_equipment_trend &&
                        inventoryTrends.operational_equipment_trend.length > 0 ? (
                          <ResponsiveContainer width="100%" height="90%">
                            <RechartsLineChart data={inventoryTrends.operational_equipment_trend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                              <XAxis
                                dataKey="month"
                                stroke="#666"
                                fontSize={10}
                                tickFormatter={(value) => {
                                  const [year, month] = value.split("-")
                                  return `Bulan ${month} ${year}`
                                }}
                                interval="preserveStartEnd"
                              />
                              <YAxis stroke="#666" fontSize={10} allowDecimals={false} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "8px",
                                }}
                                formatter={(value: any) => [value, "Jumlah Beroperasi"]}
                              />
                              <Line
                                type="monotone"
                                dataKey="operational_equipment"
                                stroke="#22c55e"
                                strokeWidth={2}
                                dot={{ fill: "#22c55e", r: 3 }}
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                            Tidak ada data alat beroperasi.
                          </div>
                        )}
                      </div>

                      {/* Most Used Equipment */}
                      <div className="h-full">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                          <BarChart2 className="w-4 h-4" /> Alat Paling Sering Digunakan
                        </h4>
                        {inventoryTrends?.most_used_equipment && inventoryTrends.most_used_equipment.length > 0 ? (
                          <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={inventoryTrends.most_used_equipment}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis
                                dataKey="name"
                                stroke="#666"
                                fontSize={10}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis stroke="#666" fontSize={10} allowDecimals={false} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "8px",
                                }}
                                formatter={(value: any) => [value, "Jumlah Penggunaan"]}
                              />
                              <Bar dataKey="usage_count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                            Tidak ada data penggunaan alat.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Status Change Logs */}
                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                        Riwayat Perubahan Status Alat
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Nama Alat</TableHead>
                            <TableHead>Status Lama</TableHead>
                            <TableHead>Status Baru</TableHead>
                            <TableHead>Oleh</TableHead>
                            <TableHead>Alasan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inventoryTrends?.recent_status_logs && inventoryTrends.recent_status_logs.length > 0 ? (
                            inventoryTrends.recent_status_logs.map((log) => (
                              <TableRow key={log.log_id}>
                                <TableCell className="text-sm">
                                  {new Date(log.change_date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-sm">{log.equipment_name}</TableCell>
                                <TableCell className="text-sm">
                                  <Badge variant="outline" className={getStatusBadgeClass(log.old_status || "N/A")}>
                                    {log.old_status || "N/A"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  <Badge variant="outline" className={getStatusBadgeClass(log.new_status)}>
                                    {log.new_status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">{log.changed_by}</TableCell>
                                <TableCell className="text-sm">{cleanAiText(log.change_reason)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                                Tidak ada riwayat perubahan status.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - AI Recommendation */}
                <div className="col-span-12 xl:col-span-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 lg:p-6 rounded-lg shadow-lg text-white sticky top-6">
                    <div className="pb-4">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                        <Lightbulb className="w-5 h-5" />
                        REKOMENDASI AI TERBARU
                      </h3>
                    </div>
                    {inventorySummary?.latest_ai_recommendation ? (
                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 space-y-3">
                        <p className="text-xs opacity-80">
                          {new Date(inventorySummary.latest_ai_recommendation.timestamp).toLocaleString()}
                        </p>
                        <h4 className="font-semibold text-lg">
                          {cleanAiText(inventorySummary.latest_ai_recommendation.recommended_equipment_name)}
                        </h4>
                        <p className="text-sm opacity-90 leading-relaxed">
                          {cleanAiText(inventorySummary.latest_ai_recommendation.ai_reasoning)}
                        </p>
                        <div className="text-xs opacity-90 flex flex-col gap-1">
                          <span>
                            Estimasi Harga:{" "}
                            {formatCurrency(inventorySummary.latest_ai_recommendation.estimated_cost ?? 0)}
                          </span>
                          <span>
                            Kategori:{" "}
                            {cleanAiText(
                              inventorySummary.latest_ai_recommendation.recommended_category?.category_name || "N/A",
                            )}
                          </span>
                          <span>
                            Waktu Pembelian:{" "}
                            {cleanAiText(inventorySummary.latest_ai_recommendation.ai_predicted_purchase_time)}
                          </span>
                          <span>
                            Margin Profit Saat Ini:{" "}
                            {inventorySummary.latest_ai_recommendation.current_profit_margin_percent?.toFixed(1) ??
                              "N/A"}
                            %
                          </span>
                          {inventorySummary.latest_ai_recommendation.trigger_equipment && (
                            <span>
                              Pemicu: {cleanAiText(inventorySummary.latest_ai_recommendation.trigger_equipment.name)} (
                              {cleanAiText(inventorySummary.latest_ai_recommendation.trigger_equipment.status)})
                            </span>
                          )}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="secondary"
                              className="w-full text-blue-800 bg-blue-50 hover:bg-blue-100 mt-4"
                              onClick={() =>
                                setSelectedAIRecommendation(inventorySummary.latest_ai_recommendation ?? null)
                              }
                            >
                              Lihat Detail Rekomendasi
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] bg-white text-gray-900">
                            <DialogHeader>
                              <DialogTitle className="text-gray-900">Detail Rekomendasi AI</DialogTitle>
                              <DialogDescription className="text-gray-600">
                                Informasi lengkap rekomendasi AI untuk pengadaan/penggantian alat.
                              </DialogDescription>
                            </DialogHeader>
                            {selectedAIRecommendation && (
                              <div className="grid gap-4 py-4 text-sm text-gray-800">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 mb-1 text-gray-800">
                                    <Package className="w-4 h-4 text-gray-600" />
                                    <h5 className="font-semibold">Rekomendasi</h5>
                                  </div>
                                  <p className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-gray-500" />
                                    <strong className="text-gray-700">Nama Alat:</strong>{" "}
                                    {cleanAiText(selectedAIRecommendation.recommended_equipment_name)}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-gray-500" />
                                    <strong className="text-gray-700">Kategori:</strong>{" "}
                                    {cleanAiText(selectedAIRecommendation.recommended_category?.category_name || "N/A")}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                    <strong className="text-gray-700">Estimasi Biaya:</strong>{" "}
                                    {formatCurrency(selectedAIRecommendation.estimated_cost ?? 0)}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-gray-500" />
                                    <strong className="text-gray-700">Waktu Pembelian:</strong>{" "}
                                    {cleanAiText(selectedAIRecommendation.ai_predicted_purchase_time)}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <Percent className="w-4 h-4 text-gray-500" />
                                    <strong className="text-gray-700">Margin Profit Saat Ini:</strong>{" "}
                                    {selectedAIRecommendation.current_profit_margin_percent?.toFixed(1) ?? "N/A"}%
                                  </p>
                                </div>
                                <Separator />
                                {selectedAIRecommendation.trigger_equipment && (
                                  <>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 mb-1 text-gray-800">
                                        <Wrench className="w-4 h-4 text-gray-600" />
                                        <h5 className="font-semibold">Detail Alat Pemicu</h5>
                                      </div>
                                      <p className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-gray-500" />
                                        <strong className="text-gray-700">Nama Alat:</strong>{" "}
                                        {cleanAiText(selectedAIRecommendation.trigger_equipment.name)}
                                      </p>
                                      <p className="flex items-center gap-2">
                                        {getStatusIcon(selectedAIRecommendation.trigger_equipment.status)}
                                        <strong className="text-gray-700">Status:</strong>{" "}
                                        {cleanAiText(selectedAIRecommendation.trigger_equipment.status)}
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <strong className="text-gray-700">Lokasi:</strong>{" "}
                                        {cleanAiText(selectedAIRecommendation.trigger_equipment.location)}
                                      </p>
                                      {selectedAIRecommendation.trigger_equipment.serial_number && (
                                        <p className="flex items-center gap-2">
                                          <Hash className="w-4 h-4 text-gray-500" />
                                          <strong className="text-gray-700">No. Seri:</strong>{" "}
                                          {cleanAiText(selectedAIRecommendation.trigger_equipment.serial_number)}
                                        </p>
                                      )}
                                      {selectedAIRecommendation.trigger_equipment.purchase_date && (
                                        <p className="flex items-center gap-2">
                                          <CalendarDays className="w-4 h-4 text-gray-500" />
                                          <strong className="text-gray-700">Tgl Beli:</strong>{" "}
                                          {new Date(
                                            selectedAIRecommendation.trigger_equipment.purchase_date,
                                          ).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                    <Separator />
                                  </>
                                )}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 mb-1 text-gray-800">
                                    <Lightbulb className="w-4 h-4 text-gray-600" />
                                    <h5 className="font-semibold">Insight AI</h5>
                                  </div>
                                  <p>
                                    <strong className="text-gray-700">Alasan AI:</strong>{" "}
                                    {cleanAiText(selectedAIRecommendation.ai_reasoning)}
                                  </p>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 mb-1 text-gray-800">
                                    <ClipboardList className="w-4 h-4 text-gray-600" />
                                    <h5 className="font-semibold">Keputusan Manajer</h5>
                                  </div>
                                  <p className="flex items-center gap-2">
                                    <strong className="text-gray-700">Status:</strong>
                                    <Badge
                                      variant="outline"
                                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getDecisionBadgeClass(selectedAIRecommendation.manager_decision)}`}
                                    >
                                      {selectedAIRecommendation.manager_decision}
                                    </Badge>
                                  </p>
                                  {selectedAIRecommendation.decision_date && (
                                    <p className="flex items-center gap-2">
                                      <CalendarDays className="w-4 h-4 text-gray-500" />
                                      <strong className="text-gray-700">Tgl Keputusan:</strong>{" "}
                                      {new Date(selectedAIRecommendation.decision_date).toLocaleDateString()}
                                    </p>
                                  )}
                                  {selectedAIRecommendation.notes_manager && (
                                    <p>
                                      <strong className="text-gray-700">Catatan:</strong>{" "}
                                      {cleanAiText(selectedAIRecommendation.notes_manager)}
                                    </p>
                                  )}
                                </div>
                                <Separator />
                                {selectedAIRecommendation.contact_supplier_details && (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1 text-gray-800">
                                      <Truck className="w-4 h-4 text-gray-600" />
                                      <h5 className="font-semibold">Kontak Supplier</h5>
                                    </div>
                                    <p className="flex items-center gap-2">
                                      {selectedAIRecommendation.contact_supplier_details.includes("whatsapp.com") ||
                                      selectedAIRecommendation.contact_supplier_details.includes("wa.me") ? (
                                        <a
                                          href={selectedAIRecommendation.contact_supplier_details}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                          <MessageCircle className="w-4 h-4" /> WhatsApp
                                        </a>
                                      ) : selectedAIRecommendation.contact_supplier_details.includes("@") ? (
                                        <a
                                          href={`mailto:${selectedAIRecommendation.contact_supplier_details}`}
                                          className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                          <Mail className="w-4 h-4" /> Email
                                        </a>
                                      ) : (
                                        <span className="flex items-center gap-1">
                                          <Phone className="w-4 h-4" />{" "}
                                          {cleanAiText(selectedAIRecommendation.contact_supplier_details)}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <div className="text-center text-white/80 py-8">Tidak ada rekomendasi AI terbaru.</div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Equipment List Tab */}
            <TabsContent value="equipment-list" className="space-y-4 lg:space-y-6 w-full">
              {/* Equipment Filters */}
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm w-full">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900">Filter Alat</h2>
                    <p className="text-xs lg:text-sm text-gray-500">Cari dan filter peralatan gym</p>
                  </div>
                  <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                    <Select
                      value={equipmentFilters.category_name || "all"}
                      onValueChange={(value) =>
                        applyEquipmentFilters({
                          ...equipmentFilters,
                          category_name: value === "all" ? undefined : value,
                        })
                      }
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {equipmentCategories.map((category) => (
                          <SelectItem key={category.category_id} value={category.category_name}>
                            {category.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Cari alat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearch()
                          }
                        }}
                        className="w-full sm:w-64"
                      />
                      <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                        Cari
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Table - Full Width Container */}
              <div className="bg-white rounded-lg shadow-sm w-full max-w-none">
                <div className="w-full">
                  <div className="overflow-x-auto">
                    <Table className="w-full table-fixed">
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-900 w-16 text-left">No.</TableHead>
                          <TableHead className="font-semibold text-gray-900 w-2/5 text-left">Nama Alat</TableHead>
                          <TableHead className="font-semibold text-gray-900 w-1/5 text-left">Status</TableHead>
                          <TableHead className="font-semibold text-gray-900 w-1/5 text-left">Kategori</TableHead>
                          <TableHead className="font-semibold text-gray-900 w-1/5 text-left">Lokasi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {equipmentList.length > 0 ? (
                          equipmentList.map((equipment, index) => (
                            <TableRow
                              key={equipment.equipment_id}
                              className="hover:bg-gray-50 border-b border-gray-100"
                            >
                              <TableCell className="text-sm font-medium py-4">{index + 1}</TableCell>
                              <TableCell className="text-sm font-medium text-gray-900 py-4">
                                {equipment.name}
                              </TableCell>
                              <TableCell className="text-sm py-4">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(equipment.status)}
                                  <Badge variant="outline" className={getStatusBadgeClass(equipment.status)}>
                                    {equipment.status}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600 py-4">{equipment.category_name}</TableCell>
                              <TableCell className="text-sm text-gray-600 py-4">{equipment.location}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500 py-12">
                              <div className="flex flex-col items-center gap-2">
                                <Package className="w-8 h-8 text-gray-400" />
                                <p className="font-medium">Tidak ada data peralatan yang ditemukan.</p>
                                <p className="text-xs">Coba ubah filter atau kata kunci pencarian.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* AI Recommendations Tab */}
            <TabsContent value="ai-recommendations" className="space-y-4 lg:space-y-6">
              {/* AI Recommendation Filters */}
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900">Filter Rekomendasi AI</h2>
                    <p className="text-xs lg:text-sm text-gray-500">Filter berdasarkan status keputusan manajer</p>
                  </div>
                  <Select value={aiRecFilter} onValueChange={applyAIRecommendationFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Accepted">Diterima</SelectItem>
                      <SelectItem value="Pending">Menunggu</SelectItem>
                      <SelectItem value="Declined">Ditolak</SelectItem>
                      <SelectItem value="Deferred">Ditunda</SelectItem>
                      <SelectItem value="Replaced from Backup">Diganti dari Cadangan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* AI Recommendations Grid */}
              {aiRecommendations.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {aiRecommendations.map((recommendation) => (
                    <Dialog key={recommendation.recommendation_id}>
                      <DialogTrigger asChild>
                        <div
                          className="bg-white p-4 lg:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-blue-200"
                          onClick={() => setSelectedAIRecommendation(recommendation)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-base font-semibold text-gray-900 mb-1">
                                {cleanAiText(recommendation.recommended_equipment_name)}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {new Date(recommendation.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getDecisionBadgeClass(recommendation.manager_decision)}`}
                            >
                              {getDecisionIcon(recommendation.manager_decision)}
                              <span className="ml-1">{recommendation.manager_decision}</span>
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                            {cleanAiText(recommendation.ai_reasoning)}
                          </p>

                          <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-3 h-3" />
                              <span className="font-medium">{formatCurrency(recommendation.estimated_cost ?? 0)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClipboardList className="w-3 h-3" />
                              <span>{cleanAiText(recommendation.recommended_category?.category_name || "N/A")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="w-3 h-3" />
                              <span>{cleanAiText(recommendation.ai_predicted_purchase_time)}</span>
                            </div>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white text-gray-900">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900">Detail Rekomendasi AI</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Informasi lengkap rekomendasi AI untuk pengadaan/penggantian alat.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedAIRecommendation && (
                          <div className="grid gap-4 py-4 text-sm text-gray-800">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 mb-1 text-gray-800">
                                <Package className="w-4 h-4 text-gray-600" />
                                <h5 className="font-semibold">Rekomendasi</h5>
                              </div>
                              <p className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-gray-500" />
                                <strong className="text-gray-700">Nama Alat:</strong>{" "}
                                {cleanAiText(selectedAIRecommendation.recommended_equipment_name)}
                              </p>
                              <p className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-gray-500" />
                                <strong className="text-gray-700">Kategori:</strong>{" "}
                                {cleanAiText(selectedAIRecommendation.recommended_category?.category_name || "N/A")}
                              </p>
                              <p className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <strong className="text-gray-700">Estimasi Biaya:</strong>{" "}
                                {formatCurrency(selectedAIRecommendation.estimated_cost ?? 0)}
                              </p>
                              <p className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-gray-500" />
                                <strong className="text-gray-700">Waktu Pembelian:</strong>{" "}
                                {cleanAiText(selectedAIRecommendation.ai_predicted_purchase_time)}
                              </p>
                              <p className="flex items-center gap-2">
                                <Percent className="w-4 h-4 text-gray-500" />
                                <strong className="text-gray-700">Margin Profit Saat Ini:</strong>{" "}
                                {selectedAIRecommendation.current_profit_margin_percent?.toFixed(1) ?? "N/A"}%
                              </p>
                            </div>
                            <Separator />
                            {selectedAIRecommendation.trigger_equipment && (
                              <>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 mb-1 text-gray-800">
                                    <Wrench className="w-4 h-4 text-gray-600" />
                                    <h5 className="font-semibold">Detail Alat Pemicu</h5>
                                  </div>
                                  <p className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-gray-500" />
                                    <strong className="text-gray-700">Nama Alat:</strong>{" "}
                                    {cleanAiText(selectedAIRecommendation.trigger_equipment.name)}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    {getStatusIcon(selectedAIRecommendation.trigger_equipment.status)}
                                    <strong className="text-gray-700">Status:</strong>{" "}
                                    {cleanAiText(selectedAIRecommendation.trigger_equipment.status)}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <strong className="text-gray-700">Lokasi:</strong>{" "}
                                    {cleanAiText(selectedAIRecommendation.trigger_equipment.location)}
                                  </p>
                                  {selectedAIRecommendation.trigger_equipment.serial_number && (
                                    <p className="flex items-center gap-2">
                                      <Hash className="w-4 h-4 text-gray-500" />
                                      <strong className="text-gray-700">No. Seri:</strong>{" "}
                                      {cleanAiText(selectedAIRecommendation.trigger_equipment.serial_number)}
                                    </p>
                                  )}
                                  {selectedAIRecommendation.trigger_equipment.purchase_date && (
                                    <p className="flex items-center gap-2">
                                      <CalendarDays className="w-4 h-4 text-gray-500" />
                                      <strong className="text-gray-700">Tgl Beli:</strong>{" "}
                                      {new Date(
                                        selectedAIRecommendation.trigger_equipment.purchase_date,
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <Separator />
                              </>
                            )}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 mb-1 text-gray-800">
                                <Lightbulb className="w-4 h-4 text-gray-600" />
                                <h5 className="font-semibold">Insight AI</h5>
                              </div>
                              <p>
                                <strong className="text-gray-700">Alasan AI:</strong>{" "}
                                {cleanAiText(selectedAIRecommendation.ai_reasoning)}
                              </p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 mb-1 text-gray-800">
                                <ClipboardList className="w-4 h-4 text-gray-600" />
                                <h5 className="font-semibold">Keputusan Manajer</h5>
                              </div>
                              <p className="flex items-center gap-2">
                                <strong className="text-gray-700">Status:</strong>
                                <Badge
                                  variant="outline"
                                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getDecisionBadgeClass(selectedAIRecommendation.manager_decision)}`}
                                >
                                  {selectedAIRecommendation.manager_decision}
                                </Badge>
                              </p>
                              {selectedAIRecommendation.decision_date && (
                                <p className="flex items-center gap-2">
                                  <CalendarDays className="w-4 h-4 text-gray-500" />
                                  <strong className="text-gray-700">Tgl Keputusan:</strong>{" "}
                                  {new Date(selectedAIRecommendation.decision_date).toLocaleDateString()}
                                </p>
                              )}
                              {selectedAIRecommendation.notes_manager && (
                                <p>
                                  <strong className="text-gray-700">Catatan:</strong>{" "}
                                  {cleanAiText(selectedAIRecommendation.notes_manager)}
                                </p>
                              )}
                            </div>
                            <Separator />
                            {selectedAIRecommendation.contact_supplier_details && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1 text-gray-800">
                                  <Truck className="w-4 h-4 text-gray-600" />
                                  <h5 className="font-semibold">Kontak Supplier</h5>
                                </div>
                                <p className="flex items-center gap-2">
                                  {selectedAIRecommendation.contact_supplier_details.includes("whatsapp.com") ||
                                  selectedAIRecommendation.contact_supplier_details.includes("wa.me") ? (
                                    <a
                                      href={selectedAIRecommendation.contact_supplier_details}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <MessageCircle className="w-4 h-4" /> WhatsApp
                                    </a>
                                  ) : selectedAIRecommendation.contact_supplier_details.includes("@") ? (
                                    <a
                                      href={`mailto:${selectedAIRecommendation.contact_supplier_details}`}
                                      className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <Mail className="w-4 h-4" /> Email
                                    </a>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-4 h-4" />{" "}
                                      {cleanAiText(selectedAIRecommendation.contact_supplier_details)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                  <div className="text-gray-500 mb-4">
                    <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-lg font-medium">Tidak ada rekomendasi AI</p>
                    <p className="text-sm">Tidak ada rekomendasi AI dalam status ini.</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
