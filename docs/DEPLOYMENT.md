# Deployment Guide

This guide explains how to run the AI Campus Readiness System locally and using Docker.

---

## Local Development (Recommended)

### Backend

1. Create and activate a virtual environment:

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start the Flask server:

```bash
python app.py
```

The backend will run on `http://localhost:5000`.

### Frontend

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Run the Vite development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` and proxy API calls to the backend.

---

## Docker Deployment

### Build and Run with Docker Compose

A `docker-compose.yml` is provided to run the frontend and backend together.

```bash
# From the project root
docker compose up --build
```

The application will be available at `http://localhost:5173`.

### Notes

- The backend uses a SQLite database by default (`campus_readiness.db`).
- To connect to a managed database (MySQL/PostgreSQL), set `DATABASE_URL` in the environment.

---

## Building ML Models

To re-generate training datasets and retrain models, run:

```bash
# Generate datasets
python -m ml_models.generate_data
python -m ml_models.generate_domain_data
python -m ml_models.generate_placement_data

# Train models
python -m ml_models.train_model
python -m ml_models.train_domain_model
python -m ml_models.train_placement_model
```

The trained models will be saved inside `ml_models/` as `.pkl` files.
