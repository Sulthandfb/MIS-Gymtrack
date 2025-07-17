"use client"
import { useState, useEffect } from "react"
import {
  Calendar,
  AlertTriangle,
  Search,
  FileText,
  Download,
  UserPlus,
  Heart,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts"
import { AppSidebar } from "@/components/Sidebar"
import { StatCard } from "@/components/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AIInsights } from "@/components/AIInsights"
import { fetchTrainerDashboardData } from "@/services/api"
import type { TrainerDashboardData } from "@/types/trainer"

export default function TrainerDashboard() {
  const [dashboardData, setDashboardData] = useState<TrainerDashboardData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Keep original state for filters
  const [periode, setPeriode] = useState("Minggu Ini")
  const [trainer, setTrainer] = useState("Semua Trainer")
  const [jenisKelas, setJenisKelas] = useState("Semua Kelas")
  const [filterName, setFilterName] = useState("")

  useEffect(() => {
    const loadTrainerDashboard = async () => {
      try {
        setLoading(true)
        const data = await fetchTrainerDashboardData()
        setDashboardData(data)
      } catch (err) {
        console.error("Failed to load trainer dashboard data:", err)
        setError("Failed to load data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    loadTrainerDashboard()
  }, [])

  const handleViewTrainerDetail = (trainerId: number) => {
    window.location.href = `/trainer/${trainerId}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "warning":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "poor":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
        <AppSidebar />
        <main className="ml-0 lg:ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trainer data...</p>
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
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </main>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
        <AppSidebar />
        <main className="ml-0 lg:ml-64 flex-1 flex items-center justify-center">
          <p className="text-gray-600">Tidak ada data dashboard yang tersedia.</p>
        </main>
      </div>
    )
  }

  const {
    stats,
    classParticipantsData,
    satisfactionTrendData,
    classTypeData,
    courseComparisonData,
    trainerPerformanceData,
    insights,
    alerts,
  } = dashboardData

  const filteredTrainerPerformanceData = trainerPerformanceData.filter((trainer) =>
    trainer.name.toLowerCase().includes(filterName.toLowerCase()),
  )

  // Colors for Pie Chart and Line Chart lines, matching original dashboard's colors
  const CHART_COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6"]

  return (
    <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
      <AppSidebar />
      <main className="ml-0 lg:ml-64 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">TRAINER</h1>
            <p className="text-gray-600 text-xs lg:text-sm">
              Kelola dan pantau kinerja trainer dengan insight AI untuk optimasi performa.
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
        {/* Page Content */}
        <div className="p-4 lg:p-6 flex-1 overflow-y-auto min-h-0">
          {/* Tabs and Filters */}
          <div className="mb-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-1 inline-flex mb-4">
              <button className="px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white shadow-sm">
                Insights
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed">
                Daftar Trainer
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <label htmlFor="periode" className="text-gray-600 whitespace-nowrap">
                  Periode:
                </label>
                <Select value={periode} onValueChange={setPeriode}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minggu Ini">Minggu Ini</SelectItem>
                    <SelectItem value="Bulan Ini">Bulan Ini</SelectItem>
                    <SelectItem value="3 Bulan Terakhir">3 Bulan Terakhir</SelectItem>
                    <SelectItem value="Tahun Ini">Tahun Ini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="trainer" className="text-gray-600 whitespace-nowrap">
                  Trainer:
                </label>
                <Select value={trainer} onValueChange={setTrainer}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua Trainer">Semua Trainer</SelectItem>
                    <SelectItem value="Senior Trainer">Senior Trainer</SelectItem>
                    <SelectItem value="Junior Trainer">Junior Trainer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="jenis-kelas" className="text-gray-600 whitespace-nowrap">
                  Jenis Kelas:
                </label>
                <Select value={jenisKelas} onValueChange={setJenisKelas}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua Kelas">Semua Kelas</SelectItem>
                    <SelectItem value="Strength">Strength</SelectItem>
                    <SelectItem value="Cardio">Cardio</SelectItem>
                    <SelectItem value="Yoga">Yoga</SelectItem>
                    <SelectItem value="HIIT">HIIT</SelectItem>
                    <SelectItem value="Pilates">Pilates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* Content Area */}
          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            <div className="col-span-12 xl:col-span-8 space-y-4 lg:space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-6">
                <StatCard
                  title="Jumlah Kelas Mingguan"
                  value={stats.weekly_classes}
                  icon={Calendar}
                  trend={{ value: 1.6, isPositive: true }}
                  color="blue"
                />
                <StatCard
                  title="Trainer Aktif"
                  value={stats.active_trainers}
                  icon={UserPlus}
                  trend={{ value: 2, isPositive: true }}
                  color="orange"
                />
                <StatCard
                  title="Kelas dengan Engagement Tinggi"
                  value={stats.high_engagement_classes}
                  icon={Heart}
                  trend={{ value: 15, isPositive: true }}
                  color="emerald"
                />
                <StatCard
                  title="Rata-rata Kepuasan Kelas"
                  value={stats.avg_satisfaction.toFixed(1)}
                  icon={Sparkles}
                  trend={{ value: 0.2, isPositive: true }}
                  color="purple"
                />
              </div>
              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <Card className="shadow-sm">
                  <CardHeader className="p-4 lg:p-6 pb-0">
                    <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">
                      Jumlah Peserta per Kelas Offline
                    </CardTitle>
                    <p className="text-xs lg:text-sm text-gray-500">
                      Perbandingan jumlah kelas yang dijalankan per trainer
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 pt-4">
                    <div className="h-64 lg:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={classParticipantsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="trainer" stroke="#666" fontSize={12} />
                          <YAxis stroke="#666" domain={[0, 32]} ticks={[0, 8, 16, 24, 32]} fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="strength" fill={CHART_COLORS[0]} name="Strength" stackId="a" barSize={12} />
                          <Bar dataKey="yoga" fill={CHART_COLORS[1]} name="Yoga" stackId="a" barSize={12} />
                          <Bar dataKey="cardio" fill={CHART_COLORS[2]} name="Cardio" stackId="a" barSize={12} />
                          <Bar dataKey="pilates" fill={CHART_COLORS[3]} name="HIIT" stackId="a" barSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg mt-4">
                      <p className="text-xs text-blue-700">
                        <strong>Insight:</strong> Kelas Yoga oleh Scarlett J. memiliki tingkat kehadiran rendah
                        (rata-rata 5 peserta per kelas jadwal atau metode pengajaran.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader className="p-4 lg:p-6 pb-0">
                    <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">
                      Tipe Kelas yang Sering Diambil
                    </CardTitle>
                    <p className="text-xs lg:text-sm text-gray-500">Distribusi jenis kelas berdasarkan popularitas</p>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 pt-4">
                    <div className="h-48 lg:h-56 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={classTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            isAnimationActive={false}
                          >
                            {classTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value}%`, "Persentase"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 lg:gap-4 text-xs mt-4">
                      {classTypeData.map((item, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          ></div>
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Satisfaction Trend Chart */}
              <Card className="shadow-sm">
                <CardHeader className="p-4 lg:p-6 pb-0">
                  <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">
                    Trend Kepuasan User per Trainer
                  </CardTitle>
                  <p className="text-xs lg:text-sm text-gray-500">Rating kepuasan member (skala 1-5)</p>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-4">
                  <div className="h-64 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={satisfactionTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="week" stroke="#666" fontSize={12} />
                        <YAxis domain={[3.5, 5.0]} stroke="#666" fontSize={12} />
                        <ReferenceLine
                          y={4.5}
                          stroke="#ef4444"
                          strokeDasharray="5 5"
                          label={{ value: "Target", position: "insideTopRight", fill: "#ef4444" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        {Object.keys(satisfactionTrendData[0] || {})
                          .filter((key) => key !== "week")
                          .map((trainerNameKey, index) => (
                            <Line
                              key={trainerNameKey}
                              type="monotone"
                              dataKey={trainerNameKey}
                              stroke={CHART_COLORS[index % CHART_COLORS.length]}
                              strokeWidth={2}
                              name={trainerNameKey.charAt(0).toUpperCase() + trainerNameKey.slice(1)}
                              dot={{ r: 4, fill: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                          ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              {/* Trainer Performance Table */}
              <Card className="shadow-sm">
                <CardHeader className="p-4 lg:p-6 pb-0">
                  <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">
                    Tabel Kinerja Trainer
                  </CardTitle>
                  <p className="text-xs lg:text-sm text-gray-500">Perbandingan Kinerja Semua Trainer Aktif</p>
                  <div className="relative mt-2">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="Filter by name"
                      className="pl-10 pr-4 py-2 w-64"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-900">Nama</TableHead>
                          <TableHead className="font-semibold text-gray-900">Spesialisasi</TableHead>
                          <TableHead className="font-semibold text-gray-900">Kelas</TableHead>
                          <TableHead className="font-semibold text-gray-900">Feedback</TableHead>
                          <TableHead className="font-semibold text-gray-900">Retensi</TableHead>
                          <TableHead className="font-semibold text-gray-900">Member Aktif</TableHead>
                          <TableHead className="font-semibold text-gray-900">Status</TableHead>
                          <TableHead className="font-semibold text-gray-900">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTrainerPerformanceData.map((trainer) => (
                          <TableRow key={trainer.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-gray-900">{trainer.name}</TableCell>
                            <TableCell className="text-sm">{trainer.specialization}</TableCell>
                            <TableCell className="text-sm">{trainer.classes}</TableCell>
                            <TableCell className="text-sm">{trainer.feedback}/5</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(trainer.status)}>
                                {trainer.retention}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{trainer.activeMembers}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(trainer.status)}>
                                {trainer.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleViewTrainerDetail(trainer.id)}>
                                Detail
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              {/* Bottom Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <Card className="shadow-sm">
                  <CardHeader className="p-4 lg:p-6 pb-0">
                    <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">
                      Analitik Konversi
                    </CardTitle>
                    <p className="text-xs lg:text-sm text-gray-500">Rating kepuasan member (skala 1-5)</p>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 pt-4">
                    <div className="h-48 lg:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={satisfactionTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="week" stroke="#666" fontSize={12} />
                          <YAxis domain={[3.5, 5.0]} stroke="#666" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          {Object.keys(satisfactionTrendData[0] || {})
                            .filter((key) => key !== "week")
                            .map((trainerNameKey, index) => (
                              <Line
                                key={trainerNameKey}
                                type="monotone"
                                dataKey={trainerNameKey}
                                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                strokeWidth={2}
                                name={trainerNameKey.charAt(0).toUpperCase() + trainerNameKey.slice(1)}
                                dot={{ r: 4, fill: CHART_COLORS[index % CHART_COLORS.length] }}
                              />
                            ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader className="p-4 lg:p-6 pb-0">
                    <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">
                      Evaluasi Per Kursus
                    </CardTitle>
                    <p className="text-xs lg:text-sm text-gray-500">Perbandingan efektivitas kursus offline vs AI</p>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 pt-4">
                    <div className="h-48 lg:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courseComparisonData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} fontSize={12} />
                          <YAxis type="category" dataKey="type" fontSize={12} />
                          <Tooltip />
                          <Bar dataKey="offline" fill={CHART_COLORS[0]} name="Kursus Offline" barSize={10} />
                          <Bar dataKey="online" fill="#e5e7eb" name="AI" barSize={10} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Right Sidebar */}
            <div className="col-span-12 xl:col-span-4 space-y-4 lg:space-y-6">
              {/* AI Insights */}
              <AIInsights insights={insights} />
              {/* Alerts & Recommendations */}
              <Card className="shadow-sm">
                <CardHeader className="p-4 lg:p-6 pb-0">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    ALERT
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-4 space-y-3">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        alert.priority === "high"
                          ? "border-red-200 bg-red-50"
                          : alert.priority === "medium"
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-green-200 bg-green-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className={`w-4 h-4 ${
                              alert.priority === "high"
                                ? "text-red-500"
                                : alert.priority === "medium"
                                  ? "text-yellow-500"
                                  : "text-green-500"
                            }`} />
                            <p
                              className={`font-semibold text-sm ${
                                alert.priority === "high"
                                  ? "text-red-800"
                                  : alert.priority === "medium"
                                    ? "text-yellow-800"
                                    : "text-green-800"
                              }`}
                            >
                              {alert.title}
                            </p>
                          </div>
                          <p
                            className={`text-xs ${
                              alert.priority === "high"
                                ? "text-red-600"
                                : alert.priority === "medium"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {alert.message}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs font-bold ml-2 ${
                            alert.priority === "high"
                              ? "bg-red-200 text-red-800 border-red-300"
                              : alert.priority === "medium"
                                ? "bg-yellow-200 text-yellow-800 border-yellow-300"
                                : "bg-green-200 text-green-800 border-green-300"
                          }`}
                        >
                          {alert.priority === "high" ? "TINGGI" : alert.priority === "medium" ? "SEDANG" : "RENDAH"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
