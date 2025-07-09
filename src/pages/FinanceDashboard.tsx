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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type {
  FinancialSummary,
  IncomeVsExpenseData,
  BreakdownData,
  Transaction,
  AIInsight,
  IncomeAnalysis,
  ExpenseAnalysis,
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
} from "@/services/api"

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [incomeVsExpenseData, setIncomeVsExpenseData] = useState<IncomeVsExpenseData[]>([])
  const [incomeBreakdownData, setIncomeBreakdownData] = useState<BreakdownData[]>([])
  const [expenseBreakdownData, setExpenseBreakdownData] = useState<BreakdownData[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([])

  const [incomeAnalysis, setIncomeAnalysis] = useState<IncomeAnalysis | null>(null)
  const [expenseAnalysis, setExpenseAnalysis] = useState<ExpenseAnalysis | null>(null)

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
      
      // Filter and validate breakdown data with proper null checks
      const validIncomeBreakdown = incomeBreakdown.filter((d) => d && d.name && d.value != null)
      const validExpenseBreakdown = expenseBreakdown.filter((d) => d && d.name && d.value != null)
      
      setIncomeBreakdownData(validIncomeBreakdown)
      setExpenseBreakdownData(validExpenseBreakdown)
      setRecentTransactions(transactions)
      setAIInsights(insights)
    } catch (err) {
      setError("Failed to load financial data")
      console.error("Error loading overview data:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadIncomeData = async () => {
    try {
      const analysis = await fetchIncomeAnalysis()
      setIncomeAnalysis(analysis)
    } catch (err) {
      console.error("Error loading income analysis:", err)
    }
  }

  const loadExpenseData = async () => {
    try {
      const analysis = await fetchExpenseAnalysis()
      setExpenseAnalysis(analysis)
    } catch (err) {
      console.error("Error loading expense analysis:", err)
    }
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
  }, [activeTab])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
    if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
    if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`
    return formatCurrency(amount)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-600">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>{error}</p>
        <Button onClick={loadOverviewData} className="mt-4">Try Again</Button>
      </div>
    )
  }

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
              className="border border-gray-300 text-gray-700 font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-xs lg:text-sm bg-transparent"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Data</span>
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-6 flex-1 overflow-y-auto min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-12 gap-4 lg:gap-6">
                {/* Left & Center Column */}
                <div className="col-span-12 xl:col-span-8 space-y-4 lg:space-y-6">
                  {/* Financial Summary Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 lg:p-6 rounded-lg shadow-sm text-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium opacity-90">Profit Margin</div>
                        <Target className="w-5 h-5 opacity-80" />
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold">
                        {financialSummary?.profit_margin?.toFixed(1) ?? "0.0"}%
                      </div>
                      <div className="flex items-center text-sm mt-2">
                        {(financialSummary?.profit_margin_trend ?? 0) >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        <span>
                          {(financialSummary?.profit_margin_trend ?? 0) >= 0 ? "+" : ""}
                          {financialSummary?.profit_margin_trend?.toFixed(1) ?? "0.0"}% dari bulan lalu
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-600">Total Income</div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                        {financialSummary ? formatCompactCurrency(financialSummary.total_income) : "Rp 0"}
                      </div>
                      <div className="flex items-center text-sm text-green-600 mt-2">
                        {(financialSummary?.income_trend ?? 0) >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        <span>
                          {(financialSummary?.income_trend ?? 0) >= 0 ? "+" : ""}
                          {financialSummary?.income_trend?.toFixed(1) ?? "0.0"}% dari bulan lalu
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-600">Total Expenses</div>
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                        {financialSummary ? formatCompactCurrency(financialSummary.total_expenses) : "Rp 0"}
                      </div>
                      <div className="flex items-center text-sm mt-2">
                        {(financialSummary?.expense_trend ?? 0) >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1 text-red-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1 text-green-600" />
                        )}
                        <span
                          className={(financialSummary?.expense_trend ?? 0) >= 0 ? "text-red-600" : "text-green-600"}
                        >
                          {(financialSummary?.expense_trend ?? 0) >= 0 ? "+" : ""}
                          {financialSummary?.expense_trend?.toFixed(1) ?? "0.0"}% dari bulan lalu
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Income vs Expenses Chart */}
                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <div>
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900">Statistik Keuangan</h3>
                        <p className="text-xs lg:text-sm text-gray-500">Grafik perbandingan income vs expenses</p>
                      </div>
                      <Select defaultValue="yearly">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="h-64 lg:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={incomeVsExpenseData}>
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
                                <Cell key={`income-cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`${value}%`, "Persentase"]} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 lg:gap-4 text-xs mt-4">
                        {incomeBreakdownData.map((item, index) => (
                          <div key={`income-legend-${index}`} className="flex items-center gap-1.5">
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
                                <Cell key={`expense-cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`${value}%`, "Persentase"]} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 lg:gap-4 text-xs mt-4">
                        {expenseBreakdownData.map((item, index) => (
                          <div key={`expense-legend-${index}`} className="flex items-center gap-1.5">
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
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentTransactions.map((transaction) => (
                            <TableRow key={`transaction-${transaction.id}`}>
                              <TableCell className="text-sm">
                                {new Date(transaction.date).toLocaleDateString("id-ID")}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={transaction.type === "income" ? "default" : "destructive"}
                                  className={
                                    transaction.type === "income"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {transaction.type === "income" ? "Income" : "Expense"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{transaction.category}</TableCell>
                              <TableCell
                                className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                              >
                                {transaction.type === "income" ? "+" : "-"}
                                {formatCurrency(transaction.amount)}
                              </TableCell>
                              <TableCell className="text-sm capitalize">{transaction.payment_method}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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
                      <h3 className="text-lg font-semibold">AI BUSINESS ADVISOR</h3>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                      {aiInsights.map((insight, index) => (
                        <div
                          key={`ai-insight-${insight.id || index}`}
                          className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                insight.type === "recommendation"
                                  ? "bg-blue-500/20"
                                  : insight.type === "prediction"
                                    ? "bg-green-500/20"
                                    : insight.type === "opportunity"
                                      ? "bg-yellow-500/20"
                                      : "bg-red-500/20"
                              }`}
                            >
                              {insight.type === "recommendation" && <Target className="w-4 h-4" />}
                              {insight.type === "prediction" && <TrendingUpIcon className="w-4 h-4" />}
                              {insight.type === "opportunity" && <Lightbulb className="w-4 h-4" />}
                              {insight.type === "warning" && <AlertCircle className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                              <p className="text-xs opacity-90 leading-relaxed">{insight.description}</p>
                              <div className="flex items-center gap-2 mt-2">
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
            <TabsContent value="income" className="space-y-6">
              {incomeAnalysis ? (
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                  <div className="col-span-12 xl:col-span-8 space-y-4 lg:space-y-6">
                    {/* Income Summary Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Total Income Bulan Ini</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {formatCompactCurrency(incomeAnalysis.current_month_total || 0)}
                          </div>
                          <div className="flex items-center text-sm text-green-600 mt-2">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span>+{incomeAnalysis.growth_percentage ?? 0}% dari bulan lalu</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Sumber Terbesar</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {incomeAnalysis.biggest_source?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-600 mt-2">
                            {formatCompactCurrency(incomeAnalysis.biggest_source?.amount ?? 0)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Growth Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl lg:text-3xl font-bold text-green-600">
                            +{incomeAnalysis.growth_percentage ?? 0}%
                          </div>
                          <div className="text-sm text-gray-600 mt-2">Pertumbuhan bulanan</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Income Trend Chart */}
                    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <div>
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Tren Pendapatan</h3>
                          <p className="text-xs lg:text-sm text-gray-500">Pendapatan per kategori sepanjang tahun</p>
                        </div>
                      </div>
                      <div className="h-64 lg:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={incomeAnalysis.monthly_chart_data || []}>
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
                              formatter={(value: any, name: string) => [formatCurrency(value), name.replace("_", " ")]}
                            />
                            <Line type="monotone" dataKey="membership" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
                            <Line type="monotone" dataKey="personal_training" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
                            <Line type="monotone" dataKey="class_fee" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} />
                            <Line type="monotone" dataKey="product_sale" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} />
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
                          <BarChart data={incomeBreakdownData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#666" fontSize={12} />
                            <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => formatCompactCurrency(value)} />
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
                  </div>

                  {/* AI Income Insights */}
                  <div className="col-span-12 xl:col-span-4">
                    <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 lg:p-6 rounded-lg shadow-lg text-white sticky top-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">AI INCOME INSIGHTS</h3>
                      </div>
                      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                        {aiInsights.filter((insight) => insight.category.includes("revenue") || insight.category.includes("income")).length > 0 ? (
                          aiInsights
                            .filter((insight) => insight.category.includes("revenue") || insight.category.includes("income"))
                            .map((insight) => (
                              <div key={insight.id} className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-green-500/20">
                                    <TrendingUp className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                                    <p className="text-xs opacity-90 leading-relaxed">{insight.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-white/80 text-center">Belum ada insight untuk income.</p>
                        )}
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
            <TabsContent value="expenses" className="space-y-6">
              {expenseAnalysis ? (
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                  <div className="col-span-12 xl:col-span-8 space-y-4 lg:space-y-6">
                    {/* Expense Summary Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Total Expenses Bulan Ini</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {formatCompactCurrency(expenseAnalysis.current_month_total || 0)}
                          </div>
                          <div className="text-sm text-gray-600 mt-2">Pengeluaran bulanan</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Kategori Terbesar</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {expenseAnalysis.biggest_category?.name ?? "N/A"}
                          </div>
                          <div className="text-sm text-gray-600 mt-2">
                            {formatCompactCurrency(expenseAnalysis.biggest_category?.amount ?? 0)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Fixed vs Variable</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {(expenseAnalysis.fixed_vs_variable?.fixed_percentage ?? 0)}% :{" "}
                            {(expenseAnalysis.fixed_vs_variable?.variable_percentage ?? 0)}%
                          </div>
                          <div className="text-sm text-gray-600 mt-2">Fixed vs Variable ratio</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Fixed vs Variable Expenses Chart */}
                    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <div>
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Fixed vs Variable Expenses</h3>
                          <p className="text-xs lg:text-sm text-gray-500">Perbandingan biaya tetap dan variabel</p>
                        </div>
                      </div>
                      <div className="h-64 lg:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={expenseAnalysis.monthly_chart_data || []}>
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
                                name === "fixed" ? "Fixed" : name === "variable" ? "Variable" : "Total",
                              ]}
                            />
                            <Line type="monotone" dataKey="fixed" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="variable" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
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
                            <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => formatCompactCurrency(value)} />
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
                  </div>

                  {/* AI Expense Insights */}
                  <div className="col-span-12 xl:col-span-4">
                    <div className="bg-gradient-to-br from-red-600 to-red-800 p-4 lg:p-6 rounded-lg shadow-lg text-white sticky top-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingDown className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">AI EXPENSES INSIGHTS</h3>
                      </div>
                      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                        {aiInsights.filter(
                          (insight) =>
                            insight.category.includes("cost") ||
                            insight.category.includes("expense") ||
                            insight.category.includes("budget")
                        ).length > 0 ? (
                          aiInsights
                            .filter(
                              (insight) =>
                                insight.category.includes("cost") ||
                                insight.category.includes("expense") ||
                                insight.category.includes("budget")
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
                                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                                    <p className="text-xs opacity-90 leading-relaxed">{insight.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-white/80 text-center">Belum ada insight untuk expenses.</p>
                        )}
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

      <style>{`
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
      `}</style>
    </div>
  )
}
