"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, Users, AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { AppSidebar } from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchTrainerDetail, fetchTrainerActivity, fetchTrainerSchedule } from "@/services/api"
import type { Trainer, TrainerActivityDataItem, TrainerScheduleClassItem } from "@/types/trainer"

const weekDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

const getTypeColor = (type: string) => {
  const lowerCaseType = type.toLowerCase()
  if (lowerCaseType.includes("strength") || lowerCaseType.includes("crossfit") || lowerCaseType.includes("power")) {
    return "bg-emerald-100 text-emerald-800 border-emerald-200"
  } else if (lowerCaseType.includes("hiit") || lowerCaseType.includes("functional")) {
    return "bg-red-100 text-red-800 border-red-200"
  } else if (lowerCaseType.includes("cardio") || lowerCaseType.includes("zumba") || lowerCaseType.includes("spin")) {
    return "bg-blue-100 text-blue-800 border-blue-200"
  } else if (lowerCaseType.includes("yoga")) {
    return "bg-yellow-100 text-yellow-800 border-yellow-200"
  } else if (lowerCaseType.includes("pilates") || lowerCaseType.includes("barre")) {
    return "bg-purple-100 text-purple-800 border-purple-200"
  } else if (
    lowerCaseType.includes("recovery") ||
    lowerCaseType.includes("stretch") ||
    lowerCaseType.includes("aqua")
  ) {
    return "bg-gray-100 text-gray-800 border-gray-200"
  } else {
    return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

interface TrainerDetailProps {
  trainerId: string // Assuming trainerId is passed as a prop for non-Next.js routing
}

export default function TrainerDetail({ trainerId }: TrainerDetailProps) {
  const [selectedDay, setSelectedDay] = useState("Senin")
  const [activeTab, setActiveTab] = useState("schedule")
  const [trainerData, setTrainerData] = useState<Trainer | null>(null)
  const [activityData, setActivityData] = useState<TrainerActivityDataItem[]>([])
  const [scheduleData, setScheduleData] = useState<Record<string, TrainerScheduleClassItem[]>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTrainerDetailData = async () => {
      try {
        setLoading(true)
        const detail = await fetchTrainerDetail(trainerId)
        setTrainerData(detail)
        const activity = await fetchTrainerActivity(trainerId)
        setActivityData(activity)
        const schedule = await fetchTrainerSchedule(trainerId)
        setScheduleData(schedule)
      } catch (err) {
        console.error(`Failed to load trainer data for ID ${trainerId}:`, err)
        setError("Failed to load trainer data. Please try again later.")
        setTrainerData(null)
      } finally {
        setLoading(false)
      }
    }
    if (trainerId) {
      loadTrainerDetailData()
    }
  }, [trainerId])

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
        <AppSidebar />
        <main className="ml-0 lg:ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trainer detail...</p>
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
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!trainerData) {
    return (
      <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
        <AppSidebar />
        <main className="ml-0 lg:ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trainer tidak ditemukan</h2>
            <p className="text-gray-600 mb-4">Trainer dengan ID {trainerId} tidak ditemukan.</p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const currentSchedule = scheduleData[selectedDay] || []
  const experienceYears = trainerData.join_date
    ? new Date().getFullYear() - new Date(trainerData.join_date).getFullYear()
    : 0
  const totalMembers = "N/A" // This value is not provided in trainerData, keeping as N/A

  return (
    <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
      <AppSidebar />
      <main className="ml-0 lg:ml-64 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Detail Trainer</h1>
              <p className="text-gray-600 text-xs lg:text-sm">Informasi lengkap dan jadwal {trainerData.name}</p>
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-6 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            {/* Left Side - Trainer Profile */}
            <div className="col-span-12 lg:col-span-4 space-y-4 lg:space-y-6">
              {/* Profile Card */}
              <Card className="shadow-sm">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-20 h-20 lg:w-24 lg:h-24">
                      <AvatarImage src={trainerData.profile_image || "/placeholder.svg"} alt={trainerData.name} />
                      <AvatarFallback className="text-xl lg:text-2xl bg-emerald-100 text-emerald-600">
                        {trainerData.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">{trainerData.name}</h2>
                  <p className="text-gray-600 mb-4 text-sm lg:text-base">{trainerData.specialization}</p>
                  <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
                    <div className="text-center">
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">{experienceYears} yrs</p>
                      <p className="text-xs lg:text-sm text-gray-600">Experience</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">{totalMembers}</p>
                      <p className="text-xs lg:text-sm text-gray-600">Members</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">{trainerData.rating}/5</p>
                      <p className="text-xs lg:text-sm text-gray-600">Rating</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 text-xs lg:text-sm bg-transparent">
                      Message
                    </Button>
                    <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-xs lg:text-sm">Schedule</Button>
                  </div>
                </CardContent>
              </Card>
              {/* Contact Info */}
              <Card className="shadow-sm">
                <CardHeader className="p-4 lg:p-6 pb-0">
                  <CardTitle className="text-base lg:text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-4 space-y-3 lg:space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                    <span className="text-xs lg:text-sm text-gray-600">{trainerData.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                    <span className="text-xs lg:text-sm text-gray-600">{trainerData.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 mt-0.5" />
                    <span className="text-xs lg:text-sm text-gray-600">{trainerData.bio || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Right Side - Activity & Schedule */}
            <div className="col-span-12 lg:col-span-8 space-y-4 lg:space-y-6">
              {/* Training Activity Chart */}
              <Card className="shadow-sm">
                <CardHeader className="p-4 lg:p-6 pb-0">
                  <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">Training Activity</CardTitle>
                  <div className="flex flex-wrap gap-3 lg:gap-4 text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Kehadiran</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span>Kepuasan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span>Engagement</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-4">
                  <div className="h-64 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#666" fontSize={12} />
                        <YAxis yAxisId="left" domain={[0, 30]} stroke="#666" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 5]} stroke="#666" fontSize={12} />
                        <ReferenceLine
                          yAxisId="left"
                          y={20}
                          stroke="#ef4444"
                          strokeDasharray="5 5"
                          label="Target Hadir"
                        />
                        <ReferenceLine
                          yAxisId="right"
                          y={4.5}
                          stroke="#f59e0b"
                          strokeDasharray="5 5"
                          label="Target Puas"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="kehadiran"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="kepuasan"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="engagement"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs lg:text-sm text-blue-700">
                      <strong>Insight:</strong> Data aktivitas trainer {trainerData.name} selama 14 hari terakhir
                      menunjukkan
                      {activityData.length > 0
                        ? ` kehadiran rata-rata ${(activityData.reduce((sum, item) => sum + item.kehadiran, 0) / activityData.length).toFixed(1)} peserta,
                          dan kepuasan rata-rata ${(activityData.reduce((sum, item) => sum + item.kepuasan, 0) / activityData.length).toFixed(1)}/5.`
                        : " belum ada data aktivitas."}
                    </p>
                  </div>
                </CardContent>
              </Card>
              {/* Schedule Section */}
              <Card className="shadow-sm">
                <CardHeader className="p-4 lg:p-6 pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">
                      Jadwal & Member List
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={activeTab === "schedule" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("schedule")}
                        className="text-xs lg:text-sm"
                      >
                        Jadwal {trainerData.name.split(" ")[0]}
                      </Button>
                      <Button
                        variant={activeTab === "members" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("members")}
                        className="text-xs lg:text-sm"
                      >
                        Member List
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 pt-4">
                  {/* Day Tabs */}
                  <div className="flex gap-2 mb-6 overflow-x-auto">
                    {weekDays.map((day) => (
                      <Button
                        key={day}
                        variant={selectedDay === day ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDay(day)}
                        className="whitespace-nowrap text-xs lg:text-sm"
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                  {/* Schedule Content */}
                  {activeTab === "schedule" && (
                    <div className="space-y-4">
                      {currentSchedule.length > 0 ? (
                        currentSchedule.map((class_item) => (
                          <div key={class_item.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{class_item.name}</h3>
                              <Badge variant="outline" className={getTypeColor(class_item.type)}>
                                {class_item.type}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 text-xs lg:text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {class_item.time}
                                  <br />
                                  <span className="text-xs">{class_item.duration}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{class_item.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>
                                  {class_item.participants} Peserta
                                  <br />
                                  <span className="text-xs">{class_item.available} slot tersisa</span>
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <Button variant="outline" size="sm" className="text-xs lg:text-sm bg-transparent">
                                Lihat Member
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm lg:text-base">Tidak ada kelas pada hari {selectedDay}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === "members" && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm lg:text-base">Daftar member akan ditampilkan di sini</p>
                      <p className="text-xs lg:text-sm mt-2">Total member aktif: {totalMembers}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
