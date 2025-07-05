import axios, { type AxiosError, isAxiosError } from "axios"
import type {
  MemberStats,
  MemberActivity,
  Insight,
  ChartSegment,
  ChartWorkout,
  ChartFunnel,
  ChartNotifResponse,
  ChartABTesting,
} from "@/types/insight"
import type { Trainer, TrainerDashboardData, TrainerActivityDataItem, TrainerScheduleClassItem } from "@/types/trainer"
import type {
  ProductStats,
  TopSalesData,
  CategoryData,
  SalesTrendData,
  ProductInsight,
  Product,
  SegmentationData,
  CrossSellData,
} from "@/types/product"

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

// ========================================
// MEMBER API FUNCTIONS
// ========================================
export const fetchMemberStats = async (): Promise<MemberStats> => {
  const res = await axios.get(`${API_URL}/api/stats/members`)
  return res.data as MemberStats
}

export const fetchMemberActivity = async (): Promise<MemberActivity[]> => {
  const res = await axios.get(`${API_URL}/api/stats/member-activity`)
  return res.data as MemberActivity[]
}

export const fetchInsights = async (): Promise<Insight[]> => {
  const res = await axios.get(`${API_URL}/api/insight/member`)
  return res.data as Insight[]
}

export const fetchSegmentData = async (): Promise<ChartSegment[]> => {
  const res = await axios.get(`${API_URL}/api/stats/member-segment`)
  return res.data as ChartSegment[]
}

export const fetchWorkoutTimeData = async (): Promise<ChartWorkout[]> => {
  const res = await axios.get(`${API_URL}/api/stats/workout-time`)
  return res.data as ChartWorkout[]
}

export const fetchFunnelData = async (): Promise<ChartFunnel[]> => {
  const res = await axios.get(`${API_URL}/api/stats/conversion-funnel`)
  return res.data as ChartFunnel[]
}

export const fetchNotificationResponse = async (): Promise<ChartNotifResponse[]> => {
  const res = await axios.get(`${API_URL}/api/stats/notification-response`)
  return res.data as ChartNotifResponse[]
}

export const fetchABTestData = async (): Promise<ChartABTesting[]> => {
  const res = await axios.get(`${API_URL}/api/stats/ab-test`)
  return res.data as ChartABTesting[]
}

// ========================================
// TRAINER API FUNCTIONS
// ========================================
export const fetchAllTrainers = async (): Promise<Trainer[]> => {
  const res = await axios.get(`${API_URL}/api/trainers`)
  return res.data as Trainer[]
}

export const fetchTrainerDetail = async (trainerId: string): Promise<Trainer> => {
  const res = await axios.get(`${API_URL}/api/trainers/${trainerId}`)
  return res.data as Trainer
}

export const fetchTrainerDashboardData = async (): Promise<TrainerDashboardData> => {
  const res = await axios.get(`${API_URL}/api/trainers/performance`)
  return res.data as TrainerDashboardData
}

export const fetchTrainerActivity = async (trainerId: string): Promise<TrainerActivityDataItem[]> => {
  const res = await axios.get(`${API_URL}/api/trainers/${trainerId}/activity`)
  return res.data as TrainerActivityDataItem[]
}

export const fetchTrainerSchedule = async (trainerId: string): Promise<Record<string, TrainerScheduleClassItem[]>> => {
  const res = await axios.get(`${API_URL}/api/trainers/${trainerId}/schedule`)
  return res.data as Record<string, TrainerScheduleClassItem[]>
}

// ========================================
// PRODUCT API FUNCTIONS - REAL API CALLS
// ========================================
export const fetchProductStats = async (): Promise<ProductStats> => {
  try {
    const res = await axios.get(`${API_URL}/api/product/stats`)
    return res.data as ProductStats
  } catch (error) {
    console.error("Error fetching product stats:", error)
    throw error
  }
}

export const fetchTopSales = async (limit = 5): Promise<TopSalesData[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/product/top-sales?limit=${limit}`)
    return res.data as TopSalesData[]
  } catch (error) {
    console.error("Error fetching top sales:", error)
    throw error
  }
}

export const fetchCategoryDistribution = async (): Promise<CategoryData[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/product/category-distribution`)
    return res.data as CategoryData[]
  } catch (error) {
    console.error("Error fetching category distribution:", error)
    throw error
  }
}

export const fetchSalesTrend = async (days = 7): Promise<SalesTrendData[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/product/trend?days=${days}`)
    return res.data as SalesTrendData[]
  } catch (error) {
    console.error("Error fetching sales trend:", error)
    throw error
  }
}

export const fetchProductInsights = async (): Promise<ProductInsight[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/product/insights`)
    return res.data as ProductInsight[]
  } catch (error) {
    console.error("Error fetching product insights:", error)
    throw error
  }
}

