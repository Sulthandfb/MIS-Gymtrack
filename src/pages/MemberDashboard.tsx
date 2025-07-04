"use client"

import { useEffect, useState } from "react"
import {
  Users,
  UserPlus,
  TrendingUp,
  Target,
  Bell,
  Zap,
  ChevronDownIcon,
  TextIcon as DocumentTextIcon,
  ArrowDownIcon as ArrowDownTrayIcon,
} from "lucide-react"
import {
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
  BarChart,
  Bar,
} from "recharts"
import { AppSidebar } from "@/components/Sidebar"
import { MemberListModal } from "@/components/member-list-modal"
import { AIInsights } from "@/components/AIInsights"
import {
  fetchMemberStats,
  fetchMemberActivity,
  fetchInsights,
  fetchSegmentData,
  fetchWorkoutTimeData,
  fetchFunnelData,
  fetchNotificationResponse,
  fetchABTestData,
} from "@/services/api"
import type {
  MemberStats,
  MemberActivity,
  Insight,
  ChartSegment,
  ChartWorkout,
  ChartFunnel,
  ChartNotifResponse,
  ChartABTesting,
} from "@/types/insight"

// Tambahkan di bagian import atau sebagai style
const customScrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`

export default function MemberDashboard() {
  const [stats, setStats] = useState<MemberStats>({ active: 0, retention: 0, new_members: 0, total: 0 })
  const [dailyActivityData, setDailyActivityData] = useState<MemberActivity[]>([])
  const [aiInsights, setAIInsights] = useState<Insight[]>([])
  const [segmentData, setSegmentData] = useState<ChartSegment[]>([])
  const [workoutTimeData, setWorkoutTimeData] = useState<ChartWorkout[]>([])
  const [funnelData, setFunnelData] = useState<ChartFunnel[]>([])
  const [notifResponse, setNotifResponse] = useState<ChartNotifResponse[]>([])
  const [abTestData, setABTestData] = useState<ChartABTesting[]>([])
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [modalMembers, setModalMembers] = useState<any[]>([])

  useEffect(() => {
    fetchMemberStats().then(setStats)
    fetchMemberActivity().then(setDailyActivityData)
    fetchInsights().then(setAIInsights)
    fetchSegmentData().then(setSegmentData)
    fetchWorkoutTimeData().then(setWorkoutTimeData)
    fetchFunnelData().then(setFunnelData)
    fetchNotificationResponse().then(setNotifResponse)
    fetchABTestData().then(setABTestData)
  }, [])

  const handlePieClick = (data: any) => {
    setSelectedSegment(data.name)
    const matched = segmentData.find((d) => d.name === data.name)
    setModalMembers(matched?.members || [])
  }

  return (
    <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="ml-0 lg:ml-64 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">MEMBER</h1>
            <p className="text-gray-600 text-xs lg:text-sm">
              Pantau perilaku, retensi, dan efektivitas AI terhadap pengguna gym
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 shadow-sm text-xs lg:text-sm">
              <DocumentTextIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Laporan</span>
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-xs lg:text-sm">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Ekspor Data</span>
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-6 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            {/* Left & Center Column */}
            <div className="col-span-12 xl:col-span-8 space-y-4 lg:space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs lg:text-sm font-medium text-gray-600">Member Aktif</div>
                    <Users className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                  </div>
                  <div className="text-xl lg:text-3xl font-bold text-gray-900">{stats.active}</div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                    <span className="text-xs">12% Naik</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>

                <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs lg:text-sm font-medium text-gray-600">Retensi Bulanan</div>
                    <TrendingUp className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                  </div>
                  <div className="text-xl lg:text-3xl font-bold text-gray-900">{stats.retention}%</div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                    <span className="text-xs">5% Naik</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                    <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${stats.retention}%` }}></div>
                  </div>
                </div>

                <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs lg:text-sm font-medium text-gray-600">User Baru</div>
                    <UserPlus className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                  </div>
                  <div className="text-xl lg:text-3xl font-bold text-gray-900">{stats.new_members}</div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                    <span className="text-xs">8% Naik</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>

                <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs lg:text-sm font-medium text-gray-600">Total Member</div>
                    <Target className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                  </div>
                  <div className="text-xl lg:text-3xl font-bold text-gray-900">{stats.total}</div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                    <span className="text-xs">15% Naik</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                    <div className="bg-red-500 h-1 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
              </div>

              {/* Tren Aktivitas Member */}
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">Tren Aktivitas Member</h3>
                    <p className="text-xs lg:text-sm text-gray-500">Aktivitas pengguna per bulan</p>
                  </div>
                  <button className="flex items-center gap-2 text-xs lg:text-sm border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 self-start sm:self-auto">
                    Bulanan <ChevronDownIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-64 lg:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value: any) => [`${value} member`, "Aktivitas"]}
                        labelFormatter={(label: string) => `Bulan: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="rgba(59, 130, 246, 0.1)"
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#2563eb" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grid untuk 2 Grafik Bawah */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
                {/* Pie Chart - Segmentasi Tujuan */}
                <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm lg:text-base font-semibold text-gray-800">Segmentasi Tujuan Member</h3>
                      <p className="text-xs lg:text-sm text-gray-500">Distribusi member berdasarkan tujuan</p>
                    </div>
                    <button className="text-xs border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-50">
                      Monthly
                    </button>
                  </div>
                  <div className="h-48 lg:h-56 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={segmentData}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                          onClick={handlePieClick}
                          className="cursor-pointer"
                        >
                          {segmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value}%`, "Persentase"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 lg:gap-4 text-xs mt-4">
                    {segmentData.map((item, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bar Chart - Waktu Favorit */}
                <div className="lg:col-span-3 bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm lg:text-base font-semibold text-gray-800">Waktu Favorit Latihan</h3>
                      <p className="text-xs lg:text-sm text-gray-500">Jam sibuk pengguna gym</p>
                    </div>
                    <button className="text-xs border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-50">
                      Monthly
                    </button>
                  </div>
                  <div className="h-48 lg:h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workoutTimeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="time" stroke="#666" fontSize={12} />
                        <YAxis stroke="#666" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value: any) => [`${value} member`, "Jumlah"]}
                        />
                        <Bar dataKey="members" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Bottom Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Funnel Chart */}
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-sm lg:text-base font-semibold text-gray-800">Conversion Funnel</h3>
                    <p className="text-xs lg:text-sm text-gray-500">Journey member dari workout pertama</p>
                  </div>
                  <div className="space-y-3 lg:space-y-4">
                    {funnelData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div
                            className="h-6 lg:h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-sm"
                            style={{
                              backgroundColor: item.fill,
                              width: `${(item.value / funnelData[0]?.value) * 100}%`,
                              minWidth: "50px",
                            }}
                          >
                            {item.value}
                          </div>
                          <div className="flex-1">
                            <span className="text-xs lg:text-sm font-medium">{item.name}</span>
                          </div>
                          <span className="text-xs lg:text-sm text-gray-500 font-medium">
                            {index > 0 && `${Math.round((item.value / funnelData[index - 1]?.value) * 100)}%`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notification Response */}
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-600" />
                      Respons Notifikasi AI
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-500">Efektivitas notifikasi AI</p>
                  </div>
                  <div className="h-40 lg:h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={notifResponse} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={10} />
                        <YAxis dataKey="type" type="category" width={50} fontSize={10} />
                        <Tooltip
                          formatter={(value: any, name: string) => [
                            `${value} member`,
                            name === "responded" ? "Merespons" : "Mengabaikan",
                          ]}
                        />
                        <Bar dataKey="responded" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="ignored" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* A/B Testing */}
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      A/B Testing
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-500">Efektivitas fitur AI</p>
                  </div>
                  <div className="space-y-3 lg:space-y-4">
                    {abTestData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <span className="text-xs lg:text-sm font-medium">{item.feature}</span>
                          </div>
                          <span className="text-xs lg:text-sm font-bold text-gray-900 ml-2">{item.success}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              item.success > 70 ? "bg-green-500" : "bg-orange-500"
                            }`}
                            style={{ width: `${item.success}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - AI Insights */}
            <div className="col-span-12 xl:col-span-4">
              <AIInsights insights={aiInsights} />
            </div>
          </div>
        </div>

        <MemberListModal
          isOpen={!!selectedSegment}
          onClose={() => setSelectedSegment(null)}
          segment={selectedSegment || ""}
          members={modalMembers}
        />
      </main>
    </div>
  )
}
