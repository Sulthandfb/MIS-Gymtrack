"use client"

import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

interface MonthlyTrend {
  month: number
  month_name: string
  positive_percentage: number
  neutral_percentage: number
  negative_percentage: number
  total_feedback: number
}

interface TopicComparison {
  improving: Array<{
    topic: string
    change_percentage: number
    first_half_sentiment: number
    second_half_sentiment: number
  }>
  declining: Array<{
    topic: string
    change_percentage: number
    first_half_sentiment: number
    second_half_sentiment: number
  }>
}

interface SixMonthTrendProps {
  monthlyTrends: MonthlyTrend[]
  topicComparison: TopicComparison
}

export function SixMonthTrend({ monthlyTrends, topicComparison }: SixMonthTrendProps) {
  if (!monthlyTrends || monthlyTrends.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Loading trend data...</p>
        </div>
      </div>
    )
  }

  // Filter to last 6 months with data
  const last6Months = monthlyTrends.filter((month) => month.total_feedback > 0).slice(-6)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Tren Sentimen 6 Bulan Terakhir</h3>
            <p className="text-blue-700 text-sm">
              Analisis tren sentimen menunjukkan perubahan dalam sentimen positif selama 6 bulan terakhir, dengan
              identifikasi topik yang mengalami peningkatan dan penurunan.
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Trend Bars */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="space-y-4">
          {last6Months.map((month, index) => (
            <div key={month.month} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{month.month_name} 2024</span>
                <span className="font-semibold text-gray-900">{month.positive_percentage}% Positif</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="h-full flex">
                  <div
                    className="bg-green-500 h-full transition-all duration-300"
                    style={{ width: `${month.positive_percentage}%` }}
                  />
                  <div
                    className="bg-yellow-400 h-full transition-all duration-300"
                    style={{ width: `${month.neutral_percentage}%` }}
                  />
                  <div
                    className="bg-red-500 h-full transition-all duration-300"
                    style={{ width: `${month.negative_percentage}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500">Total feedback: {month.total_feedback}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Improving Topics */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Topik dengan Peningkatan Sentimen</h4>
          </div>
          <div className="space-y-3">
            {topicComparison.improving && topicComparison.improving.length > 0 ? (
              topicComparison.improving.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-900">{topic.topic}</span>
                  <span className="font-semibold text-green-600">+{topic.change_percentage}%</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Tidak ada topik dengan peningkatan signifikan</p>
            )}
          </div>
        </div>

        {/* Declining Topics */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Topik dengan Penurunan Sentimen</h4>
          </div>
          <div className="space-y-3">
            {topicComparison.declining && topicComparison.declining.length > 0 ? (
              topicComparison.declining.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-gray-900">{topic.topic}</span>
                  <span className="font-semibold text-red-600">{topic.change_percentage}%</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Tidak ada topik dengan penurunan signifikan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
