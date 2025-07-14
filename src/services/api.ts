// src/services/api.ts

import axios from "axios"
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
import {
  type FinancialSummary,
  type IncomeVsExpenseData,
  type BreakdownData,
  type Transaction,
  type AIInsight as FinanceAIInsight, // Rename to avoid conflict with Feedback AIInsight
  type IncomeAnalysis,
  type ExpenseAnalysis,
  type TransactionFilters,
  type FilteredTransactionsResponse,
  handleApiError,
  API_URL,
} from "@/types/finance" 

// NEW: Import Inventory Types
import type {
  EquipmentCategory,
  Supplier,
  Equipment,
  EquipmentCreate,
  EquipmentUpdate,
  BackupEquipment,
  BackupEquipmentCreate,
  BackupEquipmentUpdate,
  EquipmentMaintenance,
  EquipmentMaintenanceCreate,
  EquipmentMaintenanceUpdate,
  EquipmentStatusLog,
  EquipmentStatusLogCreate,
  EquipmentUsageLog,
  EquipmentUsageLogCreate,
  EquipmentUsageLogUpdate,
  AIInventoryRecommendation,
  AIInventoryRecommendationCreate,
  AIInventoryRecommendationUpdate,
  InventorySummary,
  EquipmentTableItem,
  BrokenEquipmentTrend,
  MostUsedEquipment,
  RecentStatusLog,
  InventoryTrends,
  InventoryFilters,
  InventoryDashboardData 
} from "@/types/inventory"

// NEW: Import Feedback Types
import type {
  Feedback,
  FeedbackCreate,
  FeedbackUpdate,
  FeedbackTopic,
  FeedbackTopicCreate,
  FeedbackTopicUpdate,
  SentimentTrend,
  SentimentTrendCreate,
  SentimentTrendUpdate,
  FeedbackDashboardSummary,
  SentimentDistribution,
  TopicAnalysisItem,
  DailySentimentTrend,
  AIInsight, // This is the AIInsight for Feedback
  FeedbackListItem,
  FeedbackDashboardData as FeedbackDashboardCombinedData, // Rename to avoid conflict
  FeedbackFilters
} from "@/types/feedback"


// ========================================
// MEMBER API FUNCTIONS (unchanged)
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
// TRAINER API FUNCTIONS (unchanged)
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
// PRODUCT API FUNCTIONS (unchanged)
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

// ✅ UPDATED: Use segmentation-specific insights
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
// NEW: PRICE SIMULATION API FUNCTIONS (unchanged)
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
// ADDITIONAL PRODUCT API FUNCTIONS (unchanged)
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
// FINANCE API FUNCTIONS (unchanged)
// ========================================
export const fetchFinancialSummary = async (): Promise<FinancialSummary> => {
  try {
    const res = await axios.get(`${API_URL}/api/finance/summary`)
    return res.data as FinancialSummary
  } catch (error) {
    console.error("Error fetching financial summary:", error)
    throw error
  }
}

export const fetchIncomeVsExpenses = async (): Promise<IncomeVsExpenseData[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/finance/income-vs-expenses`)
    return res.data as IncomeVsExpenseData[]
  } catch (error) {
    console.error("Error fetching income vs expenses:", error)
    throw error
  }
}

export const fetchIncomeBreakdown = async (): Promise<BreakdownData[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/finance/income-breakdown`)
    return res.data as BreakdownData[]
  } catch (error) {
    console.error("Error fetching income breakdown:", error)
    throw error
  }
}

export const fetchExpenseBreakdown = async (): Promise<BreakdownData[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/finance/expense-breakdown`)
    return res.data as BreakdownData[]
  } catch (error) {
    console.error("Error fetching expense breakdown:", error)
    throw error
  }
}

export const fetchRecentTransactions = async (limit = 10): Promise<Transaction[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/finance/recent-transactions?limit=${limit}`)
    return res.data as Transaction[]
  } catch (error) {
    console.error("Error fetching recent transactions:", error)
    throw error
  }
}