export const fetchProducts = async (filters: {
  category?: string
  lowStock?: boolean
  sortBy?: string
}): Promise<Product[]> => {
  try {
    const params = new URLSearchParams()
    if (filters.category) params.append("category", filters.category)
    if (filters.lowStock !== undefined) params.append("lowStock", filters.lowStock.toString())
    if (filters.sortBy) params.append("sortBy", filters.sortBy)

    const res = await axios.get(`${API_URL}/api/product/?${params.toString()}`)
    return res.data as Product[]
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

export const fetchSegmentationData = async (filters: {
  goal?: string
  ageRange?: string
}): Promise<SegmentationData[]> => {
  try {
    const params = new URLSearchParams()
    if (filters.goal) params.append("goal", filters.goal)
    if (filters.ageRange) params.append("age_range", filters.ageRange)

    const res = await axios.get(`${API_URL}/api/product/segmentation?${params.toString()}`)
    return res.data as SegmentationData[]
  } catch (error) {
    console.error("Error fetching segmentation data:", error)
    throw error
  }
}

export const fetchCrossSellData = async (): Promise<CrossSellData[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/product/cross-sell`)
    return res.data as CrossSellData[]
  } catch (error) {
    console.error("Error fetching cross-sell data:", error)
    throw error
  }
}

// ✅ NEW: Separate endpoint for segmentation insights
export const fetchSegmentationInsights = async (filters: {
  goal?: string
  ageRange?: string
}): Promise<ProductInsight[]> => {
  try {
    const params = new URLSearchParams()
    if (filters.goal) params.append("goal", filters.goal)
    if (filters.ageRange) params.append("age_range", filters.ageRange)

    const res = await axios.get(`${API_URL}/api/product/segmentation-insights?${params.toString()}`)
    return res.data as ProductInsight[]
  } catch (error) {
    console.error("Error fetching segmentation insights:", error)
    throw error
  }
}

// ========================================
// NEW: PRICE SIMULATION API FUNCTIONS
// ========================================
export const fetchSimulationProducts = async (): Promise<any[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/product/simulation-products`)
    return res.data
  } catch (error) {
    console.error("Error fetching simulation products:", error)
    throw error
  }
}

export const simulatePriceChange = async (request: {
  productId: number
  priceChangePercent: number
  bundlingProductId?: number
  bundlingDiscount?: number
}): Promise<any> => {
  try {
    const res = await axios.post(`${API_URL}/api/product/price-simulation`, request)
    return res.data
  } catch (error) {
    console.error("Error simulating price change:", error)
    throw error
  }
}

export const fetchPriceImpactChart = async (productId: number): Promise<any[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/product/price-impact-chart/${productId}`)
    return res.data
  } catch (error) {
    console.error("Error fetching price impact chart:", error)
    throw error
  }
}

// ========================================
// ADDITIONAL PRODUCT API FUNCTIONS
// ========================================
export const fetchLowStockProducts = async (threshold = 10): Promise<Product[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/product/low-stock?threshold=${threshold}`)
    return res.data as Product[]
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    throw error
  }
}

export const fetchProductCategories = async (): Promise<CategoryData[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/product/categories`)
    return res.data as CategoryData[]
  } catch (error) {
    console.error("Error fetching product categories:", error)
    throw error
  }
}

// ========================================
// API HEALTH CHECK
// ========================================
export const checkProductApiHealth = async (): Promise<{ status: string; service: string; version: string }> => {
  try {
    const res = await axios.get<{ status: string; service: string; version: string }>(`${API_URL}/api/product/health`)
    return res.data
  } catch (error) {
    console.error("Product API health check failed:", error)
    throw error
  }
}

// ========================================
// ERROR HANDLING UTILITIES
// ========================================
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

// ========================================
// BATCH API CALLS FOR DASHBOARD
// ========================================
export const fetchProductDashboardData = async () => {
  try {
    const [stats, topSales, categoryData, salesTrend, insights] = await Promise.all([
      fetchProductStats(),
      fetchTopSales(5),
      fetchCategoryDistribution(),
      fetchSalesTrend(7),
      fetchProductInsights(),
    ])

    return {
      stats,
      topSales,
      categoryData,
      salesTrend,
      insights,
    }
  } catch (error) {
    handleApiError(error, "Product Dashboard Data")
    throw error
  }
}

export const fetchProductListData = async (filters: {
  category?: string
  lowStock?: boolean
  sortBy?: string
}) => {
  try {
    const products = await fetchProducts(filters)
    return { products }
  } catch (error) {
    handleApiError(error, "Product List Data")
    throw error
  }
}

// ✅ UPDATED: Use segmentation-specific insights
export const fetchSegmentationDashboardData = async (filters: {
  goal?: string
  ageRange?: string
}) => {
  try {
    const [segmentationData, crossSellData, insights] = await Promise.all([
      fetchSegmentationData(filters),
      fetchCrossSellData(),
      fetchSegmentationInsights(filters), // ✅ Now uses segmentation-specific insights
    ])

    return {
      segmentationData,
      crossSellData,
      insights,
    }
  } catch (error) {
    handleApiError(error, "Segmentation Dashboard Data")
    throw error
  }
}
