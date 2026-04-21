import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
if not db_url:
    print("DATABASE_URL not found")
    exit(1)

engine = create_engine(db_url)
with engine.connect() as conn:
    try:
        result = conn.execute(text('SELECT * FROM conversations ORDER BY timestamp DESC LIMIT 5'))
        rows = [dict(row._mapping) for row in result]
        print(f"Recent Conversations ({len(rows)}):")
        for row in rows:
            print(row)
            
        result_users = conn.execute(text('SELECT * FROM users LIMIT 5'))
        users = [dict(row._mapping) for row in result_users]
        print(f"\nUsers ({len(users)}):")
        for user in users:
            print(user)
    except Exception as e:
        print(f"Error: {e}")
