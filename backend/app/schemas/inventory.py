# backend/app/schemas/inventory.py

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List

# --- Equipment Categories Schemas ---
class EquipmentCategoryBase(BaseModel):
    category_name: str = Field(..., max_length=100)
    description: Optional[str] = None

class EquipmentCategoryCreate(EquipmentCategoryBase):
    pass

class EquipmentCategoryUpdate(BaseModel):
    category_name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None

class EquipmentCategory(EquipmentCategoryBase):
    category_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Suppliers Schemas ---
class SupplierBase(BaseModel):
    supplier_name: str = Field(..., max_length=200)
    contact_person: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = None
    whatsapp: Optional[str] = Field(None, max_length=20)

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    supplier_name: Optional[str] = Field(None, max_length=200)
    contact_person: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = None
    whatsapp: Optional[str] = Field(None, max_length=20)

class Supplier(SupplierBase):
    supplier_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Equipment Schemas ---
class EquipmentBase(BaseModel):
    name: str = Field(..., max_length=200)
    category_id: int
    supplier_id: int
    purchase_date: Optional[date] = None
    purchase_price: Optional[float] = Field(None, ge=0)
    status: str = Field("Baik", max_length=50) # 'Baik', 'Rusak', 'Dalam Perbaikan', 'Perlu Diganti'
    quantity: int = Field(1, ge=1)
    last_maintenance: Optional[date] = None
    next_maintenance: Optional[date] = None
    warranty_end: Optional[date] = None
    location: Optional[str] = Field(None, max_length=100)
    serial_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[float] = Field(None, ge=0)
    status: Optional[str] = Field(None, max_length=50)
    quantity: Optional[int] = Field(None, ge=1)
    last_maintenance: Optional[date] = None
    next_maintenance: Optional[date] = None
    warranty_end: Optional[date] = None
    location: Optional[str] = Field(None, max_length=100)
    serial_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class Equipment(EquipmentBase):
    equipment_id: int
    created_at: datetime
    updated_at: datetime

    category: EquipmentCategory # Nested schema
    supplier: Supplier # Nested schema

    class Config:
        from_attributes = True

# --- Backup Equipment Schemas ---
class BackupEquipmentBase(BaseModel):
    equipment_id: int
    quantity: int = Field(0, ge=0)
    condition: str = Field("Baik", max_length=50)
    location: str = Field("Gudang Utama", max_length=100)
    notes: Optional[str] = None

class BackupEquipmentCreate(BackupEquipmentBase):
    pass

class BackupEquipmentUpdate(BaseModel):
    equipment_id: Optional[int] = None
    quantity: Optional[int] = Field(None, ge=0)
    condition: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class BackupEquipment(BackupEquipmentBase):
    backup_id: int
    created_at: datetime
    updated_at: datetime

    equipment: Equipment # Nested schema, ensure it doesn't cause circular dependency

    class Config:
        from_attributes = True

# --- Equipment Maintenance Schemas ---
class EquipmentMaintenanceBase(BaseModel):
    equipment_id: int
    maintenance_date: date
    maintenance_type: str = Field(..., max_length=50) # 'Routine', 'Repair', 'Replacement', 'Inspection'
    description: Optional[str] = None
    cost: Optional[float] = Field(0, ge=0)
    technician_name: Optional[str] = Field(None, max_length=100)
    next_maintenance_date: Optional[date] = None
    status: str = Field("Completed", max_length=50) # Status of the maintenance record itself

class EquipmentMaintenanceCreate(EquipmentMaintenanceBase):
    pass

class EquipmentMaintenanceUpdate(BaseModel):
    equipment_id: Optional[int] = None
    maintenance_date: Optional[date] = None
    maintenance_type: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    cost: Optional[float] = Field(None, ge=0)
    technician_name: Optional[str] = Field(None, max_length=100)
    next_maintenance_date: Optional[date] = None
    status: Optional[str] = Field(None, max_length=50)

class EquipmentMaintenance(EquipmentMaintenanceBase):
    maintenance_id: int
    created_at: datetime

    equipment: Equipment # Nested schema

    class Config:
        from_attributes = True

