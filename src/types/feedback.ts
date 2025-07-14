// src/types/feedback.ts

export interface FeedbackBase {
  member_id?: number;
  feedback_date: string; // YYYY-MM-DD string for date
  feedback_type: 'Class' | 'Trainer' | 'Facility' | 'General';
  content: string;
  rating: number; // float
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentiment_score?: number; // float
  is_processed_by_ai?: boolean;
  processed_at?: string; // ISO string date-time
  raw_llm_response?: string;
}

export interface FeedbackCreate extends FeedbackBase {}

export interface FeedbackUpdate {
  feedback_date?: string;
  feedback_type?: 'Class' | 'Trainer' | 'Facility' | 'General';
  content?: string;
  rating?: number;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  sentiment_score?: number;
  is_processed_by_ai?: boolean;
  processed_at?: string;
  raw_llm_response?: string;
}

export interface Feedback {
  feedback_id: number;
  created_at: string; // ISO string date-time
  updated_at: string; // ISO string date-time
  
  // Inherit all fields from FeedbackBase
  member_id: number; // Member ID is mandatory in DB, but optional on creation
  feedback_date: string;
  feedback_type: 'Class' | 'Trainer' | 'Facility' | 'General';
  content: string;
  rating: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentiment_score: number;
  is_processed_by_ai: boolean;
  processed_at?: string;
  raw_llm_response?: string;

  // Nested relationship (assuming app/schemas/member.py Member exists)
  member?: { // Simplified member for feedback context
    member_id: number;
    name: string;
    email: string;
    phone: string;
    membership_type: string;
  };
}

// --- Feedback Topic Schemas ---
export interface FeedbackTopicBase {
  feedback_id: number;
  topic: string;
  sentiment_score: number; // float
  confidence: number; // float
}

export interface FeedbackTopicCreate extends FeedbackTopicBase {}

export interface FeedbackTopicUpdate {
  topic?: string;
  sentiment_score?: number;
  confidence?: number;
}

export interface FeedbackTopic {
  topic_id: number;
  created_at: string; // ISO string date-time
  // Inherit all fields from FeedbackTopicBase
  feedback_id: number;
  topic: string;
  sentiment_score: number;
  confidence: number;
}

// --- Sentiment Trend Schemas ---
export interface SentimentTrendBase {
  date: string; // YYYY-MM-DD string
  feedback_type: string;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  total_count: number;
  avg_rating: number; // float
}

export interface SentimentTrendCreate extends SentimentTrendBase {}
export interface SentimentTrendUpdate extends Partial<SentimentTrendBase> {} // For partial updates

export interface SentimentTrend {
  trend_id: number;
  created_at: string; // ISO string date-time
  // Inherit all fields from SentimentTrendBase
  date: string;
  feedback_type: string;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  total_count: number;
  avg_rating: number;
}


// --- Dashboard Specific Schemas ---

// For Sentiment Bar Chart (Distribution)
export interface SentimentDistribution {
  sentiment: string;
  count: number;
  percentage: number;
}

// For Bubble Chart (Topics)
export interface TopicAnalysisItem {
  topic: string;
  frequency: number;
  sentiment_score: number; // avg_sentiment_score for topic
}

// For Sentiment Trend Line Chart
export interface DailySentimentTrend {
  date: string; // YYYY-MM-DD string
  feedback_type: string; // The type this trend aggregates
  positive: number; // Renamed from positive_count in backend for chart clarity
  neutral: number;   // Renamed from neutral_count
  negative: number;  // Renamed from negative_count
  total: number;     // Renamed from total_count
  avg_rating: number;
}

// For AI Insights (from LLM)
export interface AIInsight {
  insight_type: 'trend' | 'issue' | 'strength' | 'opportunity';
  title: string;
  description: string;
  impact: 'Positive' | 'Negative' | 'Neutral';
  recommendation: string;
  confidence: number; // float
}

// For Feedback List
export interface FeedbackListItem {
  feedback_id: number;
  member_id?: number;
  member_name?: string; // Assuming we can join to get member name
  feedback_date: string; // YYYY-MM-DD string
  feedback_type: 'Class' | 'Trainer' | 'Facility' | 'General';
  content: string;
  rating: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentiment_score?: number; // float
}

// Main Dashboard Response Types
export interface FeedbackDashboardSummary {
  total_feedback: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_percentage: number; // float
  neutral_percentage: number;  // float
  negative_percentage: number; // float
  avg_rating: number; // float
  latest_ai_insight?: AIInsight; // For the top right card
}

// Combined interface for initial dashboard data fetch
export interface FeedbackDashboardData {
  summary: FeedbackDashboardSummary;
  sentimentDistribution: SentimentDistribution[];
  topicAnalysis: TopicAnalysisItem[];
  sentimentTrendDaily: DailySentimentTrend[];
  recentFeedback: FeedbackListItem[];
  allAIInsights: AIInsight[]; // All insights for the scrollable list
  feedbackTypes: string[]; // For filter dropdowns
  memberNames: string[]; // For filter dropdowns
}

// Filters for fetching feedback list
export interface FeedbackFilters {
  member_id?: number;
  feedback_type?: string;
  sentiment?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  search_query?: string;
  skip?: number;
  limit?: number;
}