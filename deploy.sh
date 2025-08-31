#!/bin/bash

echo "🚀 Starting full-stack deployment..."

# Build frontend
echo "📦 Building frontend..."
cd client
npm install
npm run build
cd ..

# Build backend
echo "🔧 Building backend..."
cd server
npm install
npm run build
cd ..

# Install root dependencies
echo "📋 Installing root dependencies..."
npm install

echo "✅ Build complete! Ready for deployment."
echo ""
echo "🌐 Deployment Options:"
echo "1. Railway: railway up"
echo "2. Render: Connect GitHub repository"
echo "3. Heroku: git push heroku main"
echo "4. Vercel: vercel --prod"