# --- Equipment Status Log Schemas ---
class EquipmentStatusLogBase(BaseModel):
    equipment_id: int
    old_status: Optional[str] = Field(None, max_length=50)
    new_status: str = Field(..., max_length=50)
    changed_by: Optional[str] = Field(None, max_length=100)
    change_reason: Optional[str] = None

class EquipmentStatusLogCreate(EquipmentStatusLogBase):
    pass

class EquipmentStatusLogUpdate(BaseModel):
    old_status: Optional[str] = Field(None, max_length=50)
    new_status: Optional[str] = Field(None, max_length=50)
    changed_by: Optional[str] = Field(None, max_length=100)
    change_reason: Optional[str] = None


class EquipmentStatusLog(EquipmentStatusLogBase):
    log_id: int
    change_date: datetime

    equipment: Equipment # Nested schema

    class Config:
        from_attributes = True

# --- Equipment Usage Log Schemas ---
class EquipmentUsageLogBase(BaseModel):
    equipment_id: int
    usage_date: date
    usage_count: int = Field(1, ge=0)
    peak_hours: int = Field(0, ge=0, le=23)
    maintenance_needed: bool = False
    notes: Optional[str] = None

class EquipmentUsageLogCreate(EquipmentUsageLogBase):
    pass

class EquipmentUsageLogUpdate(BaseModel):
    usage_date: Optional[date] = None
    usage_count: Optional[int] = Field(None, ge=0)
    peak_hours: Optional[int] = Field(None, ge=0, le=23)
    maintenance_needed: Optional[bool] = None
    notes: Optional[str] = None

class EquipmentUsageLog(EquipmentUsageLogBase):
    usage_id: int
    created_at: datetime

    equipment: Equipment # Nested schema

    class Config:
        from_attributes = True

# --- AI Inventory Recommendation Schemas ---
class AIInventoryRecommendationBase(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.now)
    trigger_equipment_id: Optional[int] = None
    trigger_event: str = Field(..., max_length=255)
    recommended_equipment_name: str = Field(..., max_length=200)
    recommended_category_id: int
    estimated_cost: Optional[float] = Field(None, ge=0)
    current_profit_margin_percent: Optional[float] = Field(None, ge=0, le=100)
    ai_reasoning: Optional[str] = None
    ai_predicted_purchase_time: Optional[str] = Field(None, max_length=100)
    manager_decision: str = Field("Pending", max_length=50) # 'Pending', 'Accepted', 'Deferred', 'Declined', 'Replaced from Backup'
    decision_date: Optional[datetime] = None
    notes_manager: Optional[str] = None
    contact_supplier_details: Optional[str] = None

class AIInventoryRecommendationCreate(AIInventoryRecommendationBase):
    pass

class AIInventoryRecommendationUpdate(BaseModel):
    manager_decision: Optional[str] = Field(None, max_length=50)
    decision_date: Optional[datetime] = None
    notes_manager: Optional[str] = None
    contact_supplier_details: Optional[str] = None

class AIInventoryRecommendation(AIInventoryRecommendationBase):
    recommendation_id: int
    created_at: datetime

    # ✅ FIXED: Tambahkan = None sebagai default untuk relasi opsional
    trigger_equipment: Optional[Equipment] = None
    recommended_category: Optional[EquipmentCategory] = None # ✅ FIXED: Ini juga dibuat opsional dan diberi default None

    class Config:
        from_attributes = True

# --- Dashboard Specific Schemas ---
class InventorySummary(BaseModel):
    total_equipment: int
    total_active_equipment: int
    total_broken_equipment: int
    total_in_maintenance_equipment: int
    total_replacement_needed_equipment: int
    total_backup_stock: int
    latest_ai_recommendation: Optional[AIInventoryRecommendation]
    total_equipment_value: float # NEW: Total purchase value of all equipment

class EquipmentTableItem(BaseModel):
    equipment_id: int
    name: str
    category_name: str
    status: str
    quantity: int
    location: str
    last_maintenance: Optional[date]
    next_maintenance: Optional[date]
    warranty_end: Optional[date]

    class Config:
        from_attributes = True