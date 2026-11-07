from app import create_app
from database import db

# Create the application context
app = create_app()

with app.app_context():
    try:
        # This will create tables for imported models in db if they don't exist
        db.create_all()
        print("Successfully connected to MySQL and initialized all database tables.")
    except Exception as e:
        print(f"Failed to initialize database. Error: {e}")
        print("\nPlease ensure that:")
        print("1. Your MySQL server is running locally.")
        print("2. A database named 'ai_campus_readiness' has been created.")
        print("   (You can create it via MySQL terminal: CREATE DATABASE ai_campus_readiness;)")
