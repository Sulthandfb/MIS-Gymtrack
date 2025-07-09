"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { CashFlowData } from "@/types/finance"

interface CashFlowChartProps {
  data: CashFlowData[]
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-medium text-gray-900 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-gray-700">{entry.name}:</span>
              <span className="font-medium" style={{ color: entry.color }}>
                {formatCurrency(entry.value)}
              </span>
            </p>
          ))}
          {payload.length > 2 && (
            <p className="flex items-center gap-2 text-sm mt-1 pt-1 border-t border-gray-100">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span className="text-gray-700">Kumulatif:</span>
              <span className="font-medium text-purple-500">{formatCurrency(payload[2].payload.cumulative)}</span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          stroke="#666"
          fontSize={12}
          tickFormatter={formatDate}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          stroke="#666"
          fontSize={12}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cash_in"
          stackId="1"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.3}
          name="Cash In"
        />
        <Area
          type="monotone"
          dataKey="cash_out"
          stackId="2"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.3}
          name="Cash Out"
        />
        <Area type="monotone" dataKey="net_flow" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Net Flow" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
