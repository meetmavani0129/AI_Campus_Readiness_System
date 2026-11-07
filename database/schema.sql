-- Raw SQL schema fallback (although SQLAlchemy handles this generally)
-- Useful for database documentation or manual migrations.

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cgpa FLOAT,
    dsa_score INTEGER,
    dev_score INTEGER
);

CREATE TABLE predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    readiness_score FLOAT NOT NULL,
    domain_suggested VARCHAR(100) NOT NULL,
    placement_probability FLOAT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
