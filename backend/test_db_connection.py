from app.database import engine
from sqlalchemy import text

def test_connection():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM MEMBER"))
            rows = result.fetchall()

            print("✅ Data berhasil diambil:")
            for row in rows:
                print(row)
    except Exception as e:
        print("❌ Gagal ambil data:", e)

if __name__ == "__main__":
    test_connection()
