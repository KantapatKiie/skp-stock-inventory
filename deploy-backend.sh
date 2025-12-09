#!/bin/bash

echo "🚀 Deploying Backend..."
echo "================================"

# Build and start backend container
echo "📦 Building backend Docker image..."
docker-compose build backend

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful!"
    
    echo "🔄 Starting backend container..."
    docker-compose up -d backend
    
    if [ $? -eq 0 ]; then
        echo "✅ Backend container started successfully!"
        echo ""
        echo "⏳ Waiting for backend to be ready..."
        sleep 5
        
        echo ""
        echo "📊 Container Status:"
        docker ps --filter "name=skp-backend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        echo "🌐 Backend is running at:"
        echo "   http://localhost:3001"
        echo "   API: http://localhost:3001/api"
        echo ""
        echo "🏥 Health Check:"
        HEALTH=$(curl -s http://localhost:3001/api/test/health 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo "   ✅ Backend is healthy!"
            echo "   Response: $HEALTH"
        else
            echo "   ⚠️  Backend is starting... (may take a few seconds)"
        fi
        echo ""
        echo "📝 View logs: docker-compose logs -f backend"
    else
        echo "❌ Failed to start backend container"
        exit 1
    fi
else
    echo "❌ Backend build failed"
    exit 1
fi

echo "================================"
echo "✨ Backend deployment completed!"
