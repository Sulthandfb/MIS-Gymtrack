from sqlalchemy.orm import Session
from app.models.member import Member
from datetime import datetime
from sqlalchemy import text
from sqlalchemy import func
from app.models.member import Member, MemberGoal
from app.schemas.member import SegmentData, Member as MemberSchema
from sqlalchemy import func, case
from app.models.notification import NotificationLog
from app.models.ab_test import ABTestLog

def get_member_stats(db: Session):
    total = db.query(Member).count()
    active = db.query(Member).filter(Member.status == "Active").count()
    new_members = db.query(Member).filter(Member.join_date >= datetime.now().replace(day=1)).count()
    retention = round((active / total) * 100, 2) if total else 0
    return {
        "total": total,
        "active": active,
        "new_members": new_members,
        "retention": retention,
    }

def get_member_activity(db: Session):
    results = db.execute(text("""
        SELECT TO_CHAR(join_date, 'YYYY-MM') AS month, COUNT(*) AS value
        FROM member
        GROUP BY month
        ORDER BY month
    """)).fetchall()
    return [{"month": row[0], "value": row[1]} for row in results]

# crud/member.py
def get_member_segments(db: Session):
    query = text("""
        SELECT goal_type AS name, COUNT(*) AS value
        FROM member_goal
        GROUP BY goal_type
    """)
    rows = db.execute(query).fetchall()
    result = []
    color_map = {"Weight Loss": "#10b981", "Muscle Gain": "#f59e0b", "Endurance": "#6366f1"}
    for row in rows:
        member_query = db.execute(text("""
            SELECT m.member_id, m.name, m.join_date, m.status
            FROM member m
            JOIN member_goal g ON m.member_id = g.member_id
            WHERE g.goal_type = :goal
        """), {"goal": row[0]}).fetchall()
        members = [{"id": str(m[0]), "name": m[1], "joinDate": str(m[2]), "status": m[3]} for m in member_query]
        result.append({
            "name": row[0],
            "value": row[1],
            "color": color_map.get(row[0], "#8884d8"),
            "members": members
        })
    return result

def get_workout_time(db: Session):
    result = db.execute(text("""
        SELECT TO_CHAR(start_time, 'HH24:00') AS time, COUNT(*) AS members
        FROM workout_session
        GROUP BY time
        ORDER BY time
    """)).fetchall()
    return [{"time": r[0], "members": r[1]} for r in result]

def get_conversion_funnel(db: Session):
    result = [
        {"name": "Workout", "value": 1000, "fill": "#10b981"},
        {"name": "Review", "value": 650, "fill": "#f59e0b"},
        {"name": "Loyal", "value": 420, "fill": "#6366f1"},
    ]
    return result

def get_notification_response(db: Session):
    result = db.execute(text("""
        SELECT type,
               SUM(CASE WHEN responded = true THEN 1 ELSE 0 END) AS responded,
               SUM(CASE WHEN responded = false THEN 1 ELSE 0 END) AS ignored
        FROM notification_log
        GROUP BY type
    """)).fetchall()
    return [
        {"type": row[0], "responded": row[1], "ignored": row[2]}
        for row in result
    ]

def get_ab_test_data(db: Session):
    result = db.execute(text("""
        SELECT variant AS feature,
               SUM(CASE WHEN success = true THEN 1 ELSE 0 END) AS success,
               COUNT(*) AS total
        FROM ab_test_log
        GROUP BY variant
    """)).fetchall()
    return [
        {"feature": row[0], "success": row[1], "total": row[2]}
        for row in result
    ]

