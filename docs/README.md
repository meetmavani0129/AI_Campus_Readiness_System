# AI Campus Readiness System

This repository contains a **full-stack AI-powered placement readiness platform**.

## Structure

- `frontend/`: React dashboard application (Tailwind CSS + Chart.js)
- `backend/`: Python Flask REST API server
- `ml_models/`: ML training & inference modules + pre-baked models
- `dataset/`: Training data used for model creation
- `features/`: Advanced AI modules (resume analyzer, chatbot)
- `services/`: Recommendation engines and AI orchestration
- `reports/`: Analytics/report generation utilities

## Key Features

- Predicts **placement readiness score**, **career domain**, and **placement probability** using ML models.
- Provides **skill gap analysis** and **recommended courses**.
- Includes a **resume analyzer** (NLP) and **career chatbot** for guidance.
- Fully functional REST API that supports authentication, student profiles, assessments, and recommendations.

## Running Locally

1. **Backend**

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

2. **Frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend will proxy `/api` requests to the backend on port `5000`.

## Useful Scripts

- Generate training datasets: `python -m ml_models.generate_data`
- Train readiness model: `python -m ml_models.train_model`
- Train domain model: `python -m ml_models.train_domain_model`
- Train placement model: `python -m ml_models.train_placement_model`

---

Please refer to `docs/DEPLOYMENT.md` for Docker-based deployment instructions.
