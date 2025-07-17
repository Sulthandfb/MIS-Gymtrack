"use client"

import { useEffect, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  Target,
  AlertCircle,
  Lightbulb,
  TrendingUpIcon,
  DollarSign,
  CreditCard,
  Filter,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts"
import { AppSidebar } from "@/components/Sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type {
  FinancialSummary,
  IncomeVsExpenseData,
  BreakdownData,
  Transaction,
  AIInsight,
  IncomeAnalysis,
  ExpenseAnalysis,
  TransactionFilters,
} from "@/types/finance"
import {
  fetchFinancialSummary,
  fetchIncomeVsExpenses,
  fetchIncomeBreakdown,
  fetchExpenseBreakdown,
  fetchRecentTransactions,
  fetchFinanceAIInsights,
  fetchIncomeAnalysis,
  fetchExpenseAnalysis,
  fetchFilteredTransactions,
} from "@/services/api"

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states for charts
  const [overviewChartFilter, setOverviewChartFilter] = useState("all") // all, 6months, 3months
  const [incomeChartFilter, setIncomeChartFilter] = useState("all")

  // Overview tab state
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [incomeVsExpenseData, setIncomeVsExpenseData] = useState<IncomeVsExpenseData[]>([])
  const [incomeBreakdownData, setIncomeBreakdownData] = useState<BreakdownData[]>([])
  const [expenseBreakdownData, setExpenseBreakdownData] = useState<BreakdownData[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([])

  // Income tab state
  const [incomeAnalysis, setIncomeAnalysis] = useState<IncomeAnalysis | null>(null)
  const [incomeTransactions, setIncomeTransactions] = useState<Transaction[]>([])
  const [incomeCategories, setIncomeCategories] = useState<string[]>([])
  const [incomeFilters, setIncomeFilters] = useState<TransactionFilters>({ type: "income", limit: 20 })

  // Expense tab state
  const [expenseAnalysis, setExpenseAnalysis] = useState<ExpenseAnalysis | null>(null)
  const [expenseTransactions, setExpenseTransactions] = useState<Transaction[]>([])
  const [expenseCategories, setExpenseCategories] = useState<string[]>([])
  const [expenseFilters, setExpenseFilters] = useState<TransactionFilters>({ type: "expense", limit: 20 })

  // Load overview data
  const loadOverviewData = async () => {
    try {
      setLoading(true)
      const [summary, incomeVsExpenses, incomeBreakdown, expenseBreakdown, transactions, insights] = await Promise.all([
        fetchFinancialSummary(),
        fetchIncomeVsExpenses(),
        fetchIncomeBreakdown(),
        fetchExpenseBreakdown(),
        fetchRecentTransactions(10),
        fetchFinanceAIInsights(),
      ])
      setFinancialSummary(summary)
      setIncomeVsExpenseData(incomeVsExpenses)
      setIncomeBreakdownData(incomeBreakdown)
      setExpenseBreakdownData(expenseBreakdown)
      setRecentTransactions(transactions)
      setAIInsights(insights)
    } catch (err) {
      setError("Failed to load financial data")
      console.error("Error loading overview data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Load income analysis data
  const loadIncomeData = async () => {
    try {
      const [analysis, filteredData] = await Promise.all([
        fetchIncomeAnalysis(),
        fetchFilteredTransactions(incomeFilters),
      ])
      setIncomeAnalysis(analysis)
      setIncomeTransactions(filteredData.transactions)
      setIncomeCategories(filteredData.categories)
    } catch (err) {
      console.error("Error loading income analysis:", err)
    }
  }

  // Load expense analysis data
  const loadExpenseData = async () => {
    try {
      const [analysis, filteredData] = await Promise.all([
        fetchExpenseAnalysis(),
        fetchFilteredTransactions(expenseFilters),
      ])
      setExpenseAnalysis(analysis)
      setExpenseTransactions(filteredData.transactions)
      setExpenseCategories(filteredData.categories)
    } catch (err) {
      console.error("Error loading expense analysis:", err)
    }
  }

  // Filter income transactions
  const filterIncomeTransactions = async (filters: TransactionFilters) => {
    try {
      const filteredData = await fetchFilteredTransactions({ ...filters, type: "income" })
      setIncomeTransactions(filteredData.transactions)
      setIncomeFilters({ ...filters, type: "income" })
    } catch (err) {
      console.error("Error filtering income transactions:", err)
    }
  }

  // Filter expense transactions
  const filterExpenseTransactions = async (filters: TransactionFilters) => {
    try {
      const filteredData = await fetchFilteredTransactions({ ...filters, type: "expense" })
      setExpenseTransactions(filteredData.transactions)
      setExpenseFilters({ ...filters, type: "expense" })
    } catch (err) {
      console.error("Error filtering expense transactions:", err)
    }
  }

  // Filter chart data based on selected period
  const getFilteredChartData = (data: any[], filterType: string) => {
    if (filterType === "all") return data

    const currentMonth = new Date().getMonth() + 1 // 1-12
    let startMonth = 1

    if (filterType === "6months") {
      startMonth = Math.max(1, currentMonth - 5)
    } else if (filterType === "3months") {
      startMonth = Math.max(1, currentMonth - 2)
    }

    return data.filter((item, index) => {
      const monthIndex = index + 1 // assuming data is ordered Jan-Dec
      return monthIndex >= startMonth && monthIndex <= currentMonth
    })
  }

  useEffect(() => {
    loadOverviewData()
  }, [])

  useEffect(() => {
    if (activeTab === "income" && !incomeAnalysis) {
      loadIncomeData()
    } else if (activeTab === "expenses" && !expenseAnalysis) {
      loadExpenseData()
    }
  }, [activeTab, incomeAnalysis, expenseAnalysis])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}M`
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}jt`
    } else if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}rb`
    }
    return formatCurrency(amount)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
        <AppSidebar />
        <main className="ml-0 lg:ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading financial data...</p>
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
            <Button onClick={loadOverviewData}>Try Again</Button>
          </div>
        </main>
      </div>
    )
  }

  // Get filtered data for charts
  const filteredOverviewData = getFilteredChartData(incomeVsExpenseData, overviewChartFilter)
  const filteredIncomeData = incomeAnalysis
    ? getFilteredChartData(incomeAnalysis.monthly_chart_data, incomeChartFilter)
    : []

  return (
    <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
      <AppSidebar />
      <main className="ml-0 lg:ml-64 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">FINANCE</h1>
            <p className="text-gray-600 text-xs lg:text-sm">
              Kelola dan analisis keuangan gym Anda dengan insight AI untuk keputusan bisnis yang lebih baik.
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 shadow-sm text-xs lg:text-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Report</span>
            </Button>
            <Button
              variant="outline"
              className="border border-gray-300 text-gray-700 font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-xs lg:text-sm bg-white"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Data</span>
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-6 flex-1 overflow-y-auto min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-gray-700 hover:text-blue-600 transition-colors"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-gray-700 hover:text-blue-600 transition-colors"
              >
                Income
              </TabsTrigger>
              <TabsTrigger
                value="expenses"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-gray-700 hover:text-blue-600 transition-colors"
              >
                Expenses
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-12 gap-4 lg:gap-6">
                {/* Left & Center Column */}
                <div className="col-span-12 xl:col-span-8 space-y-4 lg:space-y-6">
                  {/* Financial Summary Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs lg:text-sm font-medium text-gray-600">Profit Margin</div>
                        <Target className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                      </div>
                      <div className="text-xl lg:text-3xl font-bold text-gray-900">
                        {`${financialSummary?.profit_margin?.toFixed(1) ?? "0.0"}%`}
                      </div>
                      <div className="flex items-center text-xs text-blue-600 mt-1">
                        <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                        <span className="text-xs">
                          {financialSummary?.profit_margin_trend !== undefined
                            ? `${financialSummary.profit_margin_trend >= 0 ? "+" : ""}${financialSummary.profit_margin_trend.toFixed(1)}%`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                    </div>

                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs lg:text-sm font-medium text-gray-600">Total Income</div>
                        <TrendingUp className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                      </div>
                      <div className="text-xl lg:text-3xl font-bold text-gray-900">
                        {financialSummary ? formatCompactCurrency(financialSummary.total_income) : "Rp 0"}
                      </div>
                      <div className="flex items-center text-xs text-emerald-600 mt-1">
                        <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                        <span className="text-xs">
                          {financialSummary?.income_trend !== undefined
                            ? `${financialSummary.income_trend >= 0 ? "+" : ""}${financialSummary.income_trend.toFixed(1)}%`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                        <div className="bg-emerald-500 h-1 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>

                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs lg:text-sm font-medium text-gray-600">Total Expenses</div>
                        <TrendingDown className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                      </div>
                      <div className="text-xl lg:text-3xl font-bold text-gray-900">
                        {financialSummary ? formatCompactCurrency(financialSummary.total_expenses) : "Rp 0"}
                      </div>
                      <div className="flex items-center text-xs text-orange-600 mt-1">
                        <TrendingDown className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                        <span className="text-xs">
                          {financialSummary?.expense_trend !== undefined
                            ? `${financialSummary.expense_trend >= 0 ? "+" : ""}${financialSummary.expense_trend.toFixed(1)}%`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                        <div className="bg-orange-500 h-1 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Income vs Expenses Chart with Filter */}
                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <div>
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900">Statistik Keuangan</h3>
                        <p className="text-xs lg:text-sm text-gray-500">Grafik perbandingan income vs expenses</p>
                      </div>
                      <Select value={overviewChartFilter} onValueChange={setOverviewChartFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Bulan</SelectItem>
                          <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
                          <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="h-64 lg:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredOverviewData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" stroke="#666" fontSize={12} />
                          <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => formatCompactCurrency(value)} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                            formatter={(value: any, name: string) => [
                              formatCurrency(value),
                              name === "income" ? "Income" : "Expenses",
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="income"
                            stackId="1"
                            stroke="#10b981"
                            fill="rgba(16, 185, 129, 0.1)"
                          />
                          <Area
                            type="monotone"
                            dataKey="expenses"
                            stackId="2"
                            stroke="#ef4444"
                            fill="rgba(239, 68, 68, 0.1)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Breakdown Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Income Breakdown */}
                    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-sm lg:text-base font-semibold text-gray-800">Breakdown Income</h3>
                          <p className="text-xs lg:text-sm text-gray-500">Sumber pendapatan utama</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab("income")}>
                          View Details
                        </Button>
                      </div>
                      <div className="h-48 lg:h-56 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie data={incomeBreakdownData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                              {incomeBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`${value}%`, "Persentase"]} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 lg:gap-4 text-xs mt-4">
                        {incomeBreakdownData.map((item, index) => (
                          <div key={index} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expense Breakdown */}
                    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-sm lg:text-base font-semibold text-gray-800">Breakdown Expenses</h3>
                          <p className="text-xs lg:text-sm text-gray-500">Kategori pengeluaran utama</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab("expenses")}>
                          View Details
                        </Button>
                      </div>
                      <div className="h-48 lg:h-56 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie data={expenseBreakdownData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                              {expenseBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`${value}%`, "Persentase"]} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 lg:gap-4 text-xs mt-4">
                        {expenseBreakdownData.map((item, index) => (
                          <div key={index} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
                        <p className="text-xs lg:text-sm text-gray-500">10 transaksi terakhir</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold text-gray-900">Date</TableHead>
                            <TableHead className="font-semibold text-gray-900">Type</TableHead>
                            <TableHead className="font-semibold text-gray-900">Category</TableHead>
                            <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                            <TableHead className="font-semibold text-gray-900">Payment</TableHead>
                            <TableHead className="font-semibold text-gray-900">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentTransactions.map((transaction) => (
                            <TableRow key={transaction.id} className="hover:bg-gray-50">
                              <TableCell className="text-sm">
                                {new Date(transaction.date).toLocaleDateString("id-ID")}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={transaction.type === "income" ? "default" : "destructive"}
                                  className={
                                    transaction.type === "income"
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                      : "bg-red-100 text-red-800 border-red-200"
                                  }
                                >
                                  {transaction.type === "income" ? "Income" : "Expense"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{transaction.category}</TableCell>
                              <TableCell
                                className={`font-medium ${transaction.type === "income" ? "text-emerald-600" : "text-red-600"}`}
                              >
                                {transaction.type === "income" ? "+" : "-"}
                                {formatCurrency(transaction.amount)}
                              </TableCell>
                              <TableCell className="text-sm capitalize">{transaction.payment_method}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - AI Business Advisor */}
                <div className="col-span-12 xl:col-span-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 lg:p-6 rounded-lg shadow-lg text-white sticky top-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">AI BUSINESS INSIGHTS</h3>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {aiInsights
                        .filter(
                          (insight) => insight.category.includes("overview") || insight.category.includes("general"),
                        )
                        .map((insight) => (
                          <div
                            key={insight.id}
                            className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  insight.type === "recommendation"
                                    ? "bg-blue-500/20"
                                    : insight.type === "prediction"
                                      ? "bg-emerald-500/20"
                                      : insight.type === "opportunity"
                                        ? "bg-orange-500/20"
                                        : "bg-red-500/20"
                                }`}
                              >
                                {insight.type === "recommendation" && <Target className="w-4 h-4" />}
                                {insight.type === "prediction" && <TrendingUpIcon className="w-4 h-4" />}
                                {insight.type === "opportunity" && <Lightbulb className="w-4 h-4" />}
                                {insight.type === "warning" && <AlertCircle className="w-4 h-4" />}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-2">{insight.title}</h4>
                                <div className="text-xs opacity-90 leading-relaxed whitespace-pre-line">
                                  {insight.description}
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      insight.impact === "high"
                                        ? "border-red-300 text-red-100"
                                        : insight.impact === "medium"
                                          ? "border-yellow-300 text-yellow-100"
                                          : "border-green-300 text-green-100"
                                    }`}
                                  >
                                    {insight.impact} impact
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Income Tab */}
            <TabsContent value="income" className="space-y-4 lg:space-y-6">
              {incomeAnalysis ? (
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                  <div className="col-span-12 xl:col-span-8 space-y-4 lg:space-y-6">
                    {/* Income Summary Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
                      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs lg:text-sm font-medium text-gray-600">Total Income Bulan Ini</div>
                          <DollarSign className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                        </div>
                        <div className="text-xl lg:text-3xl font-bold text-gray-900">
                          {formatCompactCurrency(incomeAnalysis.current_month_total)}
                        </div>
                        <div className="flex items-center text-xs text-emerald-600 mt-1">
                          <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4 mr-1" />
                          <span className="text-xs">
                            {incomeAnalysis.growth_percentage !== undefined
                              ? `${incomeAnalysis.growth_percentage >= 0 ? "+" : ""}${incomeAnalysis.growth_percentage.toFixed(1)}%`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                          <div className="bg-emerald-500 h-1 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                      </div>

                      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs lg:text-sm font-medium text-gray-600">Sumber Terbesar</div>
                          <TrendingUp className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                        </div>
                        <div className="text-xl lg:text-3xl font-bold text-gray-900">
                          {incomeAnalysis.biggest_source.name}
                        </div>
                        <div className="flex items-center text-xs text-blue-600 mt-1">
                          <span className="text-xs">{formatCompactCurrency(incomeAnalysis.biggest_source.amount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                          <div className="bg-blue-500 h-1 rounded-full" style={{ width: "70%" }}></div>
                        </div>
                      </div>

                      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs lg:text-sm font-medium text-gray-600">Growth Rate</div>
                          <TrendingUpIcon className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                        </div>
                        <div className="text-xl lg:text-3xl font-bold text-gray-900">
                          +{incomeAnalysis.growth_percentage}%
                        </div>
                        <div className="flex items-center text-xs text-purple-600 mt-1">
                          <span className="text-xs">Pertumbuhan bulanan</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                          <div className="bg-purple-500 h-1 rounded-full" style={{ width: "80%" }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Income Trend Chart with Filter */}
                    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <div>
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Tren Pendapatan</h3>
                          <p className="text-xs lg:text-sm text-gray-500">Pendapatan per kategori sepanjang tahun</p>
                        </div>
                        <Select value={incomeChartFilter} onValueChange={setIncomeChartFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Bulan</SelectItem>
                            <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
                            <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="h-64 lg:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={filteredIncomeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#666" fontSize={12} />
                            <YAxis
                              stroke="#666"
                              fontSize={12}
                              tickFormatter={(value) => formatCompactCurrency(value)}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                              formatter={(value: any, name: string) => [formatCurrency(value), name.replace("_", " ")]}
                            />
                            <Line
                              type="monotone"
                              dataKey="membership"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="personal_training"
                              stroke="#10b981"
                              strokeWidth={2}
                              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="class_fee"
                              stroke="#f59e0b"
                              strokeWidth={2}
                              dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="product_sale"
                              stroke="#ef4444"
                              strokeWidth={2}
                              dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Income by Source Bar Chart */}
                    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Income by Source</h3>
                          <p className="text-xs lg:text-sm text-gray-500">Perbandingan pendapatan per sumber</p>
                        </div>
                      </div>
                      <div className="h-64 lg:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={incomeBreakdownData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#666" fontSize={12} />
                            <YAxis
                              stroke="#666"
                              fontSize={12}
                              tickFormatter={(value) => formatCompactCurrency(value)}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                              formatter={(value: any) => [formatCurrency(value), "Amount"]}
                            />
                            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Income History Table */}
                    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                        <div>
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Income History</h3>
                          <p className="text-xs lg:text-sm text-gray-500">Riwayat transaksi pendapatan</p>
                        </div>
                        <div className="flex gap-2">
                          <Select
                            value={incomeFilters.category || "all"}
                            onValueChange={(value) =>
                              filterIncomeTransactions({
                                ...incomeFilters,
                                category: value === "all" ? undefined : value,
                              })
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Filter Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {incomeCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                          </Button>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-semibold text-gray-900">Date</TableHead>
                              <TableHead className="font-semibold text-gray-900">Category</TableHead>
                              <TableHead className="font-semibold text-gray-900">Description</TableHead>
                              <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                              <TableHead className="font-semibold text-gray-900">Payment Method</TableHead>
                              <TableHead className="font-semibold text-gray-900">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {incomeTransactions.map((transaction) => (
                              <TableRow key={transaction.id} className="hover:bg-gray-50">
                                <TableCell className="text-sm">
                                  {new Date(transaction.date).toLocaleDateString("id-ID")}
                                </TableCell>
                                <TableCell className="text-sm">{transaction.category}</TableCell>
                                <TableCell className="text-sm">{transaction.description}</TableCell>
                                <TableCell className="font-medium text-emerald-600">
                                  +{formatCurrency(transaction.amount)}
                                </TableCell>
                                <TableCell className="text-sm capitalize">{transaction.payment_method}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="bg-emerald-50 text-emerald-700 border-emerald-200"
                                  >
                                    {transaction.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>

                  {/* AI Income Insights */}
                  <div className="col-span-12 xl:col-span-4">
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 lg:p-6 rounded-lg shadow-lg text-white sticky top-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">AI INCOME INSIGHTS</h3>
                      </div>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {aiInsights
                          .filter(
                            (insight) => insight.category.includes("revenue") || insight.category.includes("income"),
                          )
                          .map((insight) => (
                            <div
                              key={insight.id}
                              className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/20">
                                  <TrendingUp className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-2">{insight.title}</h4>
                                  <div className="text-xs opacity-90 leading-relaxed whitespace-pre-line">
                                    {insight.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading income analysis...</p>
                </div>
              )}
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent value="expenses" className="space-y-4 lg:space-y-6">
              {expenseAnalysis ? (
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                  <div className="col-span-12 xl:col-span-8 space-y-4 lg:space-y-6">
                    {/* Expense Summary Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
                      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs lg:text-sm font-medium text-gray-600">Total Expenses Bulan Ini</div>
                          <CreditCard className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                        </div>
                        <div className="text-xl lg:text-3xl font-bold text-gray-900">
                          {formatCompactCurrency(expenseAnalysis.current_month_total)}
                        </div>
                        <div className="flex items-center text-xs text-orange-600 mt-1">
                          <span className="text-xs">Pengeluaran bulanan</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                          <div className="bg-orange-500 h-1 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                      </div>

                      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs lg:text-sm font-medium text-gray-600">Kategori Terbesar</div>
                          <TrendingDown className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                        </div>
                        <div className="text-xl lg:text-3xl font-bold text-gray-900">
                          {expenseAnalysis.biggest_category.name}
                        </div>
                        <div className="flex items-center text-xs text-orange-600 mt-1">
                          <span className="text-xs">
                            {formatCompactCurrency(expenseAnalysis.biggest_category.amount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                          <div className="bg-orange-500 h-1 rounded-full" style={{ width: "70%" }}></div>
                        </div>
                      </div>

                      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs lg:text-sm font-medium text-gray-600">Fixed vs Variable</div>
                          <Target className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
                        </div>
                        <div className="text-xl lg:text-3xl font-bold text-gray-900">
                          {`${expenseAnalysis.fixed_vs_variable.fixed_percentage}% : ${expenseAnalysis.fixed_vs_variable.variable_percentage}%`}
                        </div>
                        <div className="flex items-center text-xs text-purple-600 mt-1">
                          <span className="text-xs">Fixed vs Variable ratio</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2 lg:mt-3">
                          <div className="bg-purple-500 h-1 rounded-full" style={{ width: "60%" }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Fixed vs Variable Expenses Chart */}
                    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <div>
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                            Fixed vs Variable Expenses
                          </h3>
                          <p className="text-xs lg:text-sm text-gray-500">Perbandingan biaya tetap dan variabel</p>
                        </div>
                      </div>
                      <div className="h-64 lg:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={expenseAnalysis.monthly_chart_data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#666" fontSize={12} />
                            <YAxis
                              stroke="#666"
                              fontSize={12}
                              tickFormatter={(value) => formatCompactCurrency(value)}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                              formatter={(value: any, name: string) => [
                                formatCurrency(value),
                                name === "fixed" ? "Fixed" : name === "variable" ? "Variable" : "Total",
                              ]}
                            />
                            <Line
                              type="monotone"
                              dataKey="fixed"
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="variable"
                              stroke="#f59e0b"
                              strokeWidth={2}
                              dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="total"
                              stroke="#ef4444"
                              strokeWidth={2}
                              dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Expense Breakdown Bar Chart */}
                    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Expenses Breakdown</h3>
                          <p className="text-xs lg:text-sm text-gray-500">Breakdown pengeluaran per kategori</p>
                        </div>
                      </div>
                      <div className="h-64 lg:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={expenseBreakdownData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#666" fontSize={12} />
                            <YAxis
                              stroke="#666"
                              fontSize={12}
                              tickFormatter={(value) => formatCompactCurrency(value)}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                              formatter={(value: any) => [formatCurrency(value), "Amount"]}
                            />
                            <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Expense History Table */}
                    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                        <div>
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Expense History</h3>
                          <p className="text-xs lg:text-sm text-gray-500">Riwayat transaksi pengeluaran</p>
                        </div>
                        <div className="flex gap-2">
                          <Select
                            value={expenseFilters.category || "all"}
                            onValueChange={(value) =>
                              filterExpenseTransactions({
                                ...expenseFilters,
                                category: value === "all" ? undefined : value,
                              })
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Filter Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {expenseCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                          </Button>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-semibold text-gray-900">Date</TableHead>
                              <TableHead className="font-semibold text-gray-900">Category</TableHead>
                              <TableHead className="font-semibold text-gray-900">Description</TableHead>
                              <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                              <TableHead className="font-semibold text-gray-900">Payment Method</TableHead>
                              <TableHead className="font-semibold text-gray-900">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {expenseTransactions.map((transaction) => (
                              <TableRow key={transaction.id} className="hover:bg-gray-50">
                                <TableCell className="text-sm">
                                  {new Date(transaction.date).toLocaleDateString("id-ID")}
                                </TableCell>
                                <TableCell className="text-sm">{transaction.category}</TableCell>
                                <TableCell className="text-sm">{transaction.description}</TableCell>
                                <TableCell className="font-medium text-red-600">
                                  -{formatCurrency(transaction.amount)}
                                </TableCell>
                                <TableCell className="text-sm capitalize">{transaction.payment_method}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    {transaction.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>

                  {/* AI Expense Insights */}
                  <div className="col-span-12 xl:col-span-4">
                    <div className="bg-gradient-to-br from-red-600 to-red-800 p-4 lg:p-6 rounded-lg shadow-lg text-white sticky top-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingDown className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">AI EXPENSE INSIGHTS</h3>
                      </div>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {aiInsights
                          .filter(
                            (insight) =>
                              insight.category.includes("cost") ||
                              insight.category.includes("expense") ||
                              insight.category.includes("budget"),
                          )
                          .map((insight) => (
                            <div
                              key={insight.id}
                              className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-red-500/20">
                                  <AlertCircle className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-2">{insight.title}</h4>
                                  <div className="text-xs opacity-90 leading-relaxed whitespace-pre-line">
                                    {insight.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading expense analysis...</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
