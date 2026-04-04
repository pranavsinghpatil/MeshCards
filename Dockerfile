# Use official lightweight Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENV=production \
    PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies for PIL/Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies from root
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install slowapi uvicorn gunicorn pillow

# Copy the entire backend folder into a 'backend' directory inside /app
# This ensures that "from backend.core..." imports work correctly
COPY backend/ ./backend/

# Create decks directory
RUN mkdir -p backend/decks

# Expose port
EXPOSE 8000

# Run the application using the correct module path
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
