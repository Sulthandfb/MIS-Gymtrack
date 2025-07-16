"use client"

// src/pages/FeedbackDashboard.tsx
import { useEffect, useState } from "react"
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  RefreshCw,
  Users,
  Calendar,
  Tag,
  Lightbulb,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis, // Untuk ukuran bubble chart
  BarChart,
  Bar, // ✅ FIXED: Re-added BarChart and Bar
  Cell, // ✅ FIXED: Re-added Cell
} from "recharts"
import { AppSidebar } from "@/components/Sidebar"
// import { MemberListModal } from "@/components/member-list-modal"; // Tidak diperlukan di sini
import { AIInsights } from "@/components/AIInsights" // Component untuk menampilkan AI insights
import { AIRecommendations } from "@/components/AIRecommendations" //  FIXED: Import AIRecommendations component
import type { AIRecommendation } from "@/components/AIRecommendations" // Jika belum diimport
import { SixMonthTrend } from "@/components/SixMonthTrend" //  NEW: Component untuk Six Month Trend
import {
  fetchSentimentSummary,
  fetchSentimentDistribution,
  fetchTopicAnalysis,
  fetchDailySentimentTrends,
  fetchRecentFeedback,
  fetchAllFeedbackTypes,
  fetchAllMemberNames,
  fetchOverallAIInsights,
  // ✅ NEW: Import fungsi baru
  fetchMonthlySentimentTrends,
  fetchTopicSentimentComparison,
  fetchFeedbackAIRecommendations,
} from "@/services/api" // Import API calls
import type {
  FeedbackDashboardData,
  SentimentDistribution,
  TopicAnalysisItem,
  FeedbackListItem,
  FeedbackFilters,
} from "@/types/feedback" // Import types
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast" // For toast notifications
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // ✅ NEW: Import Tabs

// Komponen Card Sentimen (disesuaikan dari StatCard atau buat baru)
const SentimentCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm lg:text-base font-medium text-gray-600">{title}</div>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{value}</div>
    {trend !== undefined && ( // Hanya tampilkan trend jika ada
      <div className="flex items-center text-sm">
        {trend > 0 ? (
          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
        )}
        <span className={trend > 0 ? "text-green-600" : "text-red-600"}>
          {Math.abs(trend)}% {trend > 0 ? "Naik" : "Turun"}
        </span>
      </div>
    )}
  </div>
)

