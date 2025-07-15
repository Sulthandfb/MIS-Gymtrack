"use client"

import { AlertTriangle, Lightbulb, TrendingUp, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
export type { AIRecommendation }


interface AIRecommendation {
  priority_actions: Array<{
    title: string
    description: string
    urgency: "high" | "medium" | "low"
  }>
  opportunities: Array<{
    title: string
    description: string
    potential_impact: "high" | "medium" | "low"
  }>
  metrics_to_monitor: Array<{
    metric: string
    target: string
    current_value?: string
  }>
}

interface AIRecommendationsProps {
  recommendations: AIRecommendation
}

export function AIRecommendations({ recommendations }: AIRecommendationsProps) {
    if (!recommendations || !recommendations.priority_actions) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Loading AI recommendations...</p>
        </div>
        </div>
    )
    }

  const recommendation = recommendations

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-purple-100 text-purple-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Rekomendasi AI</h3>
            <p className="text-blue-700 text-sm">
              Berdasarkan analisis sentimen dan tren feedback, berikut adalah rekomendasi untuk meningkatkan kepuasan
              member dan mengatasi area yang memerlukan perhatian.
            </p>
          </div>
        </div>
      </div>

      {/* Priority Actions */}
      {recommendation.priority_actions && recommendation.priority_actions.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Tindakan Prioritas Tinggi</h4>
          </div>
          <div className="space-y-4">
            {recommendation.priority_actions.map((action, index) => (
              <div key={index} className="border-l-4 border-orange-200 pl-4">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{action.title}</h5>
                  <Badge className={getUrgencyColor(action.urgency)}>
                    {action.urgency === "high" ? "Tinggi" : action.urgency === "medium" ? "Sedang" : "Rendah"}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunities */}
      {recommendation.opportunities && recommendation.opportunities.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Peluang Peningkatan</h4>
          </div>
          <div className="space-y-4">
            {recommendation.opportunities.map((opportunity, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{opportunity.title}</h5>
                  <Badge className={getImpactColor(opportunity.potential_impact)}>
                    {opportunity.potential_impact === "high"
                      ? "Tinggi"
                      : opportunity.potential_impact === "medium"
                        ? "Sedang"
                        : "Rendah"}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">{opportunity.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics to Monitor */}
      {recommendation.metrics_to_monitor && recommendation.metrics_to_monitor.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Metrik untuk Dipantau</h4>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Pantau metrik berikut untuk mengukur efektivitas tindakan yang direkomendasikan:
          </p>
          <div className="space-y-3">
            {recommendation.metrics_to_monitor.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{metric.metric}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{metric.target}</div>
                  {metric.current_value && (
                    <div className="text-xs text-gray-500">Saat ini: {metric.current_value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
