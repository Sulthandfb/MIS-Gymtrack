export interface FinanceOverviewStats {
  total_revenue: number
  total_expenses: number
  net_profit: number
  profit_margin: number
  monthly_growth: number
}

export interface RevenueBreakdown {
  membership: number
  personal_training: number
  class_fees: number
  product_sales: number
}

export interface ExpenseBreakdown {
  rent: number
  utilities: number
  staff_salary: number
  equipment: number
  marketing: number
  maintenance: number
}

export interface MonthlyTrendData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export interface CashFlowData {
  date: string
  cash_in: number
  cash_out: number
  net_flow: number
  cumulative: number
}

export interface BudgetVarianceData {
  category: string
  allocated: number
  actual: number
  variance: number
  variance_percentage: number
}

export interface FinancialTargetData {
  target_type: string
  target_value: number
  actual_value: number
  achievement_percentage: number
  status: string // 'achieved', 'on_track', 'behind'
}

export interface PaymentMethodData {
  method: string
  amount: number
  percentage: number
  transaction_count: number
}

export interface FinanceInsight {
  title: string
  text: string
  recommendation?: string
  impact_level: string // 'high', 'medium', 'low'
  category: string // 'revenue', 'expense', 'profit', 'cash_flow'
}

export interface CashFlowPrediction {
  month: string
  predicted_revenue: number
  predicted_expenses: number
  predicted_profit: number
  confidence_level: number
}

export interface FinancialForecast {
  period: string
  predictions: CashFlowPrediction[]
  key_assumptions: string[]
  risk_factors: string[]
}
