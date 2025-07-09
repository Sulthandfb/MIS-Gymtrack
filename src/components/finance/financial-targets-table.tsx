"use client"

import { CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import type { FinancialTargetData } from "@/types/finance"

interface FinancialTargetsTableProps {
  data: FinancialTargetData[]
}

export function FinancialTargetsTable({ data }: FinancialTargetsTableProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  // Get target type label
  const getTargetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      revenue: "Pendapatan",
      profit: "Profit",
      member_growth: "Pertumbuhan Member",
      retention_rate: "Retensi Member",
      expense_reduction: "Pengurangan Biaya",
      class_attendance: "Kehadiran Kelas",
      new_members: "Member Baru",
    }

    return labels[type] || type
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "achieved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "on_track":
        return <Clock className="w-5 h-5 text-amber-500" />
      case "behind":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "achieved":
        return "Tercapai"
      case "on_track":
        return "On Track"
      case "behind":
        return "Tertinggal"
      default:
        return status
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "achieved":
        return "bg-green-500"
      case "on_track":
        return "bg-amber-500"
      case "behind":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Format value based on target type
  const formatValue = (value: number, type: string) => {
    if (["revenue", "profit", "expense_reduction"].includes(type)) {
      return formatCurrency(value)
    } else if (["member_growth", "retention_rate"].includes(type)) {
      return formatPercentage(value)
    } else {
      return value.toString()
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Target</TableHead>
            <TableHead className="text-right">Target</TableHead>
            <TableHead className="text-right">Aktual</TableHead>
            <TableHead className="w-[140px]">Progress</TableHead>
            <TableHead className="w-[100px] text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{getTargetTypeLabel(item.target_type)}</TableCell>
              <TableCell className="text-right">{formatValue(item.target_value, item.target_type)}</TableCell>
              <TableCell className="text-right">{formatValue(item.actual_value, item.target_type)}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Progress
                    value={Math.min(100, item.achievement_percentage)}
                    className={`h-2 ${
                      item.status === "achieved"
                        ? "[&>div]:bg-green-500"
                        : item.status === "on_track"
                          ? "[&>div]:bg-amber-500"
                          : "[&>div]:bg-red-500"
                    }`}
                  />
                  <div className="text-xs text-gray-500 text-right">{item.achievement_percentage.toFixed(0)}%</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-center gap-1">
                  {getStatusIcon(item.status)}
                  <span className="text-xs text-gray-600">{getStatusText(item.status)}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
