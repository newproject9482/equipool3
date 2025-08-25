#!/bin/bash
# Railway deployment script

echo "Starting deployment..."

# Change to server directory
cd server

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

echo "Deployment complete!"
