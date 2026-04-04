# Use official lightweight Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENV=production \
    PYTHONPATH=/app

# Set work directory to /app
WORKDIR /app

# Install system dependencies for PIL/Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Assuming context is set to the backend folder in Render
# Copy requirements first for caching
# We use conditional copy to handle both context=root and context=backend cases
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install slowapi uvicorn gunicorn pillow

# Copy the actual code. 
# If context is backend/, COPY . . will copy main.py, core/, etc. to /app/
# We want these to be inside a folder named 'backend' to preserve package status
COPY . ./backend/

# Create decks directory
RUN mkdir -p backend/decks

# Expose port
EXPOSE 8000

# Start with the correct standard package path
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
