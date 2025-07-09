"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import type {
  FinanceOverviewStats,
  RevenueBreakdown,
  ExpenseBreakdown,
  MonthlyTrendData,
  BudgetVarianceData,
  FinancialTargetData,
} from "@/types/finance"

interface FinancePdfExportProps {
  period: string
  overview: FinanceOverviewStats
  revenueData: RevenueBreakdown
  expenseData: ExpenseBreakdown
  monthlyTrend: MonthlyTrendData[]
  budgetVariance: BudgetVarianceData[]
  financialTargets: FinancialTargetData[]
}

export function FinancePdfExport({
  period,
  overview,
  revenueData,
  expenseData,
  monthlyTrend,
  budgetVariance,
  financialTargets,
}: FinancePdfExportProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Get period label
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "1month":
        return "1 Bulan Terakhir"
      case "3months":
        return "3 Bulan Terakhir"
      case "6months":
        return "6 Bulan Terakhir"
      case "12months":
        return "12 Bulan Terakhir"
      case "ytd":
        return "Tahun Berjalan"
      default:
        return period
    }
  }

  // Format date
  const formatDate = () => {
    return new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Handle export
  const handleExport = async () => {
    try {
      setLoading(true)

      // In a real implementation, this would call an API endpoint to generate the PDF
      // For now, we'll simulate a delay and show a success message
      await new Promise((resolve) => setTimeout(resolve, 2000))

        toast({
            title: "Laporan berhasil diunduh",
            description: `Laporan keuangan untuk periode ${getPeriodLabel(period)} telah berhasil diunduh.`,
            open: true, // tambahkan ini
        })
    } catch (error) {
      console.error("Error exporting PDF:", error)
        toast({
            title: "Gagal mengunduh laporan",
            description: "Terjadi kesalahan saat mengunduh laporan. Silakan coba lagi.",
            variant: "destructive",
            open: true, // tambahkan ini
        })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="border-gray-300 hover:bg-gray-50 bg-white"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Mengunduh...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </>
      )}
    </Button>
  )
}
