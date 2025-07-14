# backend/app/routes/inventory.py

from fastapi import APIRouter, Depends, HTTPException, Query, status, Response # ✅ NEW: Import Response
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.crud import inventory as crud_inventory
from app.schemas.inventory import (
    EquipmentCategory, EquipmentCategoryCreate, EquipmentCategoryUpdate,
    Supplier, SupplierCreate, SupplierUpdate,
    Equipment, EquipmentCreate, EquipmentUpdate,
    BackupEquipment, BackupEquipmentCreate, BackupEquipmentUpdate,
    EquipmentMaintenance, EquipmentMaintenanceCreate, EquipmentMaintenanceUpdate,
    EquipmentStatusLog, EquipmentStatusLogCreate,
    EquipmentUsageLog, EquipmentUsageLogCreate, EquipmentUsageLogUpdate,
    AIInventoryRecommendation, AIInventoryRecommendationCreate, AIInventoryRecommendationUpdate,
    InventorySummary, EquipmentTableItem
)
# Assuming you will create this service
# from app.services.inventory_ai_generator import generate_inventory_insights

router = APIRouter()

# --- Inventory Dashboard Endpoints ---
@router.get("/summary", response_model=InventorySummary)
async def get_inventory_dashboard_summary(db: Session = Depends(get_db)):
    """Get overall inventory summary for the dashboard."""
    try:
        summary_data = crud_inventory.get_inventory_summary(db)
        return InventorySummary(**summary_data)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch inventory summary: {e}")

