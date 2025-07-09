import { type AxiosError, isAxiosError } from "axios"

// API Configuration
export const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

// Core Finance Types
export interface FinancialSummary {
  profit_margin: number
  total_income: number
  total_expenses: number
  profit_margin_trend: number
  income_trend: number
  expense_trend: number
}

export interface IncomeVsExpenseData {
  month: string
  income: number
  expenses: number
}

export interface BreakdownData {
  name: string
  value: number
  amount?: number
  color: string
}

export interface Transaction {
  id: string
  date: string
  type: "income" | "expense"
  category: string
  amount: number
  payment_method: string
  description: string
  status: string
}

export interface AIInsight {
  id: string
  type: "recommendation" | "prediction" | "opportunity" | "warning"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  category: string
}

// Income Analysis Types
export interface IncomeSource {
  name: string
  amount: number
}

export interface IncomeMonthlyData {
  month: string
  membership: number
  personal_training: number
  class_fee: number
  product_sale: number
  total: number
}

export interface IncomeAnalysis {
  current_month_total: number
  growth_percentage: number
  biggest_source: IncomeSource
  monthly_chart_data: IncomeMonthlyData[]
}

// Expense Analysis Types
export interface ExpenseCategory {
  name: string
  amount: number
}

export interface FixedVsVariable {
  fixed_percentage: number
  variable_percentage: number
  fixed_amount: number
  variable_amount: number
}

export interface ExpenseMonthlyData {
  month: string
  fixed: number
  variable: number
  total: number
  rent: number
  utilities: number
  staff_salary: number
  equipment: number
  marketing: number
  maintenance: number
}

export interface ExpenseAnalysis {
  current_month_total: number
  biggest_category: ExpenseCategory
  fixed_vs_variable: FixedVsVariable
  monthly_chart_data: ExpenseMonthlyData[]
}

// Error Handling
export const handleApiError = (error: unknown, context: string) => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError
    console.error(`${context} - Axios Error:`, {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    })
    if (axiosError.response?.status === 404) {
      throw new Error(`${context}: Data not found`)
    } else if (axiosError.response?.status === 500) {
      throw new Error(`${context}: Server error`)
    } else if (axiosError.response?.status === 422) {
      throw new Error(`${context}: Invalid request parameters`)
    }
  }
  if (error instanceof Error) {
    throw new Error(`${context}: ${error.message}`)
  }
  throw new Error(`${context}: Unknown error`)
}
