# backend/app/services/inventory_ai_generator.py

from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy import func


from app.crud import inventory as crud_inventory
from app.crud import finance as crud_finance

from app.services.groq_client import get_groq_client
from app.services.llm import generate_insight_with_retry

from app.schemas.inventory import AIInventoryRecommendationCreate
from app.models.inventory import Equipment, BackupEquipment, EquipmentCategory # NEW: Import EquipmentCategory


async def generate_inventory_insights(
    db: Session,
    equipment_id: Optional[int] = None,
    trigger_event: str = "Routine Check"
) -> AIInventoryRecommendationCreate:
    current_year = datetime.now().year
    current_month = datetime.now().month

    equipment_summary = crud_inventory.get_inventory_summary(db)
    all_equipment = crud_inventory.get_equipment_list(db, limit=1000)

    specific_equipment_info = None
    if equipment_id:
        specific_equipment_info = crud_inventory.get_equipment(db, equipment_id)
    
    financial_summary = crud_finance.get_financial_summary(db, current_year)
    current_profit_margin = financial_summary.get("profit_margin", 0.0)

    equipment_status_overview = {
        "total_equipment": equipment_summary.get("total_equipment"),
        "active": equipment_summary.get("total_active_equipment"),
        "broken": equipment_summary.get("total_broken_equipment"),
        "in_maintenance": equipment_summary.get("total_in_maintenance_equipment"),
        "replacement_needed": equipment_summary.get("total_replacement_needed_equipment"),
        "backup_stock": equipment_summary.get("total_backup_stock"),
        "total_value": equipment_summary.get("total_equipment_value")
    }

    simple_equipment_list = []
    for eq in all_equipment:
        simple_equipment_list.append({
            "id": eq.equipment_id,
            "name": eq.name,
            "category": eq.category.category_name,
            "status": eq.status,
            "quantity": eq.quantity,
            "purchase_price": float(eq.purchase_price) if eq.purchase_price else 0.0,
            "warranty_end": eq.warranty_end.strftime("%Y-%m-%d") if eq.warranty_end else "N/A",
            "location": eq.location,
            "serial_number": eq.serial_number
        })

    suppliers_data = crud_inventory.get_suppliers(db, limit=1000)
    supplier_info_map = {s.supplier_id: s for s in suppliers_data}

    # Fetch all equipment categories for AI to reference
    all_categories = crud_inventory.get_equipment_categories(db)
    category_map = {cat.category_id: cat.category_name for cat in all_categories}

    prompt_messages = [
        {"role": "system", "content": """Anda adalah AI Business Advisor khusus untuk manajemen inventaris gym. Tugas Anda adalah menganalisis data peralatan gym dan data keuangan untuk memberikan rekomendasi yang cerdas tentang pengadaan atau penggantian alat.

Pertimbangkan hal-hal berikut dalam rekomendasi Anda:
- Status peralatan saat ini (rusak, perlu diganti, dalam perbaikan).
- Ketersediaan stok cadangan.
- Margin keuntungan gym bulan ini (sangat penting untuk rekomendasi pembelian).
- Jenis alat (utama/inti vs. pelengkap).
- Harga perkiraan alat dan durasi garansi (jika data tersedia).
- Penggunaan alat dan tren (meskipun data historis tidak selalu tersedia, jika relevan, sebutkan).

Format respons Anda harus selalu dalam bentuk JSON seperti ini. Pastikan semua nilai string adalah teks biasa tanpa pemformatan markdown seperti '**' atau '_':
{
  "recommended_equipment_name": "Nama alat yang direkomendasikan",
  "recommended_category_id": ID_KATEGORI,
  "estimated_cost": HARGA_ESTIMASI,
  "ai_reasoning": "Penjelasan detail mengapa rekomendasi ini diberikan, dengan referensi data yang Anda gunakan.",
  "ai_predicted_purchase_time": "Segera" | "Dalam 1 bulan" | "Dalam 3 bulan" | "Akhir Tahun" | "Tidak Mendesak",
  "contact_supplier_details": "Nama Supplier: [Nama], Kontak: [Nomor Telp/WhatsApp/Email]"
}
Pilih recommended_category_id dari daftar category_id yang ada di equipment_categories yang telah Anda berikan."""}, # ✅ NEW: Tambahkan instruksi format teks biasa
        {"role": "user", "content": f"""Berikut adalah ringkasan inventaris dan keuangan gym Anda:

Inventaris Keseluruhan:
{equipment_status_overview}

Daftar Peralatan:
{simple_equipment_list}

Margin Keuntungan Bulan Ini: {current_profit_margin:.2f}%

Daftar Kategori Alat:
{[{'id': cat.category_id, 'name': cat.category_name} for cat in all_categories]}

Daftar Supplier:
{[{'id': s.supplier_id, 'name': s.supplier_name, 'contact': s.contact_person, 'phone': s.phone, 'whatsapp': s.whatsapp, 'email': s.email} for s in suppliers_data]}

Pemicu Rekomendasi: {trigger_event}
"""}
    ]

    if specific_equipment_info:
        prompt_messages[1]["content"] += f"\n\nInfo Alat yang Memicu Rekomendasi:\n{{" \
            f"'id': {specific_equipment_info.equipment_id}, " \
            f"'name': '{specific_equipment_info.name}', " \
            f"'category': '{specific_equipment_info.category.category_name}', " \
            f"'status': '{specific_equipment_info.status}', " \
            f"'quantity': {specific_equipment_info.quantity}, " \
            f"'purchase_price': {float(specific_equipment_info.purchase_price) if specific_equipment_info.purchase_price else 0.0}, " \
            f"'warranty_end': '{specific_equipment_info.warranty_end.strftime('%Y-%m-%d') if specific_equipment_info.warranty_end else 'N/A'}', " \
            f"'location': '{specific_equipment_info.location}', " \
            f"'serial_number': '{specific_equipment_info.serial_number if specific_equipment_info.serial_number else 'N/A'}'" \
            f"}}"
        
        if specific_equipment_info.status in ['Rusak', 'Perlu Diganti']:
            backup_stock_for_category = db.query(func.sum(BackupEquipment.quantity)).join(Equipment).filter(
                Equipment.category_id == specific_equipment_info.category_id
            ).scalar() or 0
            
            relevant_supplier = next((s for s in suppliers_data if s.supplier_id == specific_equipment_info.supplier_id), None)
            supplier_contact = "Tidak ada info supplier yang terkait langsung."
            if relevant_supplier:
                supplier_contact = f"Nama Supplier: {relevant_supplier.supplier_name}, Kontak: {relevant_supplier.phone or relevant_supplier.whatsapp or relevant_supplier.email}"

            prompt_messages[1]["content"] += f"\n\nSituasi Mendesak: Alat {specific_equipment_info.name} (ID: {specific_equipment_info.equipment_id}) berstatus '{specific_equipment_info.status}'.\n" \
                                            f"Stok cadangan untuk kategori {specific_equipment_info.category.category_name}: {backup_stock_for_category} unit.\n" \
                                            f"Supplier Asli: {supplier_contact}"


    llm_client = get_groq_client()

    try:
        raw_llm_response = await generate_insight_with_retry(llm_client, prompt_messages, max_tokens=1000, temperature=0.7)
        
        import json
        llm_response_json = json.loads(raw_llm_response)

        # Ensure recommended_category_id maps to an actual category name for the AI to display
        # If the AI returns an ID not in your DB, this will default to "N/A"
        # This mapping is primarily for the prompt's context, not for parsing the response
        recommended_category_name_from_id = category_map.get(llm_response_json.get("recommended_category_id"), "Unknown Category")


        ai_recommendation_data = AIInventoryRecommendationCreate(
            recommended_equipment_name=llm_response_json.get("recommended_equipment_name"),
            recommended_category_id=llm_response_json.get("recommended_category_id"),
            estimated_cost=llm_response_json.get("estimated_cost"),
            ai_reasoning=llm_response_json.get("ai_reasoning"),
            ai_predicted_purchase_time=llm_response_json.get("ai_predicted_purchase_time"),
            contact_supplier_details=llm_response_json.get("contact_supplier_details"),
            trigger_equipment_id=equipment_id,
            trigger_event=trigger_event,
            current_profit_margin_percent=current_profit_margin
        )
        return ai_recommendation_data
    except Exception as e:
        print(f"Error generating inventory AI insight: {e}")
        return AIInventoryRecommendationCreate(
            recommended_equipment_name="Default Recommendation (Error)",
            recommended_category_id=1, # Default to Cardio, ensure this ID exists
            estimated_cost=0.0,
            ai_reasoning=f"Failed to generate specific AI recommendation due to: {e}. Consider manual review.",
            ai_predicted_purchase_time="Tidak Mendesak",
            contact_supplier_details="N/A",
            trigger_equipment_id=equipment_id,
            trigger_event=trigger_event,
            current_profit_margin_percent=current_profit_margin
        )