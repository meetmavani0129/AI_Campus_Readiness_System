try:
    # When running as a package (python -m backend.app)
    from .database import db
except ImportError:
    # When running directly (python app.py)
    from database import db  # type: ignore


class User(db.Model):
    """Database model representing a student/user in the system."""

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    university = db.Column(db.String(150), nullable=False)
    degree = db.Column(db.String(100), nullable=False)
    year_of_study = db.Column(db.Integer, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='Student')

    # Store aggregated scores metrics to feed into ML model
    cgpa = db.Column(db.Float, nullable=True)
    dsa_score = db.Column(db.Integer, nullable=True)
    dev_score = db.Column(db.Integer, nullable=True)

    # Relationships
    skills = db.relationship('SkillProfile', backref='user', lazy=True)
    assessments = db.relationship('Assessment', backref='user', lazy=True)
    predictions = db.relationship('PredictionResult', backref='user', lazy=True)
    recommendations = db.relationship('Recommendation', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.name}>'

class PredictionResult(db.Model):
    """
    Stores historical prediction results for users.
    """
    __tablename__ = 'predictions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    readiness_score = db.Column(db.Float, nullable=False)
    domain_suggested = db.Column(db.String(100), nullable=False)
    placement_probability = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())


class SkillProfile(db.Model):
    """Stores a student's detailed skill scores."""
    __tablename__ = 'skills'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    python_score = db.Column(db.Integer, nullable=True)
    sql_score = db.Column(db.Integer, nullable=True)
    machine_learning_score = db.Column(db.Integer, nullable=True)
    web_dev_score = db.Column(db.Integer, nullable=True)
    cloud_score = db.Column(db.Integer, nullable=True)
    communication_score = db.Column(db.Integer, nullable=True)
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())


class Assessment(db.Model):
    """Stores assessment results and input features for ML predictions."""
    __tablename__ = 'assessments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    cgpa = db.Column(db.Float, nullable=True)
    programming_score = db.Column(db.Integer, nullable=True)
    technical_score = db.Column(db.Integer, nullable=True)
    aptitude_score = db.Column(db.Integer, nullable=True)
    communication_score = db.Column(db.Integer, nullable=True)
    projects = db.Column(db.Integer, nullable=True)
    internships = db.Column(db.Integer, nullable=True)
    certifications = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())


class Recommendation(db.Model):
    """Stores recommended resources for a student."""
    __tablename__ = 'recommendations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(30), nullable=False)  # e.g., course, internship, roadmap
    title = db.Column(db.String(255), nullable=False)
    platform = db.Column(db.String(120), nullable=True)
    details = db.Column(db.Text, nullable=True)
    url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
