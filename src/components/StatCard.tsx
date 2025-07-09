// components/StatCard.tsx
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "emerald" | "orange" | "blue" | "purple"
  description?: string // <--- TAMBAHKAN BARIS INI
}

export function StatCard({ title, value, icon: Icon, trend, color = "emerald", description }: StatCardProps) {
  // Pastikan 'description' juga ada di destructuring props di sini
  const colorClasses = {
    emerald: "bg-emerald-500 text-white",
    orange: "bg-orange-500 text-white",
    blue: "bg-blue-500 text-white",
    purple: "bg-purple-500 text-white",
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className={`text-sm mt-1 ${trend.isPositive ? "text-emerald-600" : "text-red-600"}`}>
                {trend.isPositive ? "+" : ""}
                {trend.value}% dari bulan lalu
              </p>
            )}
            {/* Tampilkan deskripsi jika ada */}
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}