
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Wrench,
  MessageSquare,
  AlertTriangle,
  Activity,
  Star,
  Calendar,
  ShoppingCart,
  TextIcon as DocumentTextIcon,
  ArrowDownIcon as ArrowDownTrayIcon,
  UserCheck,
  Clock,
  Target,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

// Import components
import { AppSidebar } from "@/components/Sidebar"
import { AIInsights } from "@/components/AIInsights"

// Import API functions
import {
  fetchMemberStats,
  fetchMemberActivity,
  fetchInsights,
  fetchTrainerDashboardData,
  fetchProductStats,
  fetchTopSales,
  fetchFinancialSummary,
  fetchInventorySummary,
  fetchSentimentSummary,
  fetchOverallAIInsights,
} from "@/services/api"

// Import types
import type { MemberStats, MemberActivity, Insight } from "@/types/insight"
import type { TrainerStats, TrainerDashboardData } from "@/types/trainer"
import type { ProductStats, TopSalesData } from "@/types/product"
import type { FinancialSummary } from "@/types/finance"
import type { InventorySummary } from "@/types/inventory"
import type { FeedbackDashboardSummary, AIInsight } from "@/types/feedback"

interface DashboardMetrics {
  memberStats: MemberStats | null
  memberActivity: MemberActivity[]
  memberInsights: Insight[]
  trainerStats: TrainerStats | null
  trainerData: TrainerDashboardData | null
  productStats: ProductStats | null
  topSales: TopSalesData[]
  financialSummary: FinancialSummary | null
  inventorySummary: InventorySummary | null
  feedbackSummary: FeedbackDashboardSummary | null
  aiInsights: AIInsight[]
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    memberStats: null,
    memberActivity: [],
    memberInsights: [],
    trainerStats: null,
    trainerData: null,
    productStats: null,
    topSales: [],
    financialSummary: null,
    inventorySummary: null,
    feedbackSummary: null,
    aiInsights: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch data from all modules
        const [
          memberStatsData,
          memberActivityData,
          memberInsightsData,
          trainerData,
          productStatsData,
          topSalesData,
          financialData,
          inventoryData,
          feedbackData,
          aiInsightsData,
        ] = await Promise.all([
          fetchMemberStats(),
          fetchMemberActivity(),
          fetchInsights(),
          fetchTrainerDashboardData(),
          fetchProductStats(),
          fetchTopSales(5),
          fetchFinancialSummary(),
          fetchInventorySummary(),
          fetchSentimentSummary(),
          fetchOverallAIInsights(),
        ])

        setMetrics({
          memberStats: memberStatsData,
          memberActivity: memberActivityData,
          memberInsights: memberInsightsData,
          trainerStats: trainerData.stats,
          trainerData: trainerData,
          productStats: productStatsData,
          topSales: topSalesData,
          financialSummary: financialData,
          inventorySummary: inventoryData,
          feedbackSummary: feedbackData,
          aiInsights: aiInsightsData,
        })
      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const getStatusColor = (value: number, type: "positive" | "negative" = "positive") => {
    if (type === "positive") {
      return value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "text-gray-600"
    }
    return value < 0 ? "text-green-600" : value > 0 ? "text-red-600" : "text-gray-600"
  }

  const getStatusIcon = (value: number, type: "positive" | "negative" = "positive") => {
    if (type === "positive") {
      return value > 0 ? (
        <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
      ) : value < 0 ? (
        <TrendingDown className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
      ) : null
    }
    return value < 0 ? (
      <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
    ) : value > 0 ? (
      <TrendingDown className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
    ) : null
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
        <AppSidebar />
        <main className="ml-0 lg:ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
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
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        </main>
      </div>
    )
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
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">DASHBOARD OVERVIEW</h1>
            <p className="text-gray-600 text-xs lg:text-sm">Comprehensive view of your fitness center performance</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 shadow-sm text-xs lg:text-sm">
              <DocumentTextIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Report</span>
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-xs lg:text-sm">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Export Data</span>
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-6 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            {/* Left & Center Column */}
            <div className="col-span-12 xl:col-span-8 space-y-4 lg:space-y-6">
              {/* Top Row - Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Members Card */}
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Members</h3>
                        <p className="text-xs text-gray-500">Total active members</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">{metrics.memberStats?.total || 0}</div>
                    <div className="flex items-center text-sm">
                      <span className="text-green-600 font-medium">{metrics.memberStats?.active || 0} active</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-blue-600 font-medium">{metrics.memberStats?.new_members || 0} new</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>Retention: {metrics.memberStats?.retention || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Trainers Card */}
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Trainers</h3>
                    <p className="text-xs text-gray-500">Active trainers</p>
                </div>
                </div>
                </div>
                <div className="space-y-2">
                {/* Change from total_trainers to active_trainers, or consider if you intended a different total */}
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">{metrics.trainerStats?.active_trainers || 0}</div>
                <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">{metrics.trainerStats?.active_trainers || 0} active</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-blue-600 font-medium">Avg: {metrics.trainerStats?.avg_satisfaction || 0}/5</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {/* Change from total_sessions to weekly_classes */}
                <span>Sessions: {metrics.trainerStats?.weekly_classes || 0}</span>
                </div>
                </div>
                </div>

