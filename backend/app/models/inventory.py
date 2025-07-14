# backend/app/models/inventory.py

from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, DECIMAL, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class EquipmentCategory(Base):
    __tablename__ = "equipment_categories"
    category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    equipment = relationship("Equipment", back_populates="category")

class Supplier(Base):
    __tablename__ = "suppliers"
    supplier_id = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String(200), nullable=False)
    contact_person = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    whatsapp = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    equipment = relationship("Equipment", back_populates="supplier")

class Equipment(Base):
    __tablename__ = "equipment"
    equipment_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey("equipment_categories.category_id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.supplier_id"))
    purchase_date = Column(Date, nullable=True)
    purchase_price = Column(DECIMAL(15, 2), nullable=True)
    status = Column(String(50), default="Baik")
    quantity = Column(Integer, default=1)
    last_maintenance = Column(Date, nullable=True)
    next_maintenance = Column(Date, nullable=True)
    warranty_end = Column(Date, nullable=True)
    location = Column(String(100), nullable=True)
    serial_number = Column(String(100), nullable=True) # Not unique per your current dummy data with quantity > 1
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    category = relationship("EquipmentCategory", back_populates="equipment")
    supplier = relationship("Supplier", back_populates="equipment")
    backup_equipment = relationship("BackupEquipment", back_populates="equipment_rel")
    maintenance_history = relationship("EquipmentMaintenance", back_populates="equipment_rel")
    status_logs = relationship("EquipmentStatusLog", back_populates="equipment_rel")
    usage_logs = relationship("EquipmentUsageLog", back_populates="equipment_rel")
    ai_recommendations = relationship("AIInventoryRecommendation", back_populates="trigger_equipment_rel")


class BackupEquipment(Base):
    __tablename__ = "backup_equipment"
    backup_id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.equipment_id"))
    quantity = Column(Integer, default=0)
    condition = Column(String(50), default="Baik")
    location = Column(String(100), default="Gudang Utama")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    equipment_rel = relationship("Equipment", back_populates="backup_equipment")

class EquipmentMaintenance(Base):
    __tablename__ = "equipment_maintenance"
    maintenance_id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.equipment_id"))
    maintenance_date = Column(Date, nullable=False)
    maintenance_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    cost = Column(DECIMAL(15, 2), default=0)
    technician_name = Column(String(100), nullable=True)
    next_maintenance_date = Column(Date, nullable=True)
    status = Column(String(50), default="Completed")
    created_at = Column(DateTime, default=datetime.now)

    equipment_rel = relationship("Equipment", back_populates="maintenance_history")

class EquipmentStatusLog(Base):
    __tablename__ = "equipment_status_log"
    log_id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.equipment_id"))
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    changed_by = Column(String(100), nullable=True)
    change_reason = Column(Text, nullable=True)
    change_date = Column(DateTime, default=datetime.now)

    equipment_rel = relationship("Equipment", back_populates="status_logs")

class EquipmentUsageLog(Base):
    __tablename__ = "equipment_usage_log"
    usage_id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.equipment_id"))
    usage_date = Column(Date, nullable=False)
    usage_count = Column(Integer, default=1)
    peak_hours = Column(Integer, default=0)
    maintenance_needed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    equipment_rel = relationship("Equipment", back_populates="usage_logs")

class AIInventoryRecommendation(Base):
    __tablename__ = "ai_inventory_recommendation"
    recommendation_id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.now)
    trigger_equipment_id = Column(Integer, ForeignKey("equipment.equipment_id"), nullable=True)
    trigger_event = Column(String(255), nullable=False)
    recommended_equipment_name = Column(String(200), nullable=False)
    recommended_category_id = Column(Integer, ForeignKey("equipment_categories.category_id"))
    estimated_cost = Column(DECIMAL(15, 2), nullable=True)
    current_profit_margin_percent = Column(DECIMAL(5, 2), nullable=True)
    ai_reasoning = Column(Text, nullable=True)
    ai_predicted_purchase_time = Column(String(100), nullable=True)
    manager_decision = Column(String(50), default="Pending")
    decision_date = Column(DateTime, nullable=True)
    notes_manager = Column(Text, nullable=True)
    contact_supplier_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    trigger_equipment_rel = relationship("Equipment", back_populates="ai_recommendations")
    recommended_category_rel = relationship("EquipmentCategory") # No back_populates needed here if not used on other side