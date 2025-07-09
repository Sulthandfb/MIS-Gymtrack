"use client"

import { useEffect, useState } from "react"
import { Download, Calendar, DollarSign, TrendingUp, BarChart3, PieChart, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AIInsights } from "@/components/AIInsights"
import { RevenueChart } from "@/components/finance/revenue-chart"
import { ExpenseChart } from "@/components/finance/expense-chart"
import { MonthlyTrendChart } from "@/components/finance/monthly-trend-chart"
import { CashFlowChart } from "@/components/finance/cash-flow-chart"
import { BudgetVarianceTable } from "@/components/finance/budget-variance-table"
import { FinancialTargetsTable } from "@/components/finance/financial-targets-table"
import { PaymentMethodChart } from "@/components/finance/payment-method-chart"
import {
  fetchFinanceOverview,
  fetchRevenueBreakdown,
  fetchExpenseBreakdown,
  fetchMonthlyTrend,
  fetchCashFlow,
  fetchBudgetVariance,
  fetchFinancialTargets,
  fetchPaymentMethods,
  fetchFinancialInsights,
} from "@/services/api"

import type {
  FinanceOverviewStats,
  RevenueBreakdown,
  ExpenseBreakdown,
  MonthlyTrendData,
  CashFlowData,
  BudgetVarianceData,
  FinancialTargetData,
  PaymentMethodData,
  FinanceInsight,
} from "@/types/finance"

export function FinanceDashboardTab() {
  // State for period filter
  const [period, setPeriod] = useState("12months")

  // State for data
  const [overview, setOverview] = useState<FinanceOverviewStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueBreakdown | null>(null)
  const [expenseData, setExpenseData] = useState<ExpenseBreakdown | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendData[]>([])
  const [cashFlow, setCashFlow] = useState<CashFlowData[]>([])
  const [budgetVariance, setBudgetVariance] = useState<BudgetVarianceData[]>([])
  const [financialTargets, setFinancialTargets] = useState<FinancialTargetData[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([])
  const [insights, setInsights] = useState<FinanceInsight[]>([])

  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data on component mount and when period changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [overviewData, revenue, expense, monthly, cash, budget, targets, payments, financeInsights] =
          await Promise.all([
            fetchFinanceOverview(period),
            fetchRevenueBreakdown(period),
            fetchExpenseBreakdown(period),
            fetchMonthlyTrend(12),
            fetchCashFlow(30),
            fetchBudgetVariance(new Date().getFullYear()),
            fetchFinancialTargets(new Date().getFullYear()),
            fetchPaymentMethods(period),
            fetchFinancialInsights(period),
          ])

        // Update state with fetched data
        setOverview(overviewData)
        setRevenueData(revenue)
        setExpenseData(expense)
        setMonthlyTrend(monthly)
        setCashFlow(cash)
        setBudgetVariance(budget)
        setFinancialTargets(targets)
        setPaymentMethods(payments)
        
        // Ensure insights is always an array
        if (Array.isArray(financeInsights)) {
          setInsights(financeInsights)
        } else {
          console.warn("financeInsights is not an array:", financeInsights)
          setInsights([])
        }
      } catch (err) {
        console.error("Error loading finance data:", err)
        setError(err instanceof Error ? err.message : "Failed to load finance data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [period])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Get trend indicator class based on value
  const getTrendClass = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-gray-600"
  }

  // Get trend icon based on value
  const getTrendIcon = (value: number) => {
    if (value > 0) return "↑"
    if (value < 0) return "↓"
    return "→"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 font-medium">Memuat data keuangan...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <span className="text-red-800 font-semibold text-lg">Error loading finance data</span>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Finance Dashboard</h1>
                <p className="text-gray-600">Analisis keuangan dan performa bisnis</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[180px]">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Pilih Periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1 Bulan Terakhir</SelectItem>
                    <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
                    <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
                    <SelectItem value="12months">12 Bulan Terakhir</SelectItem>
                    <SelectItem value="ytd">Tahun Berjalan</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 bg-white">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Revenue Card */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-2">
                  <CardDescription>Total Pendapatan</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(overview.total_revenue)}</CardTitle>
                  <div className={`text-sm flex items-center ${getTrendClass(overview.monthly_growth)}`}>
                    <span className="mr-1">{getTrendIcon(overview.monthly_growth)}</span>
                    <span>{Math.abs(overview.monthly_growth).toFixed(1)}% dari periode sebelumnya</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 flex items-center">
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Total Expenses Card */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-2">
                  <CardDescription>Total Pengeluaran</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(overview.total_expenses)}</CardTitle>
                  <div className="text-sm text-gray-500">
                    Periode{" "}
                    {period === "1month"
                      ? "1 bulan"
                      : period === "3months"
                        ? "3 bulan"
                        : period === "6months"
                          ? "6 bulan"
                          : period === "ytd"
                            ? "tahun berjalan"
                            : "12 bulan"}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 flex items-center">
                    <BarChart3 className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Net Profit Card */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-2">
                  <CardDescription>Keuntungan Bersih</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(overview.net_profit)}</CardTitle>
                  <div className={`text-sm ${overview.net_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {overview.net_profit >= 0 ? "Profit" : "Rugi"}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Profit Margin Card */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-2">
                  <CardDescription>Margin Keuntungan</CardDescription>
                  <CardTitle className="text-2xl">{overview.profit_margin.toFixed(1)}%</CardTitle>
                  <div className="text-sm text-gray-500">Target: 20%</div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 flex items-center">
                    <PieChart className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Revenue and Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle>Breakdown Pendapatan</CardTitle>
                <CardDescription>Distribusi sumber pendapatan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">{revenueData && <RevenueChart data={revenueData} />}</div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle>Breakdown Pengeluaran</CardTitle>
                <CardDescription>Distribusi kategori pengeluaran</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">{expenseData && <ExpenseChart data={expenseData} />}</div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend Chart */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle>Tren Bulanan</CardTitle>
              <CardDescription>Pendapatan, pengeluaran, dan profit bulanan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">{monthlyTrend.length > 0 && <MonthlyTrendChart data={monthlyTrend} />}</div>
            </CardContent>
          </Card>

          {/* Cash Flow Chart */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle>Cash Flow</CardTitle>
              <CardDescription>Analisis arus kas harian (30 hari terakhir)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">{cashFlow.length > 0 && <CashFlowChart data={cashFlow} />}</div>
            </CardContent>
          </Card>

          {/* Budget Variance and Financial Targets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Variance */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle>Analisis Budget</CardTitle>
                <CardDescription>Perbandingan budget vs aktual</CardDescription>
              </CardHeader>
              <CardContent>{budgetVariance.length > 0 && <BudgetVarianceTable data={budgetVariance} />}</CardContent>
            </Card>

            {/* Financial Targets */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle>Target Keuangan</CardTitle>
                <CardDescription>Pencapaian target keuangan</CardDescription>
              </CardHeader>
              <CardContent>
                {financialTargets.length > 0 && <FinancialTargetsTable data={financialTargets} />}
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods and AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle>Metode Pembayaran</CardTitle>
                <CardDescription>Distribusi metode pembayaran</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">{paymentMethods.length > 0 && <PaymentMethodChart data={paymentMethods} />}</div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="shadow-sm border-gray-200">
              <AIInsights insights={insights} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}