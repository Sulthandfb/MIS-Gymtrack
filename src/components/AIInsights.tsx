// src/components/AIInsights.tsx
import { Bell, Zap, CheckCircle, Target, MessageSquare, TrendingUp, AlertTriangle, Lightbulb as LightbulbIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; 

// Import all possible insight types
import { AIInsight as FeedbackAIInsightType } from "@/types/feedback";
import { Insight as MemberInsightType } from "@/types/insight";

// Define a generic insight interface that can handle all types
interface GenericInsight {
  title: string;
  // Make all other properties optional to handle different insight structures
  insight_type?: string;
  type?: string;
  impact?: string;
  confidence?: number;
  recommendation?: string;
  description?: string;
  text?: string;
  // Add any other properties that might exist in TrainerInsightItem
  [key: string]: any;
}

// Updated props interface to accept any insight-like object
interface AIInsightsProps {
  insights: GenericInsight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  // Helper untuk mendapatkan kelas CSS badge berdasarkan impact (case-insensitive)
  const getImpactClass = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "positive": return "bg-green-100 text-green-800";
      case "negative": return "bg-red-100 text-red-800";
      case "neutral": return "bg-blue-100 text-blue-800"; 
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Helper untuk mendapatkan ikon berdasarkan tipe insight (case-insensitive)
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "trend": return <TrendingUp className="w-4 h-4" />;
      case "issue": return <AlertTriangle className="w-4 h-4" />;
      case "strength": return <CheckCircle className="w-4 h-4" />;
      case "opportunity": return <LightbulbIcon className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />; 
    }
  };

  // Helper function untuk safely access properties dengan fallback values
  const getInsightProperty = (insight: GenericInsight, property: string): string | number => {
    switch (property) {
      case 'type':
        return insight.insight_type || insight.type || "general";
      case 'impact':
        return insight.impact || "neutral";
      case 'confidence':
        return insight.confidence || 0.8; // Default confidence
      case 'recommendation':
        return insight.recommendation || "";
      case 'description':
        return insight.description || insight.text || "";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI INSIGHTS</h3>
                <p className="text-blue-100 text-sm">Smart Analytics & Solutions</p>
              </div>
            </div>
            <Bell className="h-5 w-5 text-blue-200" />
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {insights.slice(0, 4).map((insight, index) => {
              // Menggunakan helper function untuk safely access properties
              const currentInsightType = getInsightProperty(insight, 'type') as string;
              const currentImpact = getInsightProperty(insight, 'impact') as string;
              const currentRecommendation = getInsightProperty(insight, 'recommendation') as string;
              const currentConfidence = getInsightProperty(insight, 'confidence') as number;
              const currentTitle = insight.title;
              const currentDescription = getInsightProperty(insight, 'description') as string;

              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getTypeIcon(currentInsightType)} 
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-white mb-1">{currentTitle}</h4>
                      {currentDescription && (
                        <p className="text-blue-100 text-sm leading-relaxed mt-1 opacity-90">{currentDescription}</p>
                      )}
                    </div>
                  </div>

                  {currentRecommendation && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Target className="w-4 h-4 text-orange-900" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-white mb-1">Solusi</h4>
                        <p className="text-blue-100 text-sm leading-relaxed">{currentRecommendation}</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-blue-200">
                    Impact: <Badge className={cn("px-2 py-1 text-xs", getImpactClass(currentImpact))}>
                              {currentImpact.charAt(0).toUpperCase() + currentImpact.slice(1)} {/* Format ke Title Case */}
                            </Badge>
                    <span className="ml-2">Confidence: {Math.round(currentConfidence * 100)}%</span>
                  </div>
                </div>
              );
            })}

            {insights.length === 0 && (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-blue-300 mx-auto mb-3 opacity-50" />
                <p className="text-blue-200 text-sm">Loading AI insights...</p>
              </div>
            )}
          </div>

          <button className="w-full mt-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all duration-200 border border-white/30">
            Lihat Semua Insights & Solutions →
          </button>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Member Retention Program</p>
                  <p className="text-gray-500 text-xs">Launch targeted retention campaign</p>
                </div>
              </div>
            </button>

            <button className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">AI Notification Setup</p>
                  <p className="text-gray-500 text-xs">Optimize notification timing</p>
                </div>
              </div>
            </button>

            <button className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Goal-Based Programs</p>
                  <p className="text-gray-500 text-xs">Create specialized workout plans</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}