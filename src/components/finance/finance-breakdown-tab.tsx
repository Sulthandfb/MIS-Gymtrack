"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Transaction {
  id: number
  date: string
  description: string
  amount: number
  category: string
  payment_method: string
  type: "income" | "expense"
}

interface TransactionStats {
  total_amount: number
  transaction_count: number
  average_amount: number
  top_category: string
  growth_rate: number
}

export function FinanceBreakdownTab() {
  const [period, setPeriod] = useState("30days")
  const [incomeTransactions, setIncomeTransactions] = useState<Transaction[]>([])
  const [expenseTransactions, setExpenseTransactions] = useState<Transaction[]>([])
  const [incomeStats, setIncomeStats] = useState<TransactionStats | null>(null)
  const [expenseStats, setExpenseStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch income data
        const incomeResponse = await fetch(`/api/finance/income-transactions?period=${period}`)
        const incomeData = await incomeResponse.json()
        setIncomeTransactions(incomeData)

        const incomeStatsResponse = await fetch(`/api/finance/income-stats?period=${period}`)
        const incomeStatsData = await incomeStatsResponse.json()
        setIncomeStats(incomeStatsData)

        // Fetch expense data
        const expenseResponse = await fetch(`/api/finance/expense-transactions?period=${period}`)
        const expenseData = await expenseResponse.json()
        setExpenseTransactions(expenseData)

        const expenseStatsResponse = await fetch(`/api/finance/expense-stats?period=${period}`)
        const expenseStatsData = await expenseStatsResponse.json()
        setExpenseStats(expenseStatsData)

      } catch (error) {
        console.error("Error loading breakdown data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [period])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Memuat data breakdown...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Breakdown Transaksi</h1>
          <p className="text-gray-600">Detail pendapatan dan pengeluaran</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Hari Terakhir</SelectItem>
              <SelectItem value="30days">30 Hari Terakhir</SelectItem>
              <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
              <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
              <SelectItem value="12months">12 Bulan Terakhir</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Summary */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-green-700">Total Pendapatan</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-green-600">
                {incomeStats ? formatCurrency(incomeStats.total_amount) : "Rp 0"}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{incomeStats?.transaction_count || 0} transaksi</span>
                <span>Rata-rata: {incomeStats ? formatCurrency(incomeStats.average_amount) : "Rp 0"}</span>
              </div>
              {incomeStats && incomeStats.growth_rate !== 0 && (
                <div className="flex items-center gap-1">
                  {incomeStats.growth_rate > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${incomeStats.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(incomeStats.growth_rate).toFixed(1)}% vs periode sebelumnya
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Summary */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-red-700">Total Pengeluaran</CardTitle>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-red-600">
                {expenseStats ? formatCurrency(expenseStats.total_amount) : "Rp 0"}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{expenseStats?.transaction_count || 0} transaksi</span>
                <span>Rata-rata: {expenseStats ? formatCurrency(expenseStats.average_amount) : "Rp 0"}</span>
              </div>
              {expenseStats && expenseStats.growth_rate !== 0 && (
                <div className="flex items-center gap-1">
                  {expenseStats.growth_rate > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-green-500" />
                  )}
                  <span className={`text-sm font-medium ${expenseStats.growth_rate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.abs(expenseStats.growth_rate).toFixed(1)}% vs periode sebelumnya
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Tables */}
      <Tabs defaultValue="income" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            💰 Pendapatan ({incomeTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="expense" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            💸 Pengeluaran ({expenseTransactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Detail Transaksi Pendapatan</CardTitle>
              <CardDescription>
                Kategori terbanyak: {incomeStats?.top_category || "Tidak ada data"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incomeTransactions.length > 0 ? (
                  incomeTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            {transaction.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{formatDate(transaction.date)}</span>
                          <span>{transaction.payment_method}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada transaksi pendapatan untuk periode ini
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">Detail Transaksi Pengeluaran</CardTitle>
              <CardDescription>
                Kategori terbanyak: {expenseStats?.top_category || "Tidak ada data"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseTransactions.length > 0 ? (
                  expenseTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            {transaction.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{formatDate(transaction.date)}</span>
                          <span>{transaction.payment_method}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-red-600">
                          -{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada transaksi pengeluaran untuk periode ini
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinanceBreakdownTab
