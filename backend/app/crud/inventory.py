# backend/app/crud/inventory.py
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, case, text, and_
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional, Tuple
from app.models.inventory import (
    EquipmentCategory,
    Supplier,
    Equipment,
    BackupEquipment,
    EquipmentMaintenance,
    EquipmentStatusLog,
    EquipmentUsageLog,
    AIInventoryRecommendation
)
from app.schemas.inventory import (
    EquipmentCategoryCreate, EquipmentCategoryUpdate,
    SupplierCreate, SupplierUpdate,
    EquipmentCreate, EquipmentUpdate,
    BackupEquipmentCreate, BackupEquipmentUpdate,
    EquipmentMaintenanceCreate, EquipmentMaintenanceUpdate,
    EquipmentStatusLogCreate,
    EquipmentUsageLogCreate, EquipmentUsageLogUpdate,
    AIInventoryRecommendationCreate, AIInventoryRecommendationUpdate
)

# --- Helper Functions (unchanged) ---
def get_equipment_by_id(db: Session, equipment_id: int):
    return db.query(Equipment).options(
        joinedload(Equipment.category),
        joinedload(Equipment.supplier)
    ).filter(Equipment.equipment_id == equipment_id).first()

def get_equipment_category_by_id(db: Session, category_id: int):
    return db.query(EquipmentCategory).filter(EquipmentCategory.category_id == category_id).first()

def get_supplier_by_id(db: Session, supplier_id: int):
    return db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()

# --- CRUD for Equipment Categories (unchanged) ---
def get_equipment_category(db: Session, category_id: int):
    return db.query(EquipmentCategory).filter(EquipmentCategory.category_id == category_id).first()

def get_equipment_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(EquipmentCategory).offset(skip).limit(limit).all()

def create_equipment_category(db: Session, category: EquipmentCategoryCreate):
    db_category = EquipmentCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_equipment_category(db: Session, category_id: int, category: EquipmentCategoryUpdate):
    db_category = db.query(EquipmentCategory).filter(EquipmentCategory.category_id == category_id).first()
    if db_category:
        for key, value in category.model_dump(exclude_unset=True).items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_equipment_category(db: Session, category_id: int):
    db_category = db.query(EquipmentCategory).filter(EquipmentCategory.category_id == category_id).first()
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category

# --- CRUD for Suppliers (unchanged) ---
def get_supplier(db: Session, supplier_id: int):
    return db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()

def get_suppliers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Supplier).offset(skip).limit(limit).all()

def create_supplier(db: Session, supplier: SupplierCreate):
    db_supplier = Supplier(**supplier.model_dump())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def update_supplier(db: Session, supplier_id: int, supplier: SupplierUpdate):
    db_supplier = db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()
    if db_supplier:
        for key, value in supplier.model_dump(exclude_unset=True).items():
            setattr(db_supplier, key, value)
        db.commit()
        db.refresh(db_supplier)
    return db_supplier

def delete_supplier(db: Session, supplier_id: int):
    db_supplier = db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()
    if db_supplier:
        db.delete(db_supplier)
        db.commit()
    return db_supplier

# --- CRUD for Equipment (unchanged) ---
def get_equipment(db: Session, equipment_id: int):
    return db.query(Equipment).options(
        joinedload(Equipment.category),
        joinedload(Equipment.supplier)
    ).filter(Equipment.equipment_id == equipment_id).first()

def get_equipment_list(db: Session, status: Optional[str] = None, category_id: Optional[int] = None,
                       search_query: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(Equipment).options(
        joinedload(Equipment.category),
        joinedload(Equipment.supplier)
    )
    if status:
        query = query.filter(Equipment.status == status)
    if category_id:
        query = query.filter(Equipment.category_id == category_id)
    if search_query:
        query = query.filter(Equipment.name.ilike(f"%{search_query}%"))
    return query.offset(skip).limit(limit).all()

def create_equipment(db: Session, equipment: EquipmentCreate):
    db_equipment = Equipment(**equipment.model_dump())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

def update_equipment(db: Session, equipment_id: int, equipment: EquipmentUpdate, changed_by: Optional[str] = "System"):
    db_equipment = db.query(Equipment).filter(Equipment.equipment.id == equipment_id).first()
    if db_equipment:
        old_status = db_equipment.status
        update_data = equipment.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_equipment, key, value)
        db.commit()
        db.refresh(db_equipment)
        if 'status' in update_data and update_data['status'] != old_status:
            log_status_change(db, equipment_id, old_status, update_data['status'], changed_by, f"Status changed from {old_status} to {update_data['status']}")
        return db_equipment

def delete_equipment(db: Session, equipment_id: int):
    db_equipment = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if db_equipment:
        db.delete(db_equipment)
        db.commit()
    return db_equipment

# --- CRUD for Backup Equipment (unchanged) ---
def get_backup_equipment_item(db: Session, backup_id: int):
    return db.query(BackupEquipment).options(
        joinedload(BackupEquipment.equipment_rel).joinedload(Equipment.category)
    ).filter(BackupEquipment.backup_id == backup_id).first()

def get_backup_equipment_list(db: Session, skip: int = 0, limit: int = 100):
    return db.query(BackupEquipment).options(
        joinedload(BackupEquipment.equipment_rel).joinedload(Equipment.category)
    ).offset(skip).limit(limit).all()

def create_backup_equipment_item(db: Session, backup_item: BackupEquipmentCreate):
    db_backup_item = BackupEquipment(**backup_item.model_dump())
    db.add(db_backup_item)
    db.commit()
    db.refresh(db_backup_item)
    return db_backup_item

def update_backup_equipment_item(db: Session, backup_id: int, backup_item: BackupEquipmentUpdate):
    db_backup_item = db.query(BackupEquipment).filter(BackupEquipment.backup_id == backup_id).first()
    if db_backup_item:
        for key, value in backup_item.model_dump(exclude_unset=True).items():
            setattr(db_backup_item, key, value)
        db.commit()
        db.refresh(db_backup_item)
    return db_backup_item

def delete_backup_equipment_item(db: Session, backup_id: int):
    db_backup_item = db.query(BackupEquipment).filter(BackupEquipment.backup_id == backup_id).first()
    if db_backup_item:
        db.delete(db_backup_item)
        db.commit()
    return db_backup_item

# --- CRUD for Equipment Maintenance (unchanged) ---
def get_maintenance_record(db: Session, maintenance_id: int):
    return db.query(EquipmentMaintenance).options(
        joinedload(EquipmentMaintenance.equipment_rel)
    ).filter(EquipmentMaintenance.maintenance_id == maintenance_id).first()

def get_maintenance_history(db: Session, equipment_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(EquipmentMaintenance).options(
        joinedload(EquipmentMaintenance.equipment_rel)
    )
    if equipment_id:
        query = query.filter(EquipmentMaintenance.equipment_id == equipment_id)
    return query.order_by(EquipmentMaintenance.maintenance_date.desc()).offset(skip).limit(limit).all()

def create_maintenance_record(db: Session, maintenance: EquipmentMaintenanceCreate):
    db_maintenance = EquipmentMaintenance(**maintenance.model_dump())
    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

def update_maintenance_record(db: Session, maintenance_id: int, maintenance: EquipmentMaintenanceUpdate):
    db_maintenance = db.query(EquipmentMaintenance).filter(EquipmentMaintenance.maintenance_id == maintenance_id).first()
    if db_maintenance:
        for key, value in maintenance.model_dump(exclude_unset=True).items():
            setattr(db_maintenance, key, value)
        db.commit()
        db.refresh(db_maintenance)
    return db_maintenance

def delete_maintenance_record(db: Session, maintenance_id: int):
    db_maintenance = db.query(EquipmentMaintenance).filter(EquipmentMaintenance.maintenance_id == maintenance_id).first()
    if db_maintenance:
        db.delete(db_maintenance)
        db.commit()
    return db_maintenance

# --- CRUD for Equipment Status Log (unchanged) ---
def get_status_log(db: Session, log_id: int):
    return db.query(EquipmentStatusLog).filter(EquipmentStatusLog.log_id == log_id).first()

def get_equipment_status_logs(db: Session, equipment_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(EquipmentStatusLog).options(
        joinedload(EquipmentStatusLog.equipment_rel)
    )
    if equipment_id:
        query = query.filter(EquipmentStatusLog.equipment_id == equipment_id)
    return query.order_by(EquipmentStatusLog.change_date.desc()).offset(skip).limit(limit).all()

def log_status_change(db: Session, equipment_id: int, old_status: str, new_status: str, changed_by: str, change_reason: str):
    db_log = EquipmentStatusLog(
        equipment_id=equipment_id,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by,
        change_reason=change_reason
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# --- CRUD for Equipment Usage Log (unchanged) ---
def get_usage_log(db: Session, usage_id: int):
    return db.query(EquipmentUsageLog).filter(EquipmentUsageLog.usage_id == usage_id).first()

def get_equipment_usage_logs(db: Session, equipment_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(EquipmentUsageLog).options(
        joinedload(EquipmentUsageLog.equipment_rel)
    )
    if equipment_id:
        query = query.filter(EquipmentUsageLog.equipment_id == equipment_id)
    return query.order_by(EquipmentUsageLog.usage_date.desc()).offset(skip).limit(limit).all()

def create_equipment_usage_log(db: Session, usage_log: EquipmentUsageLogCreate):
    db_usage_log = EquipmentUsageLog(**usage_log.model_dump())
    db.add(db_usage_log)
    db.commit()
    db.refresh(db_usage_log)
    return db_usage_log

def update_equipment_usage_log(db: Session, usage_id: int, usage_log: EquipmentUsageLogUpdate):
    db_usage_log = db.query(EquipmentUsageLog).filter(EquipmentUsageLog.usage_id == usage_id).first()
    if db_usage_log:
        for key, value in usage_log.model_dump(exclude_unset=True).items():
            setattr(db_usage_log, key, value)
        db.commit()
        db.refresh(db_usage_log)
    return db_usage_log

def delete_equipment_usage_log(db: Session, usage_id: int):
    db_usage_log = db.query(EquipmentUsageLog).filter(EquipmentUsageLog.usage_id == usage_id).first()
    if db_usage_log:
        db.delete(db_usage_log)
        db.commit()
    return db_usage_log

# --- CRUD for AI Inventory Recommendation (unchanged) ---
def get_ai_recommendation(db: Session, recommendation_id: int):
    return db.query(AIInventoryRecommendation).options(
        joinedload(AIInventoryRecommendation.trigger_equipment_rel).joinedload(Equipment.category),
        joinedload(AIInventoryRecommendation.recommended_category_rel)
    ).filter(AIInventoryRecommendation.recommendation_id == recommendation_id).first()

def get_ai_recommendations(db: Session, manager_decision: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(AIInventoryRecommendation).options(
        joinedload(AIInventoryRecommendation.trigger_equipment_rel).joinedload(Equipment.category),
        joinedload(AIInventoryRecommendation.recommended_category_rel)
    )
    if manager_decision:
        query = query.filter(AIInventoryRecommendation.manager_decision == manager_decision)
    return query.order_by(AIInventoryRecommendation.timestamp.desc()).offset(skip).limit(limit).all()

def create_ai_recommendation(db: Session, recommendation: AIInventoryRecommendationCreate):
    db_recommendation = AIInventoryRecommendation(**recommendation.model_dump())
    db.add(db_recommendation)
    db.commit()
    db.refresh(db_recommendation)
    return db_recommendation

def update_ai_recommendation(db: Session, recommendation_id: int, recommendation: AIInventoryRecommendationUpdate):
    db_recommendation = db.query(AIInventoryRecommendation).filter(AIInventoryRecommendation.recommendation_id == recommendation_id).first()
    if db_recommendation:
        for key, value in recommendation.model_dump(exclude_unset=True).items():
            setattr(db_recommendation, key, value)
        db.commit()
        db.refresh(db_recommendation)
    return db_recommendation

def delete_ai_recommendation(db: Session, recommendation_id: int):
    db_recommendation = db.query(AIInventoryRecommendation).filter(AIInventoryRecommendation.recommendation_id == recommendation_id).first()
    if db_recommendation:
        db.delete(db_recommendation)
        db.commit()
    return db_recommendation

# --- Dashboard Summary Data ---
def get_inventory_summary(db: Session) -> Dict[str, Any]:
    total_equipment = db.query(func.sum(Equipment.quantity)).scalar() or 0
    total_active = db.query(func.sum(Equipment.quantity)).filter(Equipment.status == 'Baik').scalar() or 0
    total_broken = db.query(func.sum(Equipment.quantity)).filter(Equipment.status == 'Rusak').scalar() or 0
    total_in_maintenance = db.query(func.sum(Equipment.quantity)).filter(Equipment.status == 'Dalam Perbaikan').scalar() or 0
    total_replacement_needed = db.query(func.sum(Equipment.quantity)).filter(Equipment.status == 'Perlu Diganti').scalar() or 0
    total_backup_stock = db.query(func.sum(BackupEquipment.quantity)).scalar() or 0
    
    # Fetch the latest AI recommendation without joined loads for the summary view
    latest_ai_rec = db.query(AIInventoryRecommendation).order_by(AIInventoryRecommendation.timestamp.desc()).first()

    total_equipment_value = db.query(func.sum(Equipment.purchase_price * Equipment.quantity)).scalar() or 0
    latest_ai_recommendation_data = None
    if latest_ai_rec:
        # Manually construct the dictionary to explicitly set trigger_equipment and recommended_category to None
        # This ensures the output matches the user's desired structure for the summary.
        latest_ai_recommendation_data = {
            "recommendation_id": latest_ai_rec.recommendation_id,
            "timestamp": latest_ai_rec.timestamp.isoformat(),
            "trigger_equipment_id": latest_ai_rec.trigger_equipment_id,
            "trigger_event": latest_ai_rec.trigger_event,
            "recommended_equipment_name": latest_ai_rec.recommended_equipment_name,
            "recommended_category_id": latest_ai_rec.recommended_category_id,
            "estimated_cost": float(latest_ai_rec.estimated_cost) if latest_ai_rec.estimated_cost is not None else None,
            "current_profit_margin_percent": float(latest_ai_rec.current_profit_margin_percent) if latest_ai_rec.current_profit_margin_percent is not None else None,
            "ai_reasoning": latest_ai_rec.ai_reasoning,
            "ai_predicted_purchase_time": latest_ai_rec.ai_predicted_purchase_time,
            "manager_decision": latest_ai_rec.manager_decision,
            "decision_date": latest_ai_rec.decision_date.isoformat() if latest_ai_rec.decision_date else None,
            "notes_manager": latest_ai_rec.notes_manager,
            "contact_supplier_details": latest_ai_rec.contact_supplier_details,
            "created_at": latest_ai_rec.created_at.isoformat(),
            # Explicitly set these to None to match the user's desired output for the summary
            "trigger_equipment": None,
            "recommended_category": None
        }

    return {
        "total_equipment": int(total_equipment),
        "total_active_equipment": int(total_active),
        "total_broken_equipment": int(total_broken),
        "total_in_maintenance_equipment": int(total_in_maintenance),
        "total_replacement_needed_equipment": int(total_replacement_needed),
        "total_backup_stock": int(total_backup_stock),
        "latest_ai_recommendation": latest_ai_recommendation_data,
        "total_equipment_value": float(total_equipment_value)
    }

# --- Dashboard Table Data (unchanged) ---
def get_inventory_table_data(db: Session, skip: int = 0, limit: int = 100,
                             status: Optional[str] = None, category_name: Optional[str] = None,
                             search_query: Optional[str] = None) -> List[Dict[str, Any]]:
    query = db.query(
        Equipment.equipment_id,
        Equipment.name,
        EquipmentCategory.category_name,
        Equipment.status,
        Equipment.quantity,
        Equipment.location,
        Equipment.last_maintenance,
        Equipment.next_maintenance,
        Equipment.warranty_end
    ).join(EquipmentCategory, Equipment.category_id == EquipmentCategory.category_id)
    if status:
        query = query.filter(Equipment.status == status)
    if category_name:
        query = query.filter(EquipmentCategory.category_name.ilike(f"%{category_name}%"))
    if search_query:
        query = query.filter(Equipment.name.ilike(f"%{search_query}%"))
    return [
        {
            "equipment_id": row.equipment_id,
            "name": row.name,
            "category_name": row.category_name,
            "status": row.status,
            "quantity": row.quantity,
            "location": row.location,
            "last_maintenance": row.last_maintenance,
            "next_maintenance": row.next_maintenance,
            "warranty_end": row.warranty_end,
        }
        for row in query.order_by(Equipment.equipment_id).offset(skip).limit(limit).all()
    ]

# --- Dashboard Usage & Maintenance Trend Data ---
def get_usage_and_maintenance_trends(db: Session) -> Dict[str, Any]:
    def safe_date(value):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.date()
        return value

    # Tanggal log status alat (rusak)
    # Query min and max change_date specifically for 'Rusak' status
    min_log_date_dt = safe_date(db.query(func.min(EquipmentStatusLog.change_date)).filter(EquipmentStatusLog.new_status == 'Rusak').scalar())
    max_log_date_dt = safe_date(db.query(func.max(EquipmentStatusLog.change_date)).filter(EquipmentStatusLog.new_status == 'Rusak').scalar())

    broken_equipment_chart = []
    if min_log_date_dt and max_log_date_dt:
        start_date_broken = min_log_date_dt
        end_date_broken = max_log_date_dt

        # Ensure start_date is not after end_date, though unlikely with min/max
        if start_date_broken > end_date_broken:
            start_date_broken = end_date_broken

        weekly_broken_data = db.execute(text(f"""
            SELECT
                TO_CHAR(change_date, 'IYYY-IW') as week_label,
                COUNT(DISTINCT equipment_id) as broken_count
            FROM equipment_status_log
            WHERE new_status = 'Rusak' AND change_date BETWEEN :start_date AND :end_date
            GROUP BY week_label
            ORDER BY week_label
        """), {"start_date": start_date_broken, "end_date": end_date_broken}).fetchall()

        full_weeks_broken = {}
        current_week = start_date_broken
        # Add 6 days to ensure the last week is included if it's not a full week
        while current_week <= end_date_broken + timedelta(days=6):
            iso_year, iso_week, _ = current_week.isocalendar()
            week_label = f"{iso_year}-W{iso_week:02d}"
            full_weeks_broken[week_label] = {"week": week_label, "broken_equipment": 0}
            current_week += timedelta(weeks=1) # Move to the next week

        for row in weekly_broken_data:
            week_label = row.week_label
            if week_label in full_weeks_broken:
                full_weeks_broken[week_label]["broken_equipment"] = row.broken_count

        broken_equipment_chart = sorted(full_weeks_broken.values(), key=lambda x: x["week"])

    # Operational Equipment Trend (Monthly)
    min_purchase_date_dt = safe_date(db.query(func.min(Equipment.purchase_date)).scalar())
    max_purchase_date_dt = safe_date(db.query(func.max(Equipment.purchase_date)).scalar())

    operational_equipment_chart = []
    if min_purchase_date_dt and max_purchase_date_dt:
        start_date_op = min_purchase_date_dt
        end_date_op = max_purchase_date_dt

        monthly_operational_data = db.execute(text(f"""
            SELECT
                TO_CHAR(purchase_date, 'YYYY-MM') as month_label,
                SUM(quantity) as operational_count
            FROM equipment
            WHERE status = 'Baik' AND purchase_date BETWEEN :start_date AND :end_date
            GROUP BY month_label
            ORDER BY month_label
        """), {"start_date": start_date_op, "end_date": end_date_op}).fetchall()

        full_months_operational = {}
        current_month = start_date_op.replace(day=1)
        while current_month <= end_date_op.replace(day=1):
            month_label = current_month.strftime('%Y-%m')
            full_months_operational[month_label] = {"month": month_label, "operational_equipment": 0}
            # Move to the next month
            if current_month.month == 12:
                current_month = current_month.replace(year=current_month.year + 1, month=1)
            else:
                current_month = current_month.replace(month=current_month.month + 1)

        for row in monthly_operational_data:
            month_label = row.month_label
            if month_label in full_months_operational:
                full_months_operational[month_label]["operational_equipment"] = int(row.operational_count)

        operational_equipment_chart = sorted(full_months_operational.values(), key=lambda x: x["month"])

    # Data penggunaan alat
    min_usage_date = safe_date(db.query(func.min(EquipmentUsageLog.usage_date)).scalar())
    max_usage_date = safe_date(db.query(func.max(EquipmentUsageLog.usage_date)).scalar())
    start_usage = min_usage_date or date.today() - timedelta(days=365)
    end_usage = max_usage_date or date.today()
    if start_usage > end_usage:
        start_usage = end_usage

    # If no usage data, return empty list for most_used_chart
    most_used_chart = []
    if min_usage_date and max_usage_date:
        most_used_equipment = db.execute(text("""
            SELECT
                e.name as equipment_name,
                SUM(eul.usage_count) as total_usage
            FROM equipment_usage_log eul
            JOIN equipment e ON eul.equipment_id = e.equipment_id
            WHERE eul.usage_date BETWEEN :start_date AND :end_date
            GROUP BY e.name
            ORDER BY total_usage DESC
        """), {"start_date": start_usage, "end_date": end_usage}).fetchall()

        most_used_chart = [
            {"name": row.equipment_name, "usage_count": int(row.total_usage)}
            for row in most_used_equipment
        ]

    # Log status terbaru
    recent_status_logs = db.query(EquipmentStatusLog).options(
        joinedload(EquipmentStatusLog.equipment_rel)
    ).order_by(EquipmentStatusLog.change_date.desc()).limit(20).all()
    formatted_status_logs = [{
        "log_id": log.log_id,
        "equipment_name": log.equipment_rel.name if log.equipment_rel else "N/A",
        "old_status": log.old_status,
        "new_status": log.new_status,
        "changed_by": log.changed_by,
        "change_reason": log.change_reason,
        "change_date": log.change_date.isoformat()
    } for log in recent_status_logs]

    return {
        "broken_equipment_trend": broken_equipment_chart,
        "operational_equipment_trend": operational_equipment_chart, # NEW
        "most_used_equipment": most_used_chart,
        "recent_status_logs": formatted_status_logs
    }

# --- Service for taking from backup (unchanged) ---
def take_from_backup_stock(db: Session, equipment_id: int, quantity_to_take: int, changed_by: str = "Manager") -> Optional[Equipment]:
    backup_item = db.query(BackupEquipment).filter(BackupEquipment.equipment_id == equipment_id).first()

    if not backup_item or backup_item.quantity < quantity_to_take:
        raise ValueError("Not enough stock in backup or backup item not found.")

    backup_item.quantity -= quantity_to_take
    db.commit()
    db.refresh(backup_item)
    log_status_change(db, equipment_id, "N/A", "Taken from Backup", changed_by, f"Taken {quantity_to_take} unit(s) from backup stock.")

    return get_equipment_by_id(db, equipment_id)
