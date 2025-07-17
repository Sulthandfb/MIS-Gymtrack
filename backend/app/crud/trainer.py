# backend/app/crud/trainer.py
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.trainer import Trainer
from app.models.member_class import MemberClass
from app.models.class_model import Class
from sqlalchemy import func, case, text, extract, Integer, and_
from app.models.class_schedule import ClassSchedule
# Import modul WorkoutPlan dan WorkoutSession
from app.models.workout_plan import WorkoutPlan
from app.models.workout_session import WorkoutSession
# Import modul alih-alih fungsi langsung
import app.services.trainer_insight_generator as trainer_insights_svc
from datetime import date, timedelta
import random


def get_trainer(db: Session, trainer_id: int):
    return db.query(Trainer).filter(Trainer.trainer_id == trainer_id).first()


def get_trainers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Trainer).offset(skip).limit(limit).all()


async def get_trainer_performance_data(db: Session):
    current_date_sql = func.current_date()

    # Hitung total kelas keseluruhan (mengganti weekly_classes)
    total_classes_overall_query = (
        db.query(func.count(ClassSchedule.schedule_id))
        .scalar()
    )
    total_classes_overall = total_classes_overall_query if total_classes_overall_query is not None else 0

    # Hitung total trainer keseluruhan (mengganti active_trainers)
    total_trainers_overall_query = (
        db.query(func.count(Trainer.trainer_id))
        .scalar()
    )
    total_trainers_overall = total_trainers_overall_query if total_trainers_overall_query is not None else 0

    # Subquery: rata-rata feedback tiap trainer
    avg_satisfaction_per_trainer = (
        db.query(
            Trainer.trainer_id, # Ambil trainer_id dari Trainer
            func.avg(MemberClass.rating).label("avg_satisfaction") # Menggunakan MemberClass.rating
        )
        .join(ClassSchedule, ClassSchedule.schedule_id == MemberClass.schedule_id) # Join MemberClass ke ClassSchedule
        .join(Trainer, Trainer.trainer_id == ClassSchedule.trainer_id) # Join ClassSchedule ke Trainer
        .filter(MemberClass.rating.isnot(None)) # Menggunakan MemberClass.rating
        .group_by(Trainer.trainer_id) # Grouping berdasarkan Trainer.trainer_id
        .subquery()
    )

    # Jumlah trainer aktif (yang mengajar minimal 1 kelas minggu ini)
    # Anda mungkin ingin menyimpan ini jika "active_trainers" masih relevan di bagian lain,
    # atau menghapusnya jika hanya total keseluruhan yang dibutuhkan.
    # Untuk tujuan demo, saya pertahankan tetapi nilainya tidak lagi dikembalikan ke frontend di 'stats'.
    active_trainer_count_query = (
        db.query(func.count(func.distinct(ClassSchedule.trainer_id))).filter(
            extract("week", ClassSchedule.schedule_date) == extract("week", func.current_date()),
            extract("year", ClassSchedule.schedule_date) == extract("year", func.current_date())
        ).scalar()
    )

    active_trainer_count_query = active_trainer_count_query if active_trainer_count_query is not None else 0


    # Distribusi tipe kelas
    class_type_data = []
    class_type_query = (
        db.query(Class.name.label('class_type'), func.count(MemberClass.class_id).label("count"))
        .join(MemberClass, Class.class_id == MemberClass.class_id)
        .group_by(Class.name)
        .all()
    )
    total_class_participants = sum([row.count for row in class_type_query]) or 1
    for row in class_type_query:
        # PERBAIKAN DI SINI: Gunakan logika pencocokan string untuk warna
        detected_color = "#cccccc" # Default grey jika tidak ada yang cocok
        lower_class_name = row.class_type.lower()
        
        if "strength" in lower_class_name:
            detected_color = "#10b981"
        elif "yoga" in lower_class_name:
            detected_color = "#f59e0b"
        elif "cardio" in lower_class_name:
            detected_color = "#3b82f6"
        elif "pilates" in lower_class_name:
            detected_color = "#8b5cf6"
        # Anda bisa menambahkan kondisi lain untuk tipe kelas spesifik seperti "HIIT", "Functional", "CrossFit", "Recovery"
        # yang ada di fungsi getTypeColor di frontend, jika nama kelas Anda di DB mengandung kata-kata ini.
        elif "hiit" in lower_class_name:
            detected_color = "#ef4444" # Contoh warna untuk HIIT
        elif "functional" in lower_class_name:
            detected_color = "#a855f7" # Contoh warna untuk Functional
        elif "crossfit" in lower_class_name:
            detected_color = "#f97316" # Contoh warna untuk CrossFit
        elif "recovery" in lower_class_name:
            detected_color = "#6b7280" # Contoh warna untuk Recovery

        class_type_data.append({
            "name": row.class_type,
            "value": round((row.count / total_class_participants) * 100, 2) if total_class_participants > 0 else 0,
            "color": detected_color # Gunakan warna yang terdeteksi
        })

    # Data kinerja trainer (gabungan)
    performance_results = (
        db.query(
            Trainer.trainer_id,
            Trainer.name,
            Trainer.specialization,
            Trainer.join_date,
            func.count(ClassSchedule.schedule_id).label("total_classes_taught"),
            func.avg(MemberClass.rating).label("avg_feedback_rating"),
            func.extract('year', func.age(current_date_sql, Trainer.join_date)).label('experience_years_sql')
        )
        .outerjoin(ClassSchedule, ClassSchedule.trainer_id == Trainer.trainer_id)
        .outerjoin(MemberClass, MemberClass.schedule_id == ClassSchedule.schedule_id)
        .group_by(Trainer.trainer_id, Trainer.name, Trainer.specialization, Trainer.join_date)
        .all()
    )

    performance_data = []
    for p in performance_results:
        active_members_count = (
            db.query(func.count(func.distinct(MemberClass.member_id)))
            .join(ClassSchedule, ClassSchedule.schedule_id == MemberClass.schedule_id)
            .filter(ClassSchedule.trainer_id == p.trainer_id)
            .scalar() or 0
        )
        
        retention_rate = float(p.avg_feedback_rating) * 100 / 5 if p.avg_feedback_rating else 0.0
        experience_years = int(p.experience_years_sql) if p.experience_years_sql is not None else 0

        status = "excellent"
        if p.avg_feedback_rating and float(p.avg_feedback_rating) < 4.5:
            status = "good"
        if p.avg_feedback_rating and float(p.avg_feedback_rating) < 4.0:
            status = "warning"

        performance_data.append({
            "id": p.trainer_id,
            "name": p.name,
            "specialization": p.specialization,
            "classes": p.total_classes_taught,
            "feedback": round(float(p.avg_feedback_rating), 2) if p.avg_feedback_rating else 0.0,
            "retention": round(retention_rate, 2),
            "activeMembers": active_members_count,
            "status": status,
            "experience": f"{experience_years} years"
        })

    # Data untuk grafik partisipasi kelas (Bar Chart)
    class_participants_per_trainer_query_result = (
        db.query(
            Trainer.name.label('trainer_name'),
            func.count(case((Class.name.like('%Strength%'), MemberClass.member_id), else_=None)).label('strength_participants'),
            func.count(case((Class.name.like('%Yoga%'), MemberClass.member_id), else_=None)).label('yoga_participants'),
            func.count(case((Class.name.like('%Cardio%'), MemberClass.member_id), else_=None)).label('cardio_participants'),
            func.count(case((Class.name.like('%Pilates%'), MemberClass.member_id), else_=None)).label('pilates_participants')
        )
        .outerjoin(Class, Trainer.trainer_id == Class.trainer_id)
        .outerjoin(MemberClass, Class.class_id == MemberClass.class_id)
        .group_by(Trainer.trainer_id, Trainer.name)
        .all()
    )

    class_participants_data = []
    for r in class_participants_per_trainer_query_result:
        class_participants_data.append({
            "trainer": r.trainer_name,
            "strength": r.strength_participants,
            "yoga": r.yoga_participants,
            "cardio": r.cardio_participants,
            "pilates": r.pilates_participants
        })
    
    # Trend Kepuasan User per Trainer (Line Chart) - SEKARANG MENGAMBIL DARI DATABASE
    # Kita akan mengambil rata-rata rating per trainer per minggu
    # Ambil data rating dan tanggal kehadiran dari MemberClass
    satisfaction_trend_query_results = (
        db.query(
            Trainer.name.label('trainer_name'),
            extract("week", MemberClass.attendance_date).label('week_num'), # Minggu ke berapa dalam setahun
            extract("year", MemberClass.attendance_date).label('year_num'), # Tahun
            func.avg(MemberClass.rating).label('avg_rating')
        )
        .join(ClassSchedule, ClassSchedule.schedule_id == MemberClass.schedule_id)
        .join(Trainer, Trainer.trainer_id == ClassSchedule.trainer_id)
        .filter(
            MemberClass.rating.isnot(None),
            MemberClass.attendance_date.isnot(None), # Pastikan ada tanggal kehadiran
            MemberClass.attendance_date >= (func.current_date() - text('INTERVAL \'8 weeks\'')) # Ambil data 8 minggu terakhir
        )
        .group_by(Trainer.name, 'week_num', 'year_num')
        .order_by('year_num', 'week_num')
        .all()
    )

    # Transformasi data ke format yang diharapkan frontend
    satisfaction_trend_data = []
    # Dapatkan semua trainer untuk nama kolom dinamis
    all_trainer_names_for_trend = [p['name'].split(' ')[0].lower() for p in performance_data]

    # Buat kerangka untuk 8 minggu terakhir
    today = date.today()
    weeks_to_show = []
    for i in range(8): # Misal 8 minggu terakhir
        past_date = today - timedelta(weeks=i)
        week_label = f"W{past_date.isocalendar()[1]}" # Mengambil nomor minggu ISO
        weeks_to_show.append((past_date.isocalendar()[1], past_date.year, week_label)) # (week_num, year_num, label)
    weeks_to_show.reverse() # Urutkan dari yang paling lama ke paling baru

    for week_num, year_num, week_label in weeks_to_show:
        week_data = {"week": week_label}
        for trainer_name_chart in all_trainer_names_for_trend:
            trainer_found_in_week = False
            for row in satisfaction_trend_query_results:
                if row.trainer_name.split(' ')[0].lower() == trainer_name_chart and row.week_num == week_num and row.year_num == year_num:
                    week_data[trainer_name_chart] = round(float(row.avg_rating), 2)
                    trainer_found_in_week = True
                    break
            if not trainer_found_in_week:
                week_data[trainer_name_chart] = None # Atau 0.0 atau nilai default jika tidak ada data untuk minggu itu
        satisfaction_trend_data.append(week_data)


    # Evaluasi Per Kursus (Course Comparison) - data dari DB
    offline_activity_query = (
        db.query(
            Class.name.label('class_name_type'), # Gunakan nama kelas sebagai tipe
            func.count(func.distinct(MemberClass.member_id)).label('total_activity') # Hitung member unik
        )
        .join(MemberClass, MemberClass.class_id == Class.class_id)
        .filter(Class.name.in_(['Strength Basic Flow', 'Strength Hypertrophy', 'Yoga Basic Flow', 'Yoga Power Vinyasa', 'Cardio Endurance', 'Cardio HIIT Blast', 'Pilates Matwork', 'Pilates Reformer'])) # Filter kelas offline Anda
        .group_by(Class.name)
        .all()
    )

    online_activity_query = (
        db.query(
            WorkoutPlan.goal.label('workout_goal_type'), # Gunakan goal sebagai tipe kursus online
            func.count(func.distinct(WorkoutSession.session_id)).label('total_activity') # Hitung sesi unik
        )
        .join(WorkoutSession, WorkoutSession.plan_id == WorkoutPlan.plan_id)
        .group_by(WorkoutPlan.goal)
        .all()
    )

    course_comparison_data = []
    course_types = ["Strength", "Yoga", "Cardio", "Pilates"]
    
    offline_mapped_activity = {t: 0 for t in course_types}
    for row in offline_activity_query:
        if "Strength" in row.class_name_type: offline_mapped_activity["Strength"] += row.total_activity
        elif "Yoga" in row.class_name_type: offline_mapped_activity["Yoga"] += row.total_activity
        elif "Cardio" in row.class_name_type: offline_mapped_activity["Cardio"] += row.total_activity
        elif "Pilates" in row.class_name_type: offline_mapped_activity["Pilates"] += row.total_activity
    
    online_mapped_activity = {t: 0 for t in course_types}
    for row in online_activity_query:
        if "strength" in row.workout_goal_type.lower(): online_mapped_activity["Strength"] += row.total_activity
        elif "yoga" in row.workout_goal_type.lower(): online_mapped_activity["Yoga"] += row.total_activity
        elif "cardio" in row.workout_goal_type.lower(): online_mapped_activity["Cardio"] += row.total_activity
        elif "pilates" in row.workout_goal_type.lower(): online_mapped_activity["Pilates"] += row.total_activity
            
    for c_type in course_types:
        course_comparison_data.append({
            "type": c_type,
            "offline": offline_mapped_activity[c_type],
            "online": online_mapped_activity[c_type]
        })


    # Kirim ke Groq LLM
    ai_generated_output = await trainer_insights_svc.generate_trainer_insights_and_alerts(
        performance_data,
        class_type_data
    )

    # Return response lengkap ke frontend
    return {
        "stats": {
            "total_classes_overall": total_classes_overall, # Menggunakan nilai total yang baru
            "total_trainers_overall": total_trainers_overall, # Menggunakan nilai total yang baru
            "high_engagement_classes": sum(1 for t in performance_data if t["feedback"] >= 4.5),
            "avg_satisfaction": round(db.query(func.avg(avg_satisfaction_per_trainer.c.avg_satisfaction)).scalar() or 0.0, 2)
        },
        "classParticipantsData": class_participants_data,
        "satisfactionTrendData": satisfaction_trend_data,
        "classTypeData": class_type_data, # Menggunakan class_type_data yang sudah diperbaiki warnanya
        "courseComparisonData": course_comparison_data,
        "trainerPerformanceData": performance_data,
        "insights": ai_generated_output["insights"],
        "alerts": ai_generated_output["alerts"]
    }

