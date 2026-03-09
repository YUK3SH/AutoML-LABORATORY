# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies (Java is required for H2O)
RUN apt-get update && apt-get install -y \
    default-jre-headless \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Create necessary directories and set permissions for Hugging Face
RUN mkdir -p uploads results/confusion_matrices models && \
    chmod -R 777 /app

# Set environment variables
ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

# Run the application with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "120", "app:app"]