// ✅ NEW: Filtered transactions with pagination (unchanged)
export const fetchFilteredTransactions = async (filters: TransactionFilters): Promise<FilteredTransactionsResponse> => {
  try {
    const params = new URLSearchParams()
    if (filters.type) params.append("type", filters.type)
    if (filters.category) params.append("category", filters.category)
    if (filters.dateFrom) params.append("date_from", filters.dateFrom)
    if (filters.dateTo) params.append("date_to", filters.dateTo)
    if (filters.limit) params.append("limit", filters.limit.toString())
    if (filters.offset) params.append("offset", filters.offset.toString())

    const res = await axios.get(`${API_URL}/api/finance/transactions?${params.toString()}`)
    return res.data as FilteredTransactionsResponse
  } catch (error) {
    console.error("Error fetching filtered transactions:", error)
    throw error
  }
}

export const fetchFinanceAIInsights = async (): Promise<FinanceAIInsight[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/finance/ai-insights`)
    return res.data as FinanceAIInsight[]
  } catch (error) {
    console.error("Error fetching finance AI insights:", error)
    throw error
  }
}

export const fetchIncomeAnalysis = async (): Promise<IncomeAnalysis> => {
  try {
    const res = await axios.get(`${API_URL}/api/finance/income-analysis`)
    return res.data as IncomeAnalysis
  } catch (error) {
    console.error("Error fetching income analysis:", error)
    throw error
  }
}

export const fetchExpenseAnalysis = async (): Promise<ExpenseAnalysis> => {
  try {
    const res = await axios.get(`${API_URL}/api/finance/expense-analysis`)
    return res.data as ExpenseAnalysis
  } catch (error) {
    console.error("Error fetching expense analysis:", error)
    throw error
  }
}

// Batch API call for finance dashboard (unchanged)
export const fetchFinanceDashboardData = async () => {
  try {
    const [summary, incomeVsExpenses, incomeBreakdown, expenseBreakdown, recentTransactions, aiInsights] =
      await Promise.all([
        fetchFinancialSummary(),
        fetchIncomeVsExpenses(),
        fetchIncomeBreakdown(),
        fetchExpenseBreakdown(),
        fetchRecentTransactions(10),
        fetchFinanceAIInsights(),
      ])
    return {
      summary,
      incomeVsExpenses,
      incomeBreakdown,
      expenseBreakdown,
      recentTransactions,
      aiInsights,
    }
  } catch (error) {
    handleApiError(error, "Finance Dashboard Data")
    throw error
  }
}

// ========================================
// INVENTORY API FUNCTIONS (unchanged)
// ========================================

export const fetchInventorySummary = async (): Promise<InventorySummary> => {
  try {
    const res = await axios.get(`${API_URL}/api/inventory/summary`);
    return res.data as InventorySummary;
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    throw error;
  }
};

export const fetchDashboardEquipmentList = async (filters?: InventoryFilters): Promise<EquipmentTableItem[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category_name) params.append("category_name", filters.category_name);
    if (filters?.search_query) params.append("search_query", filters.search_query);
    if (filters?.skip) params.append("skip", filters.skip.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const res = await axios.get(`${API_URL}/api/inventory/dashboard-equipment?${params.toString()}`);
    return res.data as EquipmentTableItem[];
  } catch (error) {
    console.error("Error fetching dashboard equipment list:", error);
    throw error;
  }
};

export const fetchInventoryTrends = async (numWeeks: number = 12): Promise<InventoryTrends> => {
  try {
    const res = await axios.get(`${API_URL}/api/inventory/trends?num_weeks=${numWeeks}`);
    return res.data as InventoryTrends;
  } catch (error) {
    console.error("Error fetching inventory trends:", error);
    throw error;
  }
};

export const fetchAIRecommendations = async (managerDecision?: string): Promise<AIInventoryRecommendation[]> => {
  try {
    const params = new URLSearchParams();
    if (managerDecision) params.append("manager_decision", managerDecision);

    const res = await axios.get(`${API_URL}/api/inventory/ai-recommendations?${params.toString()}`);
    return res.data as AIInventoryRecommendation[];
  } catch (error) {
    console.error("Error fetching AI recommendations:", error);
    throw error;
  }
};

export const updateAIRecommendationDecision = async (recommendationId: number, updateData: AIInventoryRecommendationUpdate): Promise<AIInventoryRecommendation> => {
  try {
    const res = await axios.put(`${API_URL}/api/inventory/ai-recommendations/${recommendationId}`, updateData);
    return res.data as AIInventoryRecommendation;
  } catch (error) {
    console.error(`Error updating AI recommendation ${recommendationId}:`, error);
    throw error;
  }
};

export const takeEquipmentFromBackup = async (equipmentId: number, quantityToTake: number = 1, changedBy: string = "Manager"): Promise<Equipment> => {
  try {
    const res = await axios.post(`${API_URL}/api/inventory/equipment/${equipmentId}/take-from-backup`, null, {
      params: { quantity_to_take: quantityToTake, changed_by: changedBy }
    });
    return res.data as Equipment;
  } catch (error) {
    console.error(`Error taking equipment ${equipmentId} from backup:`, error);
    throw error;
  }
};

export const updateEquipmentStatus = async (equipmentId: number, newStatus: string, changedBy: string = "Manager", changeReason?: string): Promise<Equipment> => {
  try {
    const res = await axios.put(`${API_URL}/api/inventory/equipment/${equipmentId}/status`, null, {
      params: { new_status: newStatus, changed_by: changedBy, change_reason: changeReason }
    });
    return res.data as Equipment;
  } catch (error) {
    console.error(`Error updating equipment ${equipmentId} status to ${newStatus}:`, error);
    throw error;
  }
};

export const fetchEquipmentCategories = async (): Promise<EquipmentCategory[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/inventory/categories`);
    return res.data as EquipmentCategory[];
  } catch (error) {
    console.error("Error fetching equipment categories:", error);
    throw error;
  }
};

