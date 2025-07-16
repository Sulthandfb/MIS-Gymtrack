"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  Search,
  FileText,
  Download,
  UserPlus,
  Heart,
  Sparkles,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
        return "bg-emerald-100 text-emerald-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "warning":
        return "bg-orange-100 text-orange-800"
      case "poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLucideIcon = (iconName: string) => {
    const icons: { [key: string]: React.ElementType } = {
      TrendingUp: TrendingUp,
      AlertTriangle: AlertTriangle,
      Lightbulb: Lightbulb,
      AcademicCapIcon: Calendar, // Closest match for "Jumlah Kelas Mingguan"
      FireIcon: UserPlus, // For "Trainer Aktif"
      HeartIcon: Heart, // For "Kelas dengan Engagement Tinggi"
      SparklesIcon: Sparkles, // For "Rata-rata Kepuasan Kelas"
    }
    return icons[iconName] || Lightbulb
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center lg:ml-64">
          <p className="text-gray-600">Memuat data dashboard trainer...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center lg:ml-64">
          <p className="text-red-600">{error}</p>
        </main>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center lg:ml-64">
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
    <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800">
      <AppSidebar />
      <main className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TRAINER</h1>
            <p className="text-gray-600 text-sm">Kelola dan pantau kinerja trainer</p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm">
              <FileText className="w-4 h-4" /> Tambah Laporan
            </Button>
            <Button
              variant="outline"
              className="border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-50 bg-transparent"
            >
              <Download className="w-4 h-4" /> Ekspor Data
            </Button>
            <span className="text-sm font-medium">Indonesia</span>
            <div className="flex items-center gap-3">
              <img
                src="/placeholder.svg?height=36&width=36"
                className="h-9 w-9 rounded-full object-cover"
                alt="MarkLee"
              />
            </div>
          </div>
        </header>
        {/* Page Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Tabs and Filters */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-semibold border-b-2 border-blue-600 text-blue-600">
                  Insights
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed">
                  Daftar Trainer
                </button>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm mt-4">
              <div className="flex items-center gap-2">
                <label htmlFor="periode" className="text-gray-600">
                  Periode:
                </label>
                <div className="relative">
                  <select
                    id="periode"
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 pr-8"
                  >
                    <option>Minggu Ini</option>
                    <option>Bulan Ini</option>
                    <option>3 Bulan Terakhir</option>
                    <option>Tahun Ini</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="trainer" className="text-gray-600">
                  Trainer:
                </label>
                <div className="relative">
                  <select
                    id="trainer"
                    value={trainer}
                    onChange={(e) => setTrainer(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 pr-8"
                  >
                    <option>Semua Trainer</option>
                    <option>Senior Trainer</option>
                    <option>Junior Trainer</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="jenis-kelas" className="text-gray-600">
                  Jenis Kelas:
                </label>
                <div className="relative">
                  <select
                    id="jenis-kelas"
                    value={jenisKelas}
                    onChange={(e) => setJenisKelas(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 pr-8 ring-2 ring-blue-300"
                  >
                    <option>Semua Kelas</option>
                    <option>Strength</option>
                    <option>Cardio</option>
                    <option>Yoga</option>
                    <option>HIIT</option>
                    <option>Pilates</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          {/* Content Area */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-bold text-gray-800">Jumlah Peserta per Kelas Offline</CardTitle>
                    <p className="text-sm text-gray-500 mb-4">Perbandingan jumlah kelas yang dijalankan per trainer</p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={classParticipantsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="trainer" stroke="#666" />
                          <YAxis stroke="#666" domain={[0, 32]} ticks={[0, 8, 16, 24, 32]} />
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
                    <div className="bg-gray-100/70 p-3 rounded-md mt-4">
                      <p className="text-xs text-gray-600">
                        <strong>Insight:</strong> Kelas Yoga oleh Scarlett J. memiliki tingkat kehadiran rendah
                        (rata-rata 5 peserta per kelas jadwal atau metode pengajaran.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-bold text-gray-800">Tipe Kelas yang Sering Diambil</CardTitle>
                    <p className="text-sm text-gray-500 mb-4">Distribusi jenis kelas berdasarkan popularitas</p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={classTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            isAnimationActive={false} // Disable animation for static rendering
                          >
                            {classTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value}%`, "Persentase"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-bold text-gray-800">Trend Kepuasan User per Trainer</CardTitle>
                  <p className="text-sm text-gray-500 mb-4">Rating kepuasan member (skala 1-5)</p>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={satisfactionTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="week" stroke="#666" />
                        <YAxis domain={[3.5, 5.0]} stroke="#666" /> {/* Adjusted domain */}
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
                              dot={{ r: 4, fill: CHART_COLORS[index % CHART_COLORS.length] }} // Add dots
                            />
                          ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-bold text-gray-800">Tabel Kinerja Trainer</CardTitle>
                  <p className="text-sm text-gray-500">Perbandingan Kinerja Semua Trainer Aktif</p>
                  <div className="relative mt-2">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter by name"
                      className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="bg-blue-600 text-white">
                      <TableRow>
                        <TableHead className="p-3 font-semibold text-white">Nama</TableHead>
                        <TableHead className="p-3 font-semibold text-white">Spesialisasi</TableHead>
                        <TableHead className="p-3 font-semibold text-white">Kelas</TableHead>
                        <TableHead className="p-3 font-semibold text-white">Feedback</TableHead>
                        <TableHead className="p-3 font-semibold text-white">Retensi</TableHead>
                        <TableHead className="p-3 font-semibold text-white">Member Aktif</TableHead>
                        <TableHead className="p-3 font-semibold text-white">Status</TableHead>
                        <TableHead className="p-3 font-semibold text-white">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrainerPerformanceData.map((trainer) => (
                        <TableRow key={trainer.id} className="border-b hover:bg-gray-50">
                          <TableCell className="p-3 font-medium text-gray-900">{trainer.name}</TableCell>
                          <TableCell className="p-3">{trainer.specialization}</TableCell>
                          <TableCell className="p-3">{trainer.classes}</TableCell>
                          <TableCell className="p-3">{trainer.feedback}/5</TableCell>
                          <TableCell className="p-3">
                            <Badge className={getStatusColor(trainer.status)}>{trainer.retention}%</Badge>
                          </TableCell>
                          <TableCell className="p-3">{trainer.activeMembers}</TableCell>
                          <TableCell className="p-3">
                            <Badge className={getStatusColor(trainer.status)}>{trainer.status}</Badge>
                          </TableCell>
                          <TableCell className="p-3">
                            <Button variant="outline" size="sm" onClick={() => handleViewTrainerDetail(trainer.id)}>
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-2 border-yellow-400">
                  <CardHeader>
                    <CardTitle className="font-bold text-gray-800">Analitik Konversi</CardTitle>
                    <p className="text-sm text-gray-500 mb-4">Rating kepuasan member (skala 1-5)</p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={satisfactionTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="week" stroke="#666" />
                          <YAxis domain={[3.5, 5.0]} stroke="#666" />
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
                  <CardHeader>
                    <CardTitle className="font-bold text-gray-800">Evaluasi Per Kursus</CardTitle>
                    <p className="text-sm text-gray-500 mb-4">Perbandingan efektivitas kursus offline vs AI</p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courseComparisonData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis type="category" dataKey="type" />
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
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-bold">AI INSIGHT</CardTitle>
                  <Search className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {insights.map((insight, index) => {
                    const IconComponent = getLucideIcon(insight.icon_name)
                    return (
                      <div key={index} className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${insight.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{insight.title}</p>
                          <p className="text-sm text-gray-600">{insight.message}</p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
                <Button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                  Lihat Semua Insight
                </Button>
              </Card>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-bold">ALERT & SARAN</CardTitle>
                  <Search className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-semibold">{alert.title}</p>
                      <p className="text-xs text-gray-500">{alert.message}</p>
                    </div>
                  ))}
                </CardContent>
                <Button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                  Lihat Semua
                </Button>
              </Card>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-bold">Rekomendasi</CardTitle>
                  <Search className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <p className="text-sm text-gray-500 mb-4">AI yang mengoptimalkan kinerja dan hasil</p>
                <CardContent className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg flex justify-between items-center ${
                        alert.priority === "high"
                          ? "border border-red-200 bg-red-50"
                          : alert.priority === "medium"
                            ? "border border-yellow-200 bg-yellow-50"
                            : "border border-green-200 bg-green-50"
                      }`}
                    >
                      <div>
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
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          alert.priority === "high"
                            ? "bg-red-200 text-red-800"
                            : alert.priority === "medium"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-green-200 text-green-800"
                        }`}
                      >
                        {alert.priority === "high" ? "Tinggi" : alert.priority === "medium" ? "Sedang" : "Rendah"}
                      </span>
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
