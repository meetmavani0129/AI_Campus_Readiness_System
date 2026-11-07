from flask import Flask
from flask_cors import CORS

# Allow running as a module (python -m backend.app) or as a script (python app.py)
try:
    from .database import init_db
    from .routes import api_bp
except ImportError:
    from database import init_db  # type: ignore
    from routes import api_bp  # type: ignore

import os


def create_app() -> Flask:
    """Factory to create and configure the Flask app."""
    app = Flask(__name__)

    # Database configuration: default to SQLite for local runs.
    # For production, set DATABASE_URL to a MySQL/Postgres URI.
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///campus_readiness.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "super-secret-key")

    CORS(app)

    # Initialize DB and register routes
    init_db(app)
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route('/')
    def index():
        return {"status": "online", "message": "AI Campus Readiness API is running. Access endpoints via /api."}

    return app


app = create_app()


if __name__ == "__main__":
    app.run(port=5000, debug=True)
