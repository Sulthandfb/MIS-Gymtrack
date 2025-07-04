// src/services/api.ts
import axios from "axios";
import type { // Gunakan 'type' untuk impor tipe
  MemberStats,
  MemberActivity,
  Insight,
  ChartSegment,
  ChartWorkout,
  ChartFunnel,
  ChartNotifResponse,
  ChartABTesting,
} from "@/types/insight";
import type {
  Trainer,
  TrainerDashboardData,
  TrainerActivityDataItem, // Import tipe baru
  TrainerScheduleClassItem, // Import tipe baru
} from "@/types/trainer"; //// Gunakan 'type' untuk impor tipe Trainer dan TrainerDashboardData

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const fetchMemberStats = async (): Promise<MemberStats> => {
  const res = await axios.get(`${API_URL}/api/stats/members`);
  return res.data as MemberStats;
};

export const fetchMemberActivity = async (): Promise<MemberActivity[]> => {
  const res = await axios.get(`${API_URL}/api/stats/member-activity`);
  return res.data as MemberActivity[];
};

export const fetchInsights = async (): Promise<Insight[]> => {
  const res = await axios.get(`${API_URL}/api/insight/member`);
  return res.data as Insight[];
};

export const fetchSegmentData = async (): Promise<ChartSegment[]> => {
  const res = await axios.get(`${API_URL}/api/stats/member-segment`);
  return res.data as ChartSegment[];
};

export const fetchWorkoutTimeData = async (): Promise<ChartWorkout[]> => {
  const res = await axios.get(`${API_URL}/api/stats/workout-time`);
  return res.data as ChartWorkout[];
};

export const fetchFunnelData = async (): Promise<ChartFunnel[]> => {
  const res = await axios.get(`${API_URL}/api/stats/conversion-funnel`);
  return res.data as ChartFunnel[];
};

export const fetchNotificationResponse = async (): Promise<ChartNotifResponse[]> => {
  const res = await axios.get(`${API_URL}/api/stats/notification-response`);
  return res.data as ChartNotifResponse[];
};

export const fetchABTestData = async (): Promise<ChartABTesting[]> => {
  const res = await axios.get(`${API_URL}/api/stats/ab-test`);
  return res.data as ChartABTesting[];
};

//Trainer//
export const fetchAllTrainers = async (): Promise<Trainer[]> => {
  const res = await axios.get(`${API_URL}/api/trainers`); // Tambahkan /api/ di sini
  return res.data as Trainer[];
};

export const fetchTrainerDetail = async (trainerId: string): Promise<Trainer> => {
  const res = await axios.get(`${API_URL}/api/trainers/${trainerId}`); // Tambahkan /api/ di sini
  return res.data as Trainer;
};

export const fetchTrainerDashboardData = async (): Promise<TrainerDashboardData> => {
  const res = await axios.get(`${API_URL}/api/trainers/performance`); // Tambahkan /api/ di sini
  return res.data as TrainerDashboardData;
};

// --- Fungsi Baru untuk Trainer Detail Page ---

export const fetchTrainerActivity = async (trainerId: string): Promise<TrainerActivityDataItem[]> => {
  const res = await axios.get(`${API_URL}/api/trainers/${trainerId}/activity`);
  return res.data as TrainerActivityDataItem[];
};

export const fetchTrainerSchedule = async (trainerId: string): Promise<Record<string, TrainerScheduleClassItem[]>> => {
  const res = await axios.get(`${API_URL}/api/trainers/${trainerId}/schedule`);
  return res.data as Record<string, TrainerScheduleClassItem[]>;
};