export const fetchEquipmentList = async (filters?: InventoryFilters): Promise<Equipment[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category_name) params.append("category_name", filters.category_name);
    if (filters?.search_query) params.append("search_query", filters.search_query);
    if (filters?.skip) params.append("skip", filters.skip.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const res = await axios.get(`${API_URL}/api/inventory/equipment?${params.toString()}`);
    return res.data as Equipment[];
  } catch (error) {
    console.error("Error fetching equipment list:", error);
    throw error;
  }
};

export const createEquipment = async (equipmentData: EquipmentCreate): Promise<Equipment> => {
  try {
    const res = await axios.post(`${API_URL}/api/inventory/equipment`, equipmentData);
    return res.data as Equipment;
  } catch (error) {
    console.error("Error creating equipment:", error);
    throw error;
  }
};

export const updateEquipment = async (equipmentId: number, updateData: EquipmentUpdate): Promise<Equipment> => {
  try {
    const res = await axios.put(`${API_URL}/api/inventory/equipment/${equipmentId}`, updateData);
    return res.data as Equipment;
  } catch (error) {
    console.error(`Error updating equipment ${equipmentId}:`, error);
    throw error;
  }
};

export const deleteEquipment = async (equipmentId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/inventory/equipment/${equipmentId}`);
  } catch (error) {
    console.error(`Error deleting equipment ${equipmentId}:`, error);
    throw error;
  }
};


// Combined API call for inventory dashboard (unchanged)
export const fetchInventoryDashboardData = async (filters?: InventoryFilters): Promise<InventoryDashboardData> => {
  try {
    const [summary, equipmentList, trends, categories] = await Promise.all([
      fetchInventorySummary(),
      fetchDashboardEquipmentList(filters),
      fetchInventoryTrends(),
      fetchEquipmentCategories()
    ]);
    return {
      summary,
      equipmentList,
      trends,
      equipmentCategories: categories
    };
  } catch (error) {
    handleApiError(error, "Inventory Dashboard Data");
    throw error;
  }
};


// ========================================
// BATCH API CALLS FOR DASHBOARD (EXISTING)
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

// ✅ UPDATED: Use segmentation-specific insights (unchanged)
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

// ========================================
// NEW: FEEDBACK API FUNCTIONS (diperbarui)
// ========================================

export const fetchSentimentSummary = async (): Promise<FeedbackDashboardSummary> => {
  try {
    const res = await axios.get(`${API_URL}/api/feedback/summary`);
    return res.data;
  } catch (error) {
    handleApiError(error, "Sentiment Summary");
    throw error;
  }
};

export const fetchSentimentDistribution = async (): Promise<SentimentDistribution[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/feedback/sentiment-distribution`);
    return res.data;
  } catch (error) {
    handleApiError(error, "Sentiment Distribution");
    throw error;
  }
};

