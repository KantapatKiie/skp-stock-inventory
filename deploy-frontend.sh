#!/bin/bash

echo "🚀 Deploying Frontend..."
echo "================================"

# Build and start frontend container
echo "📦 Building frontend Docker image..."
docker-compose build frontend

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
    
    echo "🔄 Starting frontend container..."
    docker-compose up -d frontend
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend container started successfully!"
        echo ""
        echo "📊 Container Status:"
        docker ps --filter "name=skp-frontend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        echo "🌐 Frontend is running at:"
        echo "   http://localhost:3000"
        echo ""
        echo "📝 View logs: docker-compose logs -f frontend"
    else
        echo "❌ Failed to start frontend container"
        exit 1
    fi
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo "================================"
echo "✨ Frontend deployment completed!"