async def get_trainer_activity_data(db: Session, trainer_id: int, days: int = 30) -> List[Dict[str, Any]]:
    end_date = date.today()
    start_date = end_date - timedelta(days=days-1) # Default 30 hari, bisa disesuaikan

    # Gunakan attendance_date dari MemberClass karena itu adalah tanggal aktual kehadiran
    activity_query = (
        db.query(
            MemberClass.attendance_date.label('date'),
            func.count(MemberClass.member_id).label('kehadiran'), # Total member hadir
            func.avg(MemberClass.rating).label('kepuasan') # Rata-rata kepuasan
        )
        .join(ClassSchedule, MemberClass.schedule_id == ClassSchedule.schedule_id)
        .filter(
            ClassSchedule.trainer_id == trainer_id,
            MemberClass.attendance_date.between(start_date, end_date),
            MemberClass.attendance_status == 'Present', # Hanya hitung yang hadir
            MemberClass.attendance_date.isnot(None) # Pastikan attendance_date tidak null
        )
        .group_by(MemberClass.attendance_date)
        .order_by(MemberClass.attendance_date)
        .all()
    )

    activity_data = []
    current_day = start_date
    while current_day <= end_date:
        row_for_day = next((row for row in activity_query if row.date == current_day), None)
        
        kehadiran = row_for_day.kehadiran if row_for_day else 0
        kepuasan = round(float(row_for_day.kepuasan), 2) if row_for_day and row_for_day.kepuasan else 0.0
        
        engagement = round(kehadiran * kepuasan / 5 / 5, 2) * 100 # Skala 0-100, contoh sederhana

        activity_data.append({
            "date": current_day.strftime("%#d %b") if current_day.day < 20 else current_day.strftime("%d %b"),
            "kehadiran": kehadiran,
            "kepuasan": kepuasan,
            "engagement": engagement
        })
        current_day += timedelta(days=1)

    return activity_data

