#!/bin/bash
set -e

echo ">>> Creating network"
docker network create quran_academy_net 2>/dev/null || true

echo ">>> Starting PostgreSQL"
cd "$(dirname "$0")"
docker compose up -d postgres redis minio

echo ">>> Waiting for PostgreSQL..."
until docker exec quran_academy_postgres pg_isready -U quran_admin > /dev/null 2>&1; do
  sleep 2
done
echo ">>> PostgreSQL is ready"

echo ">>> Creating tenant schemas..."
docker exec -i quran_academy_postgres psql -U quran_admin -d quran_academy << 'EOF'
-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organization table (shared, not per-tenant)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  schema_name VARCHAR(100) NOT NULL,
  settings JSONB DEFAULT '{}',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create a trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_organizations_updated
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EOF

echo ">>> Setup complete"