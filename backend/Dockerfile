# Backend Dockerfile (FastAPI)
FROM python:3.11-slim-bookworm

WORKDIR /app

# Install deps
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy app code
COPY app ./app

EXPOSE 8000
# Use Render-provided $PORT if present; default to 8000 locally
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