                {/* Products Card */}
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Products</h3>
                        <p className="text-xs text-gray-500">Inventory & sales</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">{metrics.productStats?.total_products || 0}</div>
                    <div className="flex items-center text-sm">
                      <span className="text-green-600 font-medium">{metrics.productStats?.weekly_sales || 0} sold</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-orange-600 font-medium">{metrics.productStats?.low_stock || 0} low</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      <span>Supplements: {metrics.productStats?.total_supplements || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Finance Card */}
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Finance</h3>
                        <p className="text-xs text-gray-500">Monthly performance</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                      ${metrics.financialSummary?.total_income?.toLocaleString() || 0}
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-emerald-600 font-medium">
                        {metrics.financialSummary?.profit_margin || 0}% margin
                      </span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-red-600 font-medium">
                        ${metrics.financialSummary?.total_expenses?.toLocaleString() || 0} exp
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>Trend: {metrics.financialSummary?.income_trend || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Inventory Management */}
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Inventory Management</h3>
                        <p className="text-xs text-gray-500">Equipment & maintenance</p>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-emerald-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>+18%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-gray-900 mb-2">92</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Equipment Uptime</span>
                        <span className="font-medium">95% / 98%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Maintenance Cost</span>
                        <span className="font-medium">Rp 4.2M / No 5g</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: "70%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Stock Accuracy</span>
                        <span className="font-medium">98% / 95%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "98%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Feedback */}
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Member Feedback</h3>
                        <p className="text-xs text-gray-500">Satisfaction & sentiment</p>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-emerald-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>+12%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold text-gray-900">{metrics.feedbackSummary?.avg_rating || 0}</div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">/5</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Positive</span>
                        <span className="font-medium">{metrics.feedbackSummary?.positive_percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics.feedbackSummary?.positive_percentage || 0}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-600">Neutral</span>
                        <span className="font-medium">{metrics.feedbackSummary?.neutral_percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${metrics.feedbackSummary?.neutral_percentage || 0}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Negative</span>
                        <span className="font-medium">{metrics.feedbackSummary?.negative_percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${metrics.feedbackSummary?.negative_percentage || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Quick Stats</h3>
                        <p className="text-xs text-gray-500">Key performance indicators</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Peak Hours</span>
                      </div>
                      <span className="font-medium text-sm">7-9 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Avg Session</span>
                      </div>
                      <span className="font-medium text-sm">45 min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Growth Rate</span>
                      </div>
                      <span className="font-medium text-sm text-green-600">+12%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Alerts</span>
                      </div>
                      <span className="font-medium text-sm text-orange-600">3 pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Member Activity Trend */}
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900">Member Activity Trend</h3>
                      <p className="text-xs lg:text-sm text-gray-500">Monthly member activity</p>
                    </div>
                  </div>
                  <div className="h-64 lg:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics.memberActivity}>
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
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: "#2563eb" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900">Top Selling Products</h3>
                      <p className="text-xs lg:text-sm text-gray-500">Best performing products</p>
                    </div>
                  </div>
                  <div className="h-64 lg:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.topSales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#666" fontSize={12} />
                        <YAxis stroke="#666" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - AI Insights */}
            <div className="col-span-12 xl:col-span-4">
              <AIInsights insights={[...metrics.aiInsights, ...metrics.memberInsights]} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
