// src/pages/TrainerDashboard.tsx
"use client"

import { useState, useEffect } from "react"
import { UserCheck, Users, TrendingUp, Star, Calendar, AlertTriangle, Lightbulb, Eye } from "lucide-react"
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
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { fetchTrainerDashboardData } from "@/services/api" // fetchAllTrainers dihapus karena tidak digunakan
import type { TrainerDashboardData } from "@/types/trainer" // Gunakan 'type' untuk impor tipe

export default function TrainerDashboard() {
  const [dashboardData, setDashboardData] = useState<TrainerDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrainerDashboard = async () => {
      try {
        setLoading(true);
        const data = await fetchTrainerDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to load trainer dashboard data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadTrainerDashboard();
  }, []);

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
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Fungsi untuk mendapatkan komponen ikon dari string (Pindah dari api.ts ke sini)
  const getLucideIcon = (iconName: string) => {
    const icons: { [key: string]: React.ElementType } = {
      TrendingUp: TrendingUp,
      AlertTriangle: AlertTriangle,
      Lightbulb: Lightbulb,
    };
    return icons[iconName] || Lightbulb;
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-600">Memuat data dashboard trainer...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
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
    );
  }

  if (!dashboardData) {
      return (
          <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <p className="text-gray-600">Tidak ada data dashboard yang tersedia.</p>
                  </div>
              </SidebarInset>
          </SidebarProvider>
      );
  }

  const { stats, classParticipantsData, satisfactionTrendData, classTypeData,
          courseComparisonData, trainerPerformanceData, insights, alerts } = dashboardData;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trainer Insights</h1>
                <p className="text-gray-600 mt-1">Pantau efektivitas trainer, kelas offline, dan manajemen kursus</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Eye className="w-4 h-4" />
                  Lihat Daftar Trainer
                </Button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Update terakhir: {new Date().toLocaleDateString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Kelas Mingguan"
                value={stats.weekly_classes}
                icon={Calendar}
                trend={{ value: 8, isPositive: true }}
                color="emerald"
              />
              <StatCard
                title="Trainer Aktif"
                value={stats.active_trainers}
                icon={UserCheck}
                trend={{ value: 2, isPositive: true }}
                color="blue"
              />
              <StatCard
                title="Engagement Tinggi"
                value={stats.high_engagement_classes}
                icon={TrendingUp}
                trend={{ value: 12, isPositive: true }}
                color="orange"
              />
              <StatCard
                title="Rata-rata Kepuasan"
                value={`${stats.avg_satisfaction.toFixed(1)}/5`}
                icon={Star}
                trend={{ value: 5, isPositive: true }}
                color="purple"
              />
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Main Content */}
              <div className="col-span-9 space-y-6">
                {/* Middle Section Charts */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Bar Chart - Jumlah Peserta per Kelas Offline */}
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        Jumlah Peserta per Kelas Offline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={classParticipantsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="trainer" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="strength" fill="#10b981" name="Strength" />
                          <Bar dataKey="yoga" fill="#f59e0b" name="Yoga" />
                          <Bar dataKey="cardio" fill="#3b82f6" name="Cardio" />
                          <Bar dataKey="pilates" fill="#8b5cf6" name="Pilates" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Doughnut Chart - Tipe Kelas Populer */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                        Tipe Kelas Populer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={classTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                          >
                            {classTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value}%`, "Persentase"]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-2 mt-4">
                        {classTypeData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-gray-600">
                              {item.name}: {item.value}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Satisfaction Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-blue-600" />
                      Trend Kepuasan User per Trainer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={satisfactionTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="week" stroke="#666" />
                        <YAxis domain={[4.0, 5.0]} stroke="#666" />
                        <ReferenceLine y={4.5} stroke="#ef4444" strokeDasharray="5 5" label="Target" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        {Object.keys(satisfactionTrendData[0] || {}).filter(key => key !== 'week').map((trainerNameKey) => (
                            <Line
                                key={trainerNameKey}
                                type="monotone"
                                dataKey={trainerNameKey}
                                stroke={(() => {
                                    const colors = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];
                                    return colors[Object.keys(satisfactionTrendData[0] || {}).filter(key => key !== 'week').indexOf(trainerNameKey) % colors.length];
                                })()}
                                strokeWidth={2}
                                name={trainerNameKey.charAt(0).toUpperCase() + trainerNameKey.slice(1)}
                            />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Bottom Section */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Trainer Performance Table */}
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Kinerja Trainer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Spesialisasi</TableHead>
                            <TableHead>Kelas</TableHead>
                            <TableHead>Feedback</TableHead>
                            <TableHead>Retensi</TableHead>
                            <TableHead>Member Aktif</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trainerPerformanceData.map((trainer) => (
                            <TableRow key={trainer.id}>
                              <TableCell className="font-medium">{trainer.name}</TableCell>
                              <TableCell>{trainer.specialization}</TableCell>
                              <TableCell>{trainer.classes}</TableCell>
                              <TableCell>{trainer.feedback}/5</TableCell>
                              <TableCell>{trainer.retention}%</TableCell>
                              <TableCell>{trainer.activeMembers}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(trainer.status)}>{trainer.status}</Badge>
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
                    </CardContent>
                  </Card>

                  {/* Course Evaluation */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Evaluasi Per Kursus</CardTitle>
                      <p className="text-sm text-gray-600">Perbandingan efektivitas offline vs online</p>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={courseComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="offline" fill="#10b981" name="Offline" />
                          <Bar dataKey="online" fill="#3b82f6" name="Online" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* AI Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-emerald-600" />
                        Rekomendasi AI
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {alerts.map((alert, index) => (
                        <div key={index} className={`p-3 rounded-lg border-l-4 ${alert.priority === "high" ? "bg-orange-50 border-orange-500" : "bg-emerald-50 border-emerald-500"}`}>
                          <p className="text-sm font-medium text-gray-900">{alert.title}:</p>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="col-span-3 space-y-6">
                {/* AI Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-emerald-600" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights.map((insight, index) => {
                        const IconComponent = getLucideIcon(insight.icon_name);
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
                        );
                    })}
                  </CardContent>
                </Card>

                {/* Alerts & Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Alert & Saran
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {alerts.map((alert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-gray-800">{alert.title}</span>
                      </div>
                    ))}
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