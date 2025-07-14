// src/types/inventory.ts

export interface EquipmentCategory {
  category_id: number;
  category_name: string;
  description?: string;
  created_at: string; // ISO string date-time
}

export interface EquipmentCategoryCreate {
  category_name: string;
  description?: string;
}

export interface EquipmentCategoryUpdate {
  category_name?: string;
  description?: string;
}

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  created_at: string; // ISO string date-time
}

export interface SupplierCreate {
  supplier_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
}

export interface SupplierUpdate {
  supplier_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
}

export interface Equipment {
  equipment_id: number;
  name: string;
  category_id: number;
  supplier_id: number;
  purchase_date?: string; // YYYY-MM-DD string
  purchase_price?: number;
  status: 'Baik' | 'Rusak' | 'Dalam Perbaikan' | 'Perlu Diganti';
  quantity: number;
  last_maintenance?: string; // YYYY-MM-DD string
  next_maintenance?: string; // YYYY-MM-DD string
  warranty_end?: string; // YYYY-MM-DD string
  location?: string;
  serial_number?: string;
  notes?: string;
  created_at: string; // ISO string date-time
  updated_at: string; // ISO string date-time

  // Nested relationships from backend
  category?: EquipmentCategory;
  supplier?: Supplier;
}

export interface EquipmentCreate {
  name: string;
  category_id: number;
  supplier_id: number;
  purchase_date?: string;
  purchase_price?: number;
  status?: 'Baik' | 'Rusak' | 'Dalam Perbaikan' | 'Perlu Diganti';
  quantity?: number;
  last_maintenance?: string;
  next_maintenance?: string;
  warranty_end?: string;
  location?: string;
  serial_number?: string;
  notes?: string;
}

export interface EquipmentUpdate {
  name?: string;
  category_id?: number;
  supplier_id?: number;
  purchase_date?: string;
  purchase_price?: number;
  status?: 'Baik' | 'Rusak' | 'Dalam Perbaikan' | 'Perlu Diganti';
  quantity?: number;
  last_maintenance?: string;
  next_maintenance?: string;
  warranty_end?: string;
  location?: string;
  serial_number?: string;
  notes?: string;
}

export interface BackupEquipment {
  backup_id: number;
  equipment_id: number;
  quantity: number;
  condition: string;
  location: string;
  notes?: string;
  created_at: string;
  updated_at: string;

  equipment?: Equipment; // Nested relationship
}

export interface BackupEquipmentCreate {
  equipment_id: number;
  quantity?: number;
  condition?: string;
  location?: string;
  notes?: string;
}

export interface BackupEquipmentUpdate {
  equipment_id?: number;
  quantity?: number;
  condition?: string;
  location?: string;
  notes?: string;
}

export interface EquipmentMaintenance {
  maintenance_id: number;
  equipment_id: number;
  maintenance_date: string; // YYYY-MM-DD string
  maintenance_type: 'Routine' | 'Repair' | 'Replacement' | 'Inspection';
  description?: string;
  cost?: number;
  technician_name?: string;
  next_maintenance_date?: string; // YYYY-MM-DD string
  status: string; // Status of the maintenance record itself
  created_at: string;

  equipment?: Equipment; // Nested relationship
}

export interface EquipmentMaintenanceCreate {
  equipment_id: number;
  maintenance_date: string;
  maintenance_type: 'Routine' | 'Repair' | 'Replacement' | 'Inspection';
  description?: string;
  cost?: number;
  technician_name?: string;
  next_maintenance_date?: string;
  status?: string;
}

export interface EquipmentMaintenanceUpdate {
  maintenance_date?: string;
  maintenance_type?: 'Routine' | 'Repair' | 'Replacement' | 'Inspection';
  description?: string;
  cost?: number;
  technician_name?: string;
  next_maintenance_date?: string;
  status?: string;
}

export interface EquipmentStatusLog {
  log_id: number;
  equipment_id: number;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  change_reason?: string;
  change_date: string; // ISO string date-time

  equipment?: Equipment; // Nested relationship
}

