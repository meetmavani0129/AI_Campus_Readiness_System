from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

# Initialize the SQLAlchemy object
db = SQLAlchemy()

def init_db(app):
    """Attach the database to the Flask app and create all tables if they don't already exist."""
    db.init_app(app)
    with app.app_context():
        # Import models so SQLAlchemy knows about them
        try:
            # Package import when running as module
            from . import models  # noqa: F401
        except ImportError:
            # Fallback when running as a script
            import models  # noqa: F401

        # Ensure schema is up to date for core fields (e.g. 'role' added later)
        # Use the SQLAlchemy engine bound to the app via Flask-SQLAlchemy.
        engine = db.engine
        with engine.connect() as conn:
            try:
                result = conn.execute(text("PRAGMA table_info(users);"))
                columns = {row[1] for row in result}
            except Exception:
                columns = set()

        # If the 'users' table exists but is missing the 'role' column, recreate the schema.
        if columns and 'role' not in columns:
            db.drop_all()
            db.create_all()
        else:
            # Create missing tables only (does not alter existing columns)
            db.create_all()
