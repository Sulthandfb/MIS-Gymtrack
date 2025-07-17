export interface Trainer {
  trainer_id: number
  name: string
  email?: string
  phone?: string
  birth_date?: string // date akan diterima sebagai string
  join_date?: string // date akan diterima sebagai string
  specialization: string
  certification?: string
  hourly_rate: number
  rating: number
  status?: string
  profile_image?: string
  bio?: string
}

export interface TrainerPerformanceData {
  id: number
  name: string
  specialization: string
  classes: number
  feedback: number
  retention: number
  activeMembers: number
  status: string
  experience: string
}

export interface TrainerStats {
  total_classes_overall: number // Mengganti weekly_classes
  total_trainers_overall: number // Mengganti active_trainers
  high_engagement_classes: number
  avg_satisfaction: number
}

export interface TrainerClassParticipantsData {
  trainer: string
  strength: number
  yoga: number
  cardio: number
  pilates: number
}

export interface TrainerSatisfactionTrendData {
  week: string
  [key: string]: string | number // PERBAIKAN: Sekarang mengizinkan string (untuk 'week') atau number
}

export interface TrainerClassTypeData {
  name: string
  value: number
  color: string
}

export interface TrainerCourseComparisonData {
  type: string
  offline: number
  online: number
}

export interface TrainerInsightItem {
  icon_name?: string
  title: string
  message: string
  recommendation?: string // Solusi bisnis
  type: string // e.g., "trend", "issue", "strength", "opportunity"
  impact: string // e.g., "positive", "negative", "neutral"
  confidence: number // Confidence score dari AI
  color?: string
}

export interface TrainerAlertItem {
  icon_name?: string
  title: string
  message: string
  action?: string
  priority: string
}

export interface TrainerDashboardData {
  stats: TrainerStats
  classParticipantsData: TrainerClassParticipantsData[]
  satisfactionTrendData: TrainerSatisfactionTrendData[]
  classTypeData: TrainerClassTypeData[]
  courseComparisonData: TrainerCourseComparisonData[]
  trainerPerformanceData: TrainerPerformanceData[]
  insights: TrainerInsightItem[]
  alerts: TrainerAlertItem[]
}

// --- Interface Baru untuk Trainer Detail Page ---
export interface TrainerActivityDataItem {
  date: string // Format YYYY-MM-DD atau sesuai yang dikirim backend
  kehadiran: number
  kepuasan: number
  engagement: number
}

export interface TrainerScheduleClassItem {
  id: number // schedule_id
  name: string // class name
  time: string // "HH:MM - HH:MM"
  duration: string // "XX min"
  location: string
  participants: string // "X/Y"
  available: number
  type: string // Class type, e.g., "Strength"
  day_of_week: string // e.g., "Senin", "Selasa"
}

// Skema untuk endpoint AI Insights terpisah
export interface AIInsightsAndAlertsResponse {
  insights: TrainerInsightItem[]
  alerts: TrainerAlertItem[]
}