async def get_trainer_schedule_data(db: Session, trainer_id: int) -> Dict[str, List[Dict[str, Any]]]:
    day_name_map = {
    0: "Senin", 1: "Selasa", 2: "Rabu", 3: "Kamis",
    4: "Jumat", 5: "Sabtu", 6: "Minggu"
    }

    schedule_query = (
        db.query(
            ClassSchedule.schedule_id,
            Class.name.label('class_name'),
            ClassSchedule.start_time,
            ClassSchedule.end_time,
            Class.location, # PERBAIKAN: Ambil lokasi dari Class, bukan ClassSchedule
            Class.max_capacity, # Jika ada di tabel Class, tambahkan di model Class
            Class.name.label('class_type_name'), # Untuk 'type' di frontend
            ClassSchedule.schedule_date
        )
        .join(Class, Class.class_id == ClassSchedule.class_id)
        .filter(ClassSchedule.trainer_id == trainer_id)
        .order_by(ClassSchedule.schedule_date, ClassSchedule.start_time)
        .all()
    )

    schedule_by_day = {day: [] for day in day_name_map.values()}

    for item in schedule_query:
        day_of_week_num = item.schedule_date.weekday() # 0=Senin, 6=Minggu
        day_name = day_name_map.get(day_of_week_num, "Unknown")

        participants_count = db.query(func.count(MemberClass.member_id)) \
                            .filter(MemberClass.schedule_id == item.schedule_id,
                                    MemberClass.attendance_status == 'Present') \
                            .scalar() or 0
        
        max_capacity = item.max_capacity if hasattr(item, 'max_capacity') and item.max_capacity is not None else 20
        available_slots = max_capacity - participants_count
        
        class_item_data = {
            "id": item.schedule_id,
            "name": item.class_name,
            "time": f"{item.start_time.strftime('%H:%M')} - {item.end_time.strftime('%H:%M')}",
            "duration": f"{(item.end_time.hour - item.start_time.hour) * 60 + (item.end_time.minute - item.start_time.minute)} min",
            "location": item.location,
            "participants": f"{participants_count}/{max_capacity}",
            "available": available_slots,
            "type": item.class_type_name,
            "day_of_week": day_name
        }
        schedule_by_day[day_name].append(class_item_data)

    return schedule_by_day