export const fetchTopicAnalysis = async (): Promise<TopicAnalysisItem[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/feedback/topic-analysis`);
    return res.data;
  } catch (error) {
    handleApiError(error, "Topic Analysis");
    throw error;
  }
};

export const fetchDailySentimentTrends = async (start_date?: string, end_date?: string): Promise<DailySentimentTrend[]> => {
  try {
    const params = new URLSearchParams();
    if (start_date) params.append("start_date", start_date);
    if (end_date) params.append("end_date", end_date);
    const res = await axios.get(`${API_URL}/api/feedback/sentiment-trends?${params.toString()}`);
    return res.data;
  } catch (error) {
    handleApiError(error, "Daily Sentiment Trends");
    throw error;
  }
};

// ✅ FIXED: fetchRecentFeedback sekarang menerima objek FeedbackFilters
export const fetchRecentFeedback = async (filters?: FeedbackFilters): Promise<FeedbackListItem[]> => {
    try {
        const params = new URLSearchParams();
        if (filters?.limit) params.append("limit", filters.limit.toString());
        if (filters?.member_id) params.append("member_id", filters.member_id.toString());
        if (filters?.feedback_type) params.append("feedback_type", filters.feedback_type);
        if (filters?.sentiment) params.append("sentiment", filters.sentiment);
        if (filters?.start_date) params.append("start_date", filters.start_date);
        if (filters?.end_date) params.append("end_date", filters.end_date);
        if (filters?.search_query) params.append("search_query", filters.search_query);

        const res = await axios.get(`${API_URL}/api/feedback/recent-feedback?${params.toString()}`);
        return res.data;
    } catch (error) {
        handleApiError(error, "Recent Feedback");
        throw error;
    }
};


export const fetchAllFeedbackTypes = async (): Promise<string[]> => {
    try {
        const res = await axios.get(`${API_URL}/api/feedback/feedback-types`);
        return res.data;
    } catch (error) {
        handleApiError(error, "Feedback Types");
        throw error;
    }
};

export const fetchAllMemberNames = async (): Promise<string[]> => {
    try {
        const res = await axios.get(`${API_URL}/api/feedback/member-names`);
        return res.data;
    } catch (error) {
        handleApiError(error, "Member Names");
        throw error;
    }
};

export const fetchOverallAIInsights = async (): Promise<AIInsight[]> => {
    try {
        const res = await axios.get(`${API_URL}/api/feedback/ai-insights/overall`);
        return res.data;
    } catch (error) {
        handleApiError(error, "Overall AI Insights");
        throw error;
    }
};

export const triggerAIBatchProcessing = async (limit: number = 10): Promise<{ processed_count: number }> => {
    try {
        const res = await axios.post(`${API_URL}/api/feedback/process-ai-batch?limit=${limit}`);
        return res.data;
    } catch (error) {
        handleApiError(error, "AI Batch Processing");
        throw error;
    }
};

// ✅ FIXED: fetchFeedbackDashboardData sekarang mengirim filters ke fetchRecentFeedback
export const fetchFeedbackDashboardData = async (filters?: FeedbackFilters): Promise<FeedbackDashboardCombinedData> => {
    try {
        const [summary, distribution, topics, trends, recent, aiInsights, types, members] = await Promise.all([
            fetchSentimentSummary(),
            fetchSentimentDistribution(),
            fetchTopicAnalysis(),
            fetchDailySentimentTrends(filters?.start_date, filters?.end_date),
            fetchRecentFeedback(filters), // ✅ Kirim filters ke fetchRecentFeedback
            fetchOverallAIInsights(),
            fetchAllFeedbackTypes(),
            fetchAllMemberNames()
        ]);
        return {
            summary,
            sentimentDistribution: distribution,
            topicAnalysis: topics,
            sentimentTrendDaily: trends,
            recentFeedback: recent,
            allAIInsights: aiInsights,
            feedbackTypes: types,
            memberNames: members
        };
    } catch (error) {
        handleApiError(error, "Feedback Dashboard Data");
        throw error;
    }
};