// Komponen Bubble Chart (untuk Topik)
const TopicBubbleChart = ({ data, title }: { data: TopicAnalysisItem[]; title: string }) => {
  const getColor = (sentiment_score: number) => {
    if (sentiment_score > 0.3) return "#10b981" // green
    if (sentiment_score < -0.3) return "#ef4444" // red
    return "#6b7280" // gray (neutral)
  }

  return (
    <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">Ukuran = frekuensi, Warna = sentimen</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey="sentiment_score"
              name="Sentiment Score"
              domain={[-1, 1]}
              tickFormatter={(tick) => tick.toFixed(1)}
              label={{ value: "Sentiment Score", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="frequency"
              name="Frequency"
              label={{ value: "Frequency", angle: -90, position: "insideLeft" }}
            />
            <ZAxis dataKey="frequency" range={[50, 800]} /> {/* Size of bubbles based on frequency */}
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: any, name: string, props: any) => {
                if (name === "Frequency") return [`${value} feedback`, name]
                if (name === "Sentiment Score") return [value.toFixed(2), name]
                return [value, name]
              }}
              labelFormatter={(label: any, payload: any) => {
                if (payload && payload[0]) {
                  return `Topik: ${payload[0].payload.topic}`
                }
                return `Topik: ${label}`
              }}
            />
            <Scatter name="Topics" data={data} fill="#8884d8">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.sentiment_score)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const SentimentBarChart = ({ data }: { data: SentimentDistribution[] }) => {
  const sentimentColors: { [key: string]: string } = {
    Positive: "#10b981", // green-500
    Neutral: "#6b7280", // gray-500
    Negative: "#ef4444", // red-500
  }

  return (
    <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Distribusi Sentimen</h3>
          <p className="text-sm text-gray-500">Jumlah feedback berdasarkan kategori sentimen</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" fontSize={12} />
            <YAxis type="category" dataKey="sentiment" fontSize={12} />
            <Tooltip
              formatter={(value: any, name: string) => [
                `${value} (${(data.find((d) => d.sentiment === name)?.percentage || 0).toFixed(1)}%)`,
                "Jumlah Feedback",
              ]}
            />
            <Bar dataKey="count" fill="#8884d8">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={sentimentColors[entry.sentiment]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const FeedbackList = ({
  feedback,
  feedbackTypes,
  memberNames,
  onFilterChange,
}: {
  feedback: FeedbackListItem[]
  feedbackTypes: string[]
  memberNames: string[]
  onFilterChange: (filters: FeedbackFilters) => void
}) => {
  const [currentFilters, setCurrentFilters] = useState<FeedbackFilters>({})

  const handleFilterApply = () => {
    onFilterChange(currentFilters)
  }

  const getSentimentBadgeClass = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-green-100 text-green-800"
      case "Negative":
        return "bg-red-100 text-red-800"
      case "Neutral":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Feedback Terbaru</h3>
        <div className="flex gap-2">
          <Select
            onValueChange={(value) =>
              setCurrentFilters({ ...currentFilters, sentiment: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sentimen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="Positive">Positif</SelectItem>
              <SelectItem value="Neutral">Netral</SelectItem>
              <SelectItem value="Negative">Negatif</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              setCurrentFilters({ ...currentFilters, feedback_type: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tipe Feedback" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              {feedbackTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Fitur filter member_name atau search_query bisa ditambahkan di sini */}
          <Button onClick={handleFilterApply}>
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {feedback.length > 0 ? (
          feedback.map((item: FeedbackListItem) => (
            <div key={item.feedback_id} className="border-l-4 border-gray-200 pl-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-900 flex items-center gap-2">
                  <Users className="w-3 h-3" /> {item.member_name || "N/A"}
                </span>
                <div className="flex items-center gap-2">
                  <Badge className={getSentimentBadgeClass(item.sentiment)}>{item.sentiment}</Badge>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 mr-1" />
                    <span className="text-xs text-gray-600">{item.rating?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{item.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {item.feedback_type}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(item.feedback_date).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">Tidak ada feedback untuk tampilan ini.</div>
        )}
      </div>
    </div>
  )
}

export default function SentimentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("all-time") // Default ke sepanjang waktu
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<FeedbackDashboardData | null>(null)
  const [feedbackFilters, setFeedbackFilters] = useState<FeedbackFilters>({}) // State untuk filter Feedback List

  // ✅ NEW: State untuk fitur baru
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation | null>(null)
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])
  const [topicComparison, setTopicComparison] = useState<any>({ improving: [], declining: [] })
  const [newFeaturesTab, setNewFeaturesTab] = useState("tren") // Tab untuk fitur baru

  const { toast } = useToast() // ✅ FIXED: Panggil useToast hook di sini

  const loadDashboardData = async (filters?: FeedbackFilters, trendTimeRange = "all-time") => {
    setLoading(true)
    setError(null)
    try {
      let startDate: string | undefined = undefined
      let endDate: string | undefined = undefined
      if (trendTimeRange !== "all-time") {
        const today = new Date()
        endDate = today.toISOString().split("T")[0] // YYYY-MM-DD
        if (trendTimeRange === "7-days") {
          startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split("T")[0]
        } else if (trendTimeRange === "30-days") {
          startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split("T")[0]
        } else if (trendTimeRange === "90-days") {
          startDate = new Date(today.setDate(today.getDate() - 90)).toISOString().split("T")[0]
        }
      }

      const [
        summary,
        sentimentDistribution,
        topicAnalysis,
        sentimentTrendDaily,
        recentFeedback,
        allAIInsights,
        feedbackTypes,
        memberNames,
      ] = await Promise.all([
        fetchSentimentSummary(),
        fetchSentimentDistribution(),
        fetchTopicAnalysis(),
        fetchDailySentimentTrends(startDate, endDate), // Kirim range tanggal ke backend
        fetchRecentFeedback(filters), // ✅ Kirim objek filters
        fetchOverallAIInsights(),
        fetchAllFeedbackTypes(),
        fetchAllMemberNames(), // ✅ Memperbaiki kesalahan penulisan AllMemberNames
      ])

      // ✅ NEW: Load fitur baru dengan error handling
      const [aiRecommendationsData, monthlyTrendsData, topicComparisonData] = await Promise.allSettled([
        fetchFeedbackAIRecommendations(),
        fetchMonthlySentimentTrends(2024),
        fetchTopicSentimentComparison(2024),
      ])

      // Process results with fallbacks
      const processResult = (result: any, fallback: any) => {
        return result.status === "fulfilled" ? result.value : fallback
      }

      setDashboardData({
        summary,
        sentimentDistribution,
        topicAnalysis,
        sentimentTrendDaily,
        recentFeedback,
        allAIInsights,
        feedbackTypes,
        memberNames,
      })

      // ✅ NEW: Set fitur baru dengan fallbacks
      setAIRecommendations(processResult(aiRecommendationsData, null))
      setMonthlyTrends(processResult(monthlyTrendsData, []))
      setTopicComparison(processResult(topicComparisonData, { improving: [], declining: [] }))
    } catch (err: any) {
      setError("Failed to load dashboard data. Please try again.")
      console.error("Error loading dashboard data:", err)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. " + (err.message || String(err)),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData(feedbackFilters, timeRange)
  }, [feedbackFilters, timeRange]) // Dependensi sudah benar

  const handleRefreshData = async () => {
    await loadDashboardData(feedbackFilters, timeRange)
    toast({
      title: "Data Refreshed",
      description: "Dashboard data has been refreshed.",
    })
  }

  const handleListFilterChange = (newFilters: FeedbackFilters) => {
    setFeedbackFilters(newFilters)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
        <AppSidebar />
        <main className="ml-0 lg:ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading feedback dashboard...</p>
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
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => loadDashboardData(feedbackFilters, timeRange)}>Try Again</Button>
          </div>
        </main>
      </div>
    )
  }

  if (!dashboardData) {
    // Fallback if dashboardData is null after loading (shouldn't happen with error handling)
    return <div className="text-center py-10">No data available.</div>
  }

  const {
    summary,
    sentimentDistribution,
    topicAnalysis,
    sentimentTrendDaily,
    recentFeedback,
    allAIInsights,
    feedbackTypes,
    memberNames,
  } = dashboardData

  // Render Dashboard
  return (
    <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
      <AppSidebar />
      <main className="ml-0 lg:ml-64 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">FEEDBACK & SENTIMENT</h1>
            <p className="text-gray-600 text-xs lg:text-sm">Analisis mendalam dari AI tentang sentimen dan topik</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefreshData}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 bg-transparent"
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 bg-transparent"
              variant="outline"
            >
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-6 flex-1 overflow-y-auto min-h-0">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SentimentCard
              title="Total Feedback"
              value={summary.total_feedback}
              trend={summary.total_feedback > 0 ? ((summary.total_feedback - 100) / 100) * 100 : 0}
              icon={MessageSquare}
              color="text-blue-500"
            />
            <SentimentCard
              title="Sentimen Positif"
              value={`${summary.positive_percentage}%`}
              trend={summary.positive_percentage > 50 ? ((summary.positive_percentage - 50) / 50) * 100 : 0}
              icon={CheckCircle}
              color="text-green-500"
            />
            <SentimentCard
              title="Rating Rata-rata"
              value={summary.avg_rating.toFixed(1)}
              trend={summary.avg_rating > 3 ? ((summary.avg_rating - 3) / 3) * 100 : 0}
              icon={Star}
              color="text-yellow-500"
            />
            <SentimentCard
              title="Perlu Perhatian"
              value={summary.negative_count}
              trend={summary.negative_percentage > 10 ? (-(summary.negative_percentage - 10) / 10) * 100 : 0}
              icon={AlertTriangle}
              color="text-red-500"
            />
          </div>

          {/* Charts & Feedback List Grid */}
          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            {/* Left & Center Column (Charts) */}
            <div className="col-span-12 xl:col-span-8 space-y-6">
              {/* Sentiment Trend Chart */}
              <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tren Sentimen</h3>
                    <p className="text-sm text-gray-500">Perubahan sentimen dari waktu ke waktu</p>
                  </div>
                  <Select value={timeRange} onValueChange={(value: string) => setTimeRange(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Rentang Waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-time">Sepanjang Waktu</SelectItem>
                      <SelectItem value="7-days">7 Hari Terakhir</SelectItem>
                      <SelectItem value="30-days">30 Hari Terakhir</SelectItem>
                      <SelectItem value="90-days">90 Hari Terakhir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sentimentTrendDaily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        stroke="#666"
                        fontSize={12}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("id-ID", { month: "short", day: "numeric" })
                        }
                      />
                      <YAxis stroke="#666" fontSize={12} domain={[0, "auto"]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        labelFormatter={(label) => `Tanggal: ${new Date(label).toLocaleDateString("id-ID")}`}
                        formatter={(value: any, name: string) => [
                          value,
                          name === "positive" ? "Positif" : name === "neutral" ? "Netral" : "Negatif",
                        ]}
                      />
                      <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} name="Positif" />
                      <Line type="monotone" dataKey="neutral" stroke="#6b7280" strokeWidth={2} name="Netral" />
                      <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} name="Negatif" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Topic Analysis & Sentiment Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopicBubbleChart data={topicAnalysis} title="Analisis Topik Feedback" />
                <SentimentBarChart data={sentimentDistribution} />
              </div>

              {/* ✅ NEW: AI Insights dengan Tabs untuk fitur baru */}
              <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Insights & Analytics</h3>
                    <p className="text-sm text-gray-500">Analisis mendalam dan rekomendasi dari AI</p>
                  </div>
                </div>

                <Tabs value={newFeaturesTab} onValueChange={setNewFeaturesTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tren">Tren 6 Bulan</TabsTrigger>
                    <TabsTrigger value="rekomendasi">AI Rekomendasi</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tren" className="mt-6">
                    <SixMonthTrend monthlyTrends={monthlyTrends} topicComparison={topicComparison} />
                  </TabsContent>

                  <TabsContent value="rekomendasi" className="mt-6">
                    {aiRecommendations ? (
                      <AIRecommendations recommendations={aiRecommendations} />
                    ) : (
                      <div className="text-center text-sm text-gray-400 py-6">
                        <Lightbulb className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        Loading AI recommendations...
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Sidebar (Feedback List & AI Insights) */}
            <div className="col-span-12 xl:col-span-4 space-y-6">
              <FeedbackList
                feedback={recentFeedback}
                feedbackTypes={feedbackTypes}
                memberNames={memberNames}
                onFilterChange={handleListFilterChange}
              />
              <AIInsights insights={allAIInsights} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
