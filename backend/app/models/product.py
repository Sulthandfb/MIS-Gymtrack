from sqlalchemy import Column, Integer, String, Numeric, Date, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

# ✅ Import Base dari database.py jika ada, atau buat sendiri
try:
    from app.database import Base
except ImportError:
    Base = declarative_base()

class ProductCategory(Base):
    __tablename__ = "product_category"
    
    category_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(Text)
    color_code = Column(String(7))  # hex color untuk chart
    
    # Relationship
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "product"
    
    product_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    brand = Column(String(50))
    category_id = Column(Integer, ForeignKey("product_category.category_id"))
    price = Column(Numeric(10, 2), nullable=False)
    cost_price = Column(Numeric(10, 2), nullable=False)
    current_stock = Column(Integer, default=0)
    description = Column(Text)
    created_date = Column(Date, default=datetime.utcnow().date())
    status = Column(String(20), default="active")
    
    # Relationships
    category = relationship("ProductCategory", back_populates="products")
    sale_items = relationship("SaleItem", back_populates="product")
    inventory_records = relationship("ProductInventory", back_populates="product")

class Sale(Base):
    __tablename__ = "sale"
    
    sale_id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("member.member_id"))
    sale_date = Column(Date, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(20), default="cash")
    status = Column(String(20), default="completed")
    
    # Relationships
    sale_items = relationship("SaleItem", back_populates="sale")
    # member relationship akan menggunakan existing member table

class SaleItem(Base):
    __tablename__ = "sale_item"
    
    sale_item_id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sale.sale_id"))
    product_id = Column(Integer, ForeignKey("product.product_id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    sale = relationship("Sale", back_populates="sale_items")
    product = relationship("Product", back_populates="sale_items")

class ProductInventory(Base):
    __tablename__ = "product_inventory"
    
    inventory_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.product_id"))
    transaction_type = Column(String(20), nullable=False)  # 'IN', 'OUT', 'ADJUSTMENT'
    quantity = Column(Integer, nullable=False)
    stock_date = Column(Date, nullable=False)
    notes = Column(Text)
    expiry_date = Column(Date)  # untuk suplemen
    
    # Relationships
    product = relationship("Product", back_populates="inventory_records")