@router.get("/dashboard-equipment", response_model=List[EquipmentTableItem])
async def get_dashboard_equipment_list(
    status: Optional[str] = Query(None, description="Filter by equipment status"),
    category_name: Optional[str] = Query(None, description="Filter by category name"),
    search_query: Optional[str] = Query(None, description="Search by equipment name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get list of equipment for the inventory dashboard table with filters."""
    try:
        equipment_list = crud_inventory.get_inventory_table_data(db, skip=skip, limit=limit, status=status, category_name=category_name, search_query=search_query)
        return equipment_list
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch dashboard equipment: {e}")

@router.get("/trends", response_model=Dict[str, Any])
async def get_inventory_trends(db: Session = Depends(get_db)):
    try:
        trends_data = crud_inventory.get_usage_and_maintenance_trends(db)
        return trends_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch inventory trends: {e}")

# --- AI Recommendation Endpoints ---
@router.get("/ai-recommendations", response_model=List[AIInventoryRecommendation])
async def get_ai_recommendations_list(
    manager_decision: Optional[str] = Query(None, description="Filter by manager decision (Pending, Accepted, etc.)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve AI inventory recommendations."""
    return crud_inventory.get_ai_recommendations(db, manager_decision=manager_decision, skip=skip, limit=limit)

@router.get("/ai-recommendations/{recommendation_id}", response_model=AIInventoryRecommendation)
async def get_ai_recommendation_by_id(recommendation_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific AI inventory recommendation."""
    db_rec = crud_inventory.get_ai_recommendation(db, recommendation_id)
    if db_rec is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")
    return db_rec

@router.post("/ai-recommendations", response_model=AIInventoryRecommendation, status_code=status.HTTP_201_CREATED)
async def create_new_ai_recommendation(recommendation: AIInventoryRecommendationCreate, db: Session = Depends(get_db)):
    """Create a new AI inventory recommendation."""
    return crud_inventory.create_ai_recommendation(db, recommendation)

@router.put("/ai-recommendations/{recommendation_id}", response_model=AIInventoryRecommendation)
async def update_ai_recommendation_decision(
    recommendation_id: int,
    recommendation_update: AIInventoryRecommendationUpdate,
    db: Session = Depends(get_db)
):
    """Update the decision or notes for an AI recommendation."""
    db_rec = crud_inventory.update_ai_recommendation(db, recommendation_id, recommendation_update)
    if db_rec is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")
    return db_rec

@router.delete("/ai-recommendations/{recommendation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ai_recommendation(recommendation_id: int, db: Session = Depends(get_db)):
    """Delete an AI recommendation."""
    db_rec = crud_inventory.delete_ai_recommendation(db, recommendation_id)
    if db_rec is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT) # No content


# --- Actions Endpoints ---
@router.post("/equipment/{equipment_id}/take-from-backup", response_model=Equipment)
async def take_equipment_from_backup(
    equipment_id: int,
    quantity_to_take: int = Query(1, ge=1, description="Quantity to take from backup stock"),
    changed_by: str = Query("Manager", description="Name of the person taking action"),
    db: Session = Depends(get_db)
):
    """
    Take specified quantity of an equipment type from backup stock.
    Updates backup quantity and logs the action.
    """
    try:
        updated_equipment = crud_inventory.take_from_backup_stock(db, equipment_id, quantity_to_take, changed_by)
        if updated_equipment is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found.")
        return updated_equipment
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to take from backup: {e}")

@router.put("/equipment/{equipment_id}/status", response_model=Equipment)
async def update_equipment_status_api(
    equipment_id: int,
    new_status: str = Query(..., description="New status (Baik, Rusak, Dalam Perbaikan, Perlu Diganti)"),
    changed_by: str = Query("Manager", description="Name of the person changing status"),
    change_reason: Optional[str] = Query(None, description="Reason for status change"),
    db: Session = Depends(get_db)
):
    """
    Update the status of an equipment item and log the change.
    This is typically for a specific unit if quantity=1, or overall for types.
    """
    valid_statuses = ['Baik', 'Rusak', 'Dalam Perbaikan', 'Perlu Diganti']
    if new_status not in valid_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    db_equipment = crud_inventory.get_equipment(db, equipment_id)
    if db_equipment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")

    # Call CRUD function to update and log status
    updated_equipment = crud_inventory.update_equipment(
        db, equipment_id, EquipmentUpdate(status=new_status), changed_by=changed_by
    )
    # The log_status_change is already handled inside crud_inventory.update_equipment
    # if status actually changes. Add reason from API.
    if updated_equipment and db_equipment.status != new_status: # Check if status actually changed by update_equipment
        # We need to explicitly pass the reason, as update_equipment only handles basic status change
        # A more robust solution might pass the reason to update_equipment directly.
        # For now, we'll rely on the default reason in log_status_change or update that function.
        pass # Log is handled by update_equipment already


    # Manual logging for more detailed reason, if needed, beyond what update_equipment does
    # This might require modifying crud_inventory.update_equipment to accept 'change_reason'
    # or creating a separate endpoint just for status updates.
    # For simplicity, let's just make sure the reason is passed to log_status_change if possible.
    # If not, the default reason in log_status_change will be used.
    
    return updated_equipment


# --- Basic CRUD Endpoints for management (optional, for a full admin interface) ---

# Equipment Categories
@router.get("/categories", response_model=List[EquipmentCategory])
async def get_all_equipment_categories(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud_inventory.get_equipment_categories(db, skip=skip, limit=limit)

@router.get("/categories/{category_id}", response_model=EquipmentCategory)
async def get_single_equipment_category(category_id: int, db: Session = Depends(get_db)):
    db_cat = crud_inventory.get_equipment_category(db, category_id)
    if db_cat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return db_cat

@router.post("/categories", response_model=EquipmentCategory, status_code=status.HTTP_201_CREATED)
async def create_category(category: EquipmentCategoryCreate, db: Session = Depends(get_db)):
    return crud_inventory.create_equipment_category(db, category)

@router.put("/categories/{category_id}", response_model=EquipmentCategory)
async def update_category(category_id: int, category: EquipmentCategoryUpdate, db: Session = Depends(get_db)):
    db_cat = crud_inventory.update_equipment_category(db, category_id, category)
    if db_cat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return db_cat

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_cat = crud_inventory.delete_equipment_category(db, category_id)
    if db_cat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Suppliers
@router.get("/suppliers", response_model=List[Supplier])
async def get_all_suppliers(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud_inventory.get_suppliers(db, skip=skip, limit=limit)

@router.get("/suppliers/{supplier_id}", response_model=Supplier)
async def get_single_supplier(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = crud_inventory.get_supplier(db, supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    return db_supplier

@router.post("/suppliers", response_model=Supplier, status_code=status.HTTP_201_CREATED)
async def create_supplier_api(supplier: SupplierCreate, db: Session = Depends(get_db)):
    return crud_inventory.create_supplier(db, supplier)

@router.put("/suppliers/{supplier_id}", response_model=Supplier)
async def update_supplier_api(supplier_id: int, supplier: SupplierUpdate, db: Session = Depends(get_db)):
    db_supplier = crud_inventory.update_supplier(db, supplier_id, supplier)
    if db_supplier is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    return db_supplier

@router.delete("/suppliers/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_supplier_api(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = crud_inventory.delete_supplier(db, supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Equipment (Full List & CRUD)
@router.get("/equipment", response_model=List[Equipment])
async def get_all_equipment(
    status: Optional[str] = Query(None), category_id: Optional[int] = Query(None),
    search_query: Optional[str] = Query(None),
    db: Session = Depends(get_db), skip: int = 0, limit: int = 100
):
    return crud_inventory.get_equipment_list(db, status=status, category_id=category_id, search_query=search_query, skip=skip, limit=limit)

@router.get("/equipment/{equipment_id}", response_model=Equipment)
async def get_single_equipment(equipment_id: int, db: Session = Depends(get_db)):
    db_equipment = crud_inventory.get_equipment(db, equipment_id)
    if db_equipment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    return db_equipment

@router.post("/equipment", response_model=Equipment, status_code=status.HTTP_201_CREATED)
async def create_equipment_api(equipment: EquipmentCreate, db: Session = Depends(get_db)):
    return crud_inventory.create_equipment(db, equipment)

@router.put("/equipment/{equipment_id}", response_model=Equipment)
async def update_equipment_data(equipment_id: int, equipment: EquipmentUpdate, db: Session = Depends(get_db)):
    db_equipment = crud_inventory.update_equipment(db, equipment_id, equipment, changed_by="API_Update") # Default changed_by
    if db_equipment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    return db_equipment

@router.delete("/equipment/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment_api(equipment_id: int, db: Session = Depends(get_db)):
    db_equipment = crud_inventory.delete_equipment(db, equipment_id)
    if db_equipment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Backup Equipment
@router.get("/backup-equipment", response_model=List[BackupEquipment])
async def get_all_backup_equipment(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud_inventory.get_backup_equipment_list(db, skip=skip, limit=limit)

@router.get("/backup-equipment/{backup_id}", response_model=BackupEquipment)
async def get_single_backup_equipment(backup_id: int, db: Session = Depends(get_db)):
    db_item = crud_inventory.get_backup_equipment_item(db, backup_id)
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backup item not found")
    return db_item

@router.post("/backup-equipment", response_model=BackupEquipment, status_code=status.HTTP_201_CREATED)
async def create_backup_equipment_api(item: BackupEquipmentCreate, db: Session = Depends(get_db)):
    return crud_inventory.create_backup_equipment_item(db, item)

@router.put("/backup-equipment/{backup_id}", response_model=BackupEquipment)
async def update_backup_equipment_api(backup_id: int, item: BackupEquipmentUpdate, db: Session = Depends(get_db)):
    db_item = crud_inventory.update_backup_equipment_item(db, backup_id, item)
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backup item not found")
    return db_item

@router.delete("/backup-equipment/{backup_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_backup_equipment_api(backup_id: int, db: Session = Depends(get_db)):
    db_item = crud_inventory.delete_backup_equipment_item(db, backup_id)
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backup item not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Equipment Maintenance
@router.get("/maintenance", response_model=List[EquipmentMaintenance])
async def get_all_maintenance_records(
    equipment_id: Optional[int] = Query(None),
    db: Session = Depends(get_db), skip: int = 0, limit: int = 100
):
    return crud_inventory.get_maintenance_history(db, equipment_id=equipment_id, skip=skip, limit=limit)

@router.get("/maintenance/{maintenance_id}", response_model=EquipmentMaintenance)
async def get_single_maintenance_record(maintenance_id: int, db: Session = Depends(get_db)):
    db_rec = crud_inventory.get_maintenance_record(db, maintenance_id)
    if db_rec is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance record not found")
    return db_rec

@router.post("/maintenance", response_model=EquipmentMaintenance, status_code=status.HTTP_201_CREATED)
async def create_maintenance_record_api(record: EquipmentMaintenanceCreate, db: Session = Depends(get_db)):
    return crud_inventory.create_maintenance_record(db, record)

@router.put("/maintenance/{maintenance_id}", response_model=EquipmentMaintenance)
async def update_maintenance_record_api(maintenance_id: int, record: EquipmentMaintenanceUpdate, db: Session = Depends(get_db)):
    db_rec = crud_inventory.update_maintenance_record(db, maintenance_id, record)
    if db_rec is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance record not found")
    return db_rec

@router.delete("/maintenance/{maintenance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_maintenance_record_api(maintenance_id: int, db: Session = Depends(get_db)):
    db_rec = crud_inventory.delete_maintenance_record(db, maintenance_id)
    if db_rec is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance record not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Equipment Usage Log
@router.get("/usage-logs", response_model=List[EquipmentUsageLog])
async def get_all_usage_logs(
    equipment_id: Optional[int] = Query(None),
    db: Session = Depends(get_db), skip: int = 0, limit: int = 100
):
    return crud_inventory.get_equipment_usage_logs(db, equipment_id=equipment_id, skip=skip, limit=limit)

@router.get("/usage-logs/{usage_id}", response_model=EquipmentUsageLog)
async def get_single_usage_log(usage_id: int, db: Session = Depends(get_db)):
    db_log = crud_inventory.get_usage_log(db, usage_id)
    if db_log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usage log not found")
    return db_log

@router.post("/usage-logs", response_model=EquipmentUsageLog, status_code=status.HTTP_201_CREATED)
async def create_usage_log_api(log: EquipmentUsageLogCreate, db: Session = Depends(get_db)):
    return crud_inventory.create_equipment_usage_log(db, log)

@router.put("/usage-logs/{usage_id}", response_model=EquipmentUsageLog)
async def update_usage_log_api(usage_id: int, log: EquipmentUsageLogUpdate, db: Session = Depends(get_db)):
    db_log = crud_inventory.update_equipment_usage_log(db, usage_id, log)
    if db_log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usage log not found")
    return db_log

@router.delete("/usage-logs/{usage_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_usage_log_api(usage_id: int, db: Session = Depends(get_db)):
    db_log = crud_inventory.delete_usage_log(db, usage_id)
    if db_log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usage log not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# Equipment Status Log is mainly for logging by system, not direct CRUD by API, but GETs are useful
@router.get("/status-logs", response_model=List[EquipmentStatusLog])
async def get_all_status_logs(
    equipment_id: Optional[int] = Query(None),
    db: Session = Depends(get_db), skip: int = 0, limit: int = 100
):
    """Retrieve equipment status change logs."""
    return crud_inventory.get_equipment_status_logs(db, equipment_id=equipment_id, skip=skip, limit=limit)

@router.get("/status-logs/{log_id}", response_model=EquipmentStatusLog)
async def get_single_status_log(log_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific equipment status change log."""
    db_log = crud_inventory.get_status_log(db, log_id)
    if db_log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Status log not found")
    return db_log