export interface EquipmentStatusLogCreate {
  equipment_id: number;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  change_reason?: string;
}

export interface EquipmentUsageLog {
  usage_id: number;
  equipment_id: number;
  usage_date: string; // YYYY-MM-DD string
  usage_count: number;
  peak_hours: number;
  maintenance_needed: boolean;
  notes?: string;
  created_at: string;

  equipment?: Equipment; // Nested relationship
}

export interface EquipmentUsageLogCreate {
  equipment_id: number;
  usage_date: string;
  usage_count?: number;
  peak_hours?: number;
  maintenance_needed?: boolean;
  notes?: string;
}

export interface EquipmentUsageLogUpdate {
  usage_date?: string;
  usage_count?: number;
  peak_hours?: number;
  maintenance_needed?: boolean;
  notes?: string;
}

export interface AIInventoryRecommendation {
  recommendation_id: number;
  timestamp: string; // ISO string date-time
  trigger_equipment_id?: number;
  trigger_event: string;
  recommended_equipment_name: string;
  recommended_category_id: number;
  estimated_cost?: number;
  current_profit_margin_percent?: number;
  ai_reasoning?: string;
  ai_predicted_purchase_time?: string;
  manager_decision: 'Pending' | 'Accepted' | 'Deferred' | 'Declined' | 'Replaced from Backup';
  decision_date?: string; // ISO string date-time
  notes_manager?: string;
  contact_supplier_details?: string;
  created_at: string;

  trigger_equipment?: Equipment; // Nested relationship
  recommended_category?: EquipmentCategory; // Nested relationship
}

export interface AIInventoryRecommendationCreate {
  timestamp?: string;
  trigger_equipment_id?: number;
  trigger_event: string;
  recommended_equipment_name: string;
  recommended_category_id: number;
  estimated_cost?: number;
  current_profit_margin_percent?: number;
  ai_reasoning?: string;
  ai_predicted_purchase_time?: string;
  manager_decision?: 'Pending' | 'Accepted' | 'Deferred' | 'Declined' | 'Replaced from Backup';
  decision_date?: string;
  notes_manager?: string;
  contact_supplier_details?: string;
}

export interface AIInventoryRecommendationUpdate {
  manager_decision?: 'Pending' | 'Accepted' | 'Deferred' | 'Declined' | 'Replaced from Backup';
  decision_date?: string;
  notes_manager?: string;
  contact_supplier_details?: string;
}

// --- Dashboard Specific Types ---
export interface InventorySummary {
  total_equipment: number;
  total_active_equipment: number;
  total_broken_equipment: number;
  total_in_maintenance_equipment: number;
  total_replacement_needed_equipment: number;
  total_backup_stock: number;
  latest_ai_recommendation?: AIInventoryRecommendation;
  total_equipment_value: number;
}

export interface EquipmentTableItem {
  equipment_id: number;
  name: string;
  category_name: string;
  status: 'Baik' | 'Rusak' | 'Dalam Perbaikan' | 'Perlu Diganti';
  quantity: number;
  location: string;
  last_maintenance?: string;
  next_maintenance?: string;
  warranty_end?: string;
}

export interface BrokenEquipmentTrend {
  week: string; // e.g., "Week 45"
  broken_equipment: number;
}

export interface MostUsedEquipment {
  name: string; // Equipment name
  usage_count: number;
}

export interface RecentStatusLog {
  log_id: number;
  equipment_name: string;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  change_reason?: string;
  change_date: string; // ISO string date-time
}

export interface InventoryTrends {
  broken_equipment_trend: BrokenEquipmentTrend[];
  most_used_equipment: MostUsedEquipment[];
  recent_status_logs: RecentStatusLog[];
}

export interface InventoryFilters {
  status?: string;
  category_name?: string;
  search_query?: string;
  skip?: number;
  limit?: number;
}

// Combined interface for initial dashboard data fetch
export interface InventoryDashboardData {
  summary: InventorySummary;
  equipmentList: EquipmentTableItem[];
  trends: InventoryTrends;
  equipmentCategories: EquipmentCategory[]; // For filter dropdowns
}