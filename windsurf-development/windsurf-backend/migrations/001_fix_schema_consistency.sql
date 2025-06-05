
-- Add missing fields to issues table
ALTER TABLE issues ADD COLUMN IF NOT EXISTS last_status_change_at TIMESTAMP DEFAULT NOW();
ALTER TABLE issues ADD COLUMN IF NOT EXISTS reopenable_until TIMESTAMP;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS previously_closed_at JSONB DEFAULT '[]'::JSONB;

-- Add missing fields to dashboard_users table to match employees table
ALTER TABLE dashboard_users ADD COLUMN IF NOT EXISTS date_of_joining DATE;
ALTER TABLE dashboard_users ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE dashboard_users ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE dashboard_users ADD COLUMN IF NOT EXISTS ifsc_code TEXT;
ALTER TABLE dashboard_users ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Create employee_auth_credentials table for mobile login (email + employee_id)
CREATE TABLE IF NOT EXISTS employee_auth_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  employee_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES dashboard_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
