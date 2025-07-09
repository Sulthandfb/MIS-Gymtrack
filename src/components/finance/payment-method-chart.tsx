"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { PaymentMethodData } from "@/types/finance"

interface PaymentMethodChartProps {
  data: PaymentMethodData[]
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  // Colors for payment methods
  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "cash":
        return "#10b981"
      case "card":
        return "#3b82f6"
      case "transfer":
        return "#8b5cf6"
      default:
        return "#f59e0b"
    }
  }

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
          <p className="font-medium text-gray-900">{data.method}</p>
          <p className="text-gray-700">{formatCurrency(data.amount)}</p>
          <p className="text-gray-500 text-sm">{data.percentage.toFixed(1)}% dari total</p>
          <p className="text-gray-500 text-sm">{data.transaction_count} transaksi</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis
          type="number"
          stroke="#666"
          fontSize={12}
          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          type="category"
          dataKey="method"
          stroke="#666"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getMethodColor(entry.method)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
