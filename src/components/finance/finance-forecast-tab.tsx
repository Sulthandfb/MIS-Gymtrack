"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Calendar, AlertTriangle, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { fetchCashFlowForecast } from "@/services/api"
import type { FinancialForecast } from "@/types/finance"

export function FinanceForecastTab() {
  const [forecastPeriod, setForecastPeriod] = useState("3")
  const [forecast, setForecast] = useState<FinancialForecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadForecast = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchCashFlowForecast(Number(forecastPeriod))
        setForecast(data)
      } catch (err) {
        console.error("Error loading forecast:", err)
        setError(err instanceof Error ? err.message : "Failed to load forecast")
      } finally {
        setLoading(false)
      }
    }

    loadForecast()
  }, [forecastPeriod])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Memuat prediksi keuangan...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
          <span className="text-red-800 font-semibold text-lg">Error loading forecast</span>
        </div>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Prediksi & Forecast</h1>
          <p className="text-gray-600">Prediksi keuangan berdasarkan tren historis</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Periode Prediksi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Bulan ke Depan</SelectItem>
              <SelectItem value="3">3 Bulan ke Depan</SelectItem>
              <SelectItem value="6">6 Bulan ke Depan</SelectItem>
              <SelectItem value="12">12 Bulan ke Depan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Forecast Chart */}
      {forecast && forecast.predictions.length > 0 && (
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Prediksi Cash Flow
            </CardTitle>
            <CardDescription>Prediksi pendapatan, pengeluaran, dan profit untuk {forecast.period}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.predictions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted_revenue"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Prediksi Pendapatan"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted_expenses"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                    name="Prediksi Pengeluaran"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted_profit"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Prediksi Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast Summary Cards */}
      {forecast && forecast.predictions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-2">
              <CardDescription>Total Prediksi Pendapatan</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {formatCurrency(forecast.predictions.reduce((sum, p) => sum + p.predicted_revenue, 0))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Untuk {forecast.period}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-2">
              <CardDescription>Total Prediksi Pengeluaran</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {formatCurrency(forecast.predictions.reduce((sum, p) => sum + p.predicted_expenses, 0))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Untuk {forecast.period}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-2">
              <CardDescription>Total Prediksi Profit</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {formatCurrency(forecast.predictions.reduce((sum, p) => sum + p.predicted_profit, 0))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Untuk {forecast.period}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Key Assumptions and Risk Factors */}
      {forecast && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Assumptions */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Asumsi Utama
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {forecast.key_assumptions.map((assumption, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{assumption}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Risk Factors */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Faktor Risiko
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {forecast.risk_factors.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confidence Levels */}
      {forecast && forecast.predictions.length > 0 && (
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Tingkat Kepercayaan Prediksi</CardTitle>
            <CardDescription>Akurasi prediksi menurun seiring dengan jarak waktu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forecast.predictions.map((prediction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{prediction.month}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${prediction.confidence_level * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">
                      {(prediction.confidence_level * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Default export
export default FinanceForecastTab
