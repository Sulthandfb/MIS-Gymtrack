// src/pages/TrainerDetail.tsx
"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, Users } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

import { AppSidebar } from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

import { fetchTrainerDetail, fetchTrainerActivity, fetchTrainerSchedule } from "@/services/api"
import type { Trainer, TrainerActivityDataItem, TrainerScheduleClassItem } from "@/types/trainer"

const weekDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

// PERBAIKAN DI SINI: Gunakan string.includes() untuk pencocokan tipe kelas
const getTypeColor = (type: string) => {
  const lowerCaseType = type.toLowerCase();
  if (lowerCaseType.includes("strength") || lowerCaseType.includes("crossfit") || lowerCaseType.includes("power")) {
    return "bg-emerald-100 text-emerald-800";
  } else if (lowerCaseType.includes("hiit") || lowerCaseType.includes("functional")) {
    return "bg-red-100 text-red-800";
  } else if (lowerCaseType.includes("cardio") || lowerCaseType.includes("zumba") || lowerCaseType.includes("spin")) {
    return "bg-blue-100 text-blue-800";
  } else if (lowerCaseType.includes("yoga")) {
    return "bg-yellow-100 text-yellow-800";
  } else if (lowerCaseType.includes("pilates") || lowerCaseType.includes("barre")) {
    return "bg-purple-100 text-purple-800";
  } else if (lowerCaseType.includes("recovery") || lowerCaseType.includes("stretch") || lowerCaseType.includes("aqua")) {
    return "bg-gray-100 text-gray-800";
  } else {
    return "bg-gray-100 text-gray-800"; // Default jika tidak ada yang cocok
  }
}

interface TrainerDetailProps {
  trainerId: string
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
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-600">Memuat detail trainer...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-red-600">{error}</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!trainerData) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Trainer tidak ditemukan</h2>
              <p className="text-gray-600 mb-4">Trainer dengan ID {trainerId} tidak ditemukan.</p>
              <Button onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const currentSchedule = scheduleData[selectedDay] || []

  const experienceYears = trainerData.join_date ? new Date().getFullYear() - new Date(trainerData.join_date).getFullYear() : 0;
  const totalMembers = "N/A"; // Ini masih placeholder jika tidak ada endpoint spesifik

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detail Trainer</h1>
                <p className="text-gray-600 mt-1">Informasi lengkap dan jadwal {trainerData.name}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Side - Trainer Profile */}
              <div className="col-span-4 space-y-6">
                {/* Profile Card */}
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="relative inline-block mb-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={trainerData.profile_image || "/placeholder.svg"} alt={trainerData.name} />
                        <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-600">
                          {trainerData.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white"></div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-1">{trainerData.name}</h2>
                    <p className="text-gray-600 mb-4">{trainerData.specialization}</p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{experienceYears} yrs</p>
                        <p className="text-sm text-gray-600">Experience</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
                        <p className="text-sm text-gray-600">Members</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{trainerData.rating}/5</p>
                        <p className="text-sm text-gray-600">Rating</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Message
                      </Button>
                      <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600">Schedule</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{trainerData.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{trainerData.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">{trainerData.bio || "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Activity & Schedule */}
              <div className="col-span-8 space-y-6">
                {/* Training Activity Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Training Activity</CardTitle>
                    <div className="flex gap-4 text-sm">
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
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#666" />
                        <YAxis yAxisId="left" domain={[0, 30]} stroke="#666" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 5]} stroke="#666" />
                        <ReferenceLine yAxisId="left" y={20} stroke="#ef4444" strokeDasharray="5 5" label="Target Hadir" />
                        <ReferenceLine yAxisId="right" y={4.5} stroke="#f59e0b" strokeDasharray="5 5" label="Target Puas" />
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

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Insight:</strong> Data aktivitas trainer {trainerData.name} selama 14 hari terakhir menunjukkan
                        {activityData.length > 0 ? (
                          ` kehadiran rata-rata ${(activityData.reduce((sum, item) => sum + item.kehadiran, 0) / activityData.length).toFixed(1)} peserta,
                            dan kepuasan rata-rata ${(activityData.reduce((sum, item) => sum + item.kepuasan, 0) / activityData.length).toFixed(1)}/5.`
                        ) : " belum ada data aktivitas."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Schedule Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Jadwal & Member List</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant={activeTab === "schedule" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTab("schedule")}
                        >
                          Jadwal {trainerData.name.split(" ")[0]}
                        </Button>
                        <Button
                          variant={activeTab === "members" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTab("members")}
                        >
                          Member List
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Day Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto">
                      {weekDays.map((day) => (
                        <Button
                          key={day}
                          variant={selectedDay === day ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedDay(day)}
                          className="whitespace-nowrap"
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
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">{class_item.name}</h3>
                                <Badge className={getTypeColor(class_item.type)}>{class_item.type}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
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
                                <Button variant="outline" size="sm">
                                  Lihat Member
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Tidak ada kelas pada hari {selectedDay}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "members" && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Daftar member akan ditampilkan di sini</p>
                        <p className="text-sm mt-2">Total member aktif: {totalMembers}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}