.PHONY: help install backend frontend dev test clean logs stop

help:
	@echo "CVision - Development Commands"
	@echo "==============================="
	@echo ""
	@echo "make backend       - Start backend (Flask)"
	@echo "make frontend      - Start frontend (Vite)"
	@echo "make dev           - Start both backend and frontend"
	@echo "make install       - Install all dependencies"
	@echo "make test          - Run tests"
	@echo "make clean         - Clean up temporary files"
	@echo "make logs          - Show backend logs"
	@echo "make stop          - Stop all services"
	@echo ""

# Backend targets
backend:
	@echo "🚀 Starting backend..."
	cd backend && chmod +x start.sh && ./start.sh

backend-debug:
	@echo "🐛 Starting backend in debug mode..."
	cd backend && source venv/bin/activate && DEBUG=True python3 app.py

backend-install:
	@echo "📦 Installing backend dependencies..."
	cd backend && python3 -m venv venv && \
	source venv/bin/activate && \
	pip install --upgrade pip && \
	pip install -r requirements.txt

# Frontend targets
frontend:
	@echo "🎨 Starting frontend..."
	npm run dev

frontend-install:
	@echo "📦 Installing frontend dependencies..."
	npm install

# Combined targets
install: backend-install frontend-install
	@echo "✅ All dependencies installed!"

dev:
	@echo "🚀 Starting development environment..."
	@echo "Backend on http://localhost:5000"
	@echo "Frontend on http://localhost:8080"
	@echo ""
	@echo "Starting backend..."
	@(cd backend && chmod +x start.sh && ./start.sh) & \
	sleep 3 && \
	npm run dev

# Testing targets
test:
	@echo "🧪 Running tests..."
	cd backend && source venv/bin/activate && pytest

test-backend:
	@echo "🧪 Testing backend..."
	cd backend && source venv/bin/activate && pytest tests/

test-coverage:
	@echo "📊 Running tests with coverage..."
	cd backend && source venv/bin/activate && \
	pytest --cov=functions --cov=lib tests/

# Utility targets
clean:
	@echo "🧹 Cleaning up..."
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name ".DS_Store" -delete
	cd backend && rm -rf venv/
	echo "✅ Cleanup done!"

venv-clean:
	@echo "🗑️  Removing virtual environments..."
	cd backend && rm -rf venv/

logs-backend:
	@echo "📋 Backend logs (Ctrl+C to exit)..."
	@if [ -f .backend.pid ]; then \
		tail -f backend/app.log; \
	else \
		echo "Backend not running"; \
	fi

health:
	@echo "🏥 Health check..."
	@curl -s http://localhost:5000/health | jq . || echo "Backend not running"

# Documentation
docs:
	@echo "📚 Available documentation:"
	@echo ""
	@echo "1. QUICK_START.md          - Get started in 5 minutes"
	@echo "2. BACKEND_ARCHITECTURE.md - Complete architecture guide"
	@echo "3. backend/README.md       - Backend setup guide"
	@echo ""

# Service control
stop:
	@echo "🛑 Stopping services..."
	pkill -f "python3 app.py" || true
	pkill -f "vite" || true
	echo "✅ Services stopped!"

# Port management
port-backend:
	@echo "Checking port 5000..."
	@lsof -i :5000 || echo "Port 5000 is free"

port-frontend:
	@echo "Checking port 8080..."
	@lsof -i :8080 || echo "Port 8080 is free"

# Build for production
build:
	@echo "🔨 Building for production..."
	npm run build
	@echo "✅ Build complete!"

# Docker targets
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t cvision-backend .

docker-run:
	@echo "🐳 Running Docker container..."
	docker run -p 5000:5000 -e GEMINI_API_KEY=$$GEMINI_API_KEY cvision-backend

# API Testing
test-api:
	@echo "🧪 Testing API endpoints..."
	@echo ""
	@echo "1. Health check:"
	@curl -s http://localhost:5000/health | jq .
	@echo ""
	@echo "2. API info:"
	@curl -s http://localhost:5000/ | jq .

# Environment setup
env-setup:
	@echo "⚙️  Setting up environment..."
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "Created backend/.env - Please edit and add GEMINI_API_KEY"; \
	else \
		echo "backend/.env already exists"; \
	fi

# Git helpers
git-status:
	@echo "📊 Git status:"
	@git status --short

git-clean:
	@echo "🧹 Cleaning git..."
	@git clean -fd

# Development helpers
requirements-update:
	@echo "📦 Updating requirements..."
	cd backend && source venv/bin/activate && \
	pip list --outdated && \
	echo "" && \
	echo "Run: pip install --upgrade package_name"

python-version:
	@echo "Python version:"
	@python3 --version
	@echo ""
	@echo "Installed packages in backend/venv:"
	@cd backend && source venv/bin/activate && pip list | head -10

# Reset
reset:
	@echo "⚠️  This will reset your environment!"
	@read -p "Are you sure? (y/n) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		make clean && \
		make backend-install && \
		make frontend-install && \
		echo "✅ Reset complete!"; \
	fi
