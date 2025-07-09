"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { RevenueBreakdown } from "@/types/finance"

interface RevenueChartProps {
  data: RevenueBreakdown
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Transform data for chart
  const chartData = [
    { name: "Membership", value: data.membership, color: "#3b82f6" },
    { name: "Personal Training", value: data.personal_training, color: "#10b981" },
    { name: "Class Fees", value: data.class_fees, color: "#f59e0b" },
    { name: "Product Sales", value: data.product_sales, color: "#8b5cf6" },
  ].filter((item) => item.value > 0)

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-gray-700">{formatCurrency(data.value)}</p>
          <p className="text-gray-500 text-sm">{((data.value / getTotalValue()) * 100).toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  // Get total value
  const getTotalValue = () => {
    return chartData.reduce((sum, item) => sum + item.value, 0)
  }

  // Custom legend
  const renderLegend = (props: any) => {
    const { payload } = props
    const total = getTotalValue()

    return (
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-700">{entry.value}</span>
            <span className="text-xs text-gray-500">({((entry.payload.value / total) * 100).toFixed(1)}%)</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={chartData} cx="50%" cy="45%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  )
}
