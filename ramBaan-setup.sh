
#!/bin/bash

# Rambaan ALL-IN-ONE SETUP: Database, Backend, Frontend

set -e

echo "🚀 Rambaan setup: starting..."

# 1. Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# 2. (Optional) Load database schema with Postgres or MySQL
echo "🗄️ Setting up database (Postgres or MySQL recommended)..."
# Example for Postgres:
if [ -f scripts/init-database.sql ]; then
  psql --username="$DB_USER" --dbname="$DB_NAME" -f scripts/init-database.sql || echo "❗️Skip if Postgres not available"
fi
# Example for MySQL (adjust for your schema file):
if [ -f scripts/init-database-mysql.sql ]; then
  mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < scripts/init-database-mysql.sql || echo "❗️Skip if MySQL not available"
fi

cd ..

# 3. Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

cd ..

# 4. Build backend
echo "🔧 Building backend..."
cd backend
npm run build || echo "ℹ️  Skipping build if not needed"

cd ..

# 5. Build frontend
echo "🔧 Building frontend..."
cd frontend
npm run build

cd ..

# 6. Run backend server
echo "▶️ Starting backend server..."
cd backend
npm run dev &

cd ..

# 7. Run frontend dev server
echo "▶️ Starting frontend dev server..."
cd frontend
npm run dev &

echo "✨ Rambaan setup complete! Both backend and frontend servers are running."
echo "Open http://localhost:5173 (or other port) to access the app."
