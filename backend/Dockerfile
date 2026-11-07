# Backend Dockerfile

FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy backend code
COPY backend/ ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 5000

# Default command
CMD ["python", "app.py"]
