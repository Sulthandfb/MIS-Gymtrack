"use client"

import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import type { BudgetVarianceData } from "@/types/finance"

interface BudgetVarianceTableProps {
  data: BudgetVarianceData[]
}

export function BudgetVarianceTable({ data }: BudgetVarianceTableProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Get category label
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      rent: "Sewa",
      utilities: "Utilitas",
      staff_salary: "Gaji Staff",
      equipment: "Peralatan",
      marketing: "Marketing",
      maintenance: "Pemeliharaan",
      membership: "Membership",
      personal_training: "Personal Training",
      class_fees: "Kelas",
      product_sales: "Penjualan Produk",
      total_revenue: "Total Pendapatan",
      total_expenses: "Total Pengeluaran",
      net_profit: "Profit Bersih",
    }

    return labels[category] || category
  }

  // Get variance status
  const getVarianceStatus = (variance: number, category: string) => {
    // For expense categories, negative variance is good (under budget)
    const isExpenseCategory = [
      "rent",
      "utilities",
      "staff_salary",
      "equipment",
      "marketing",
      "maintenance",
      "total_expenses",
    ].includes(category)

    if (isExpenseCategory) {
      return variance < 0 ? "positive" : variance > 0 ? "negative" : "neutral"
    } else {
      // For revenue categories, positive variance is good (over target)
      return variance > 0 ? "positive" : variance < 0 ? "negative" : "neutral"
    }
  }

  // Get progress percentage
  const getProgressPercentage = (actual: number, allocated: number) => {
    if (allocated <= 0) return 0
    return Math.min(100, (actual / allocated) * 100)
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Kategori</TableHead>
            <TableHead className="text-right">Budget</TableHead>
            <TableHead className="text-right">Aktual</TableHead>
            <TableHead className="text-right">Variance</TableHead>
            <TableHead className="w-[140px]">Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            const status = getVarianceStatus(item.variance, item.category)
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{getCategoryLabel(item.category)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.allocated)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.actual)}</TableCell>
                <TableCell className="text-right">
                  <div
                    className={`flex items-center justify-end gap-1 
                    ${
                      status === "positive"
                        ? "text-green-600"
                        : status === "negative"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {status === "positive" ? (
                      <ArrowUpIcon className="w-4 h-4" />
                    ) : status === "negative" ? (
                      <ArrowDownIcon className="w-4 h-4" />
                    ) : null}
                    <span>{formatCurrency(Math.abs(item.variance))}</span>
                    <span>({Math.abs(item.variance_percentage).toFixed(1)}%)</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Progress
                      value={getProgressPercentage(item.actual, item.allocated)}
                      className={`h-2 ${
                        status === "positive"
                          ? "[&>div]:bg-green-500"
                          : status === "negative"
                            ? "[&>div]:bg-red-500"
                            : "[&>div]:bg-blue-500"
                      }`}
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {getProgressPercentage(item.actual, item.allocated).toFixed(0)}%
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
