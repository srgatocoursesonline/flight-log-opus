-- Base schema for Flight Log Opus database
-- This file contains the complete schema definition for all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table - stores user profile information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Cmdte. Rodrigo',
  email TEXT,
  avatar_url TEXT,
  total_flights INTEGER DEFAULT 0,
  total_hours NUMERIC(10, 2) DEFAULT 0,
  career_rating INTEGER DEFAULT 0,
  total_rating INTEGER DEFAULT 0,
  career_level INTEGER DEFAULT 1,
  career_class TEXT DEFAULT 'D',
  world_ranking INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Aircraft table - stores user-defined aircraft
CREATE TABLE IF NOT EXISTS custom_aircraft (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  manufacturer TEXT,
  aircraft_type TEXT NOT NULL CHECK (
    aircraft_type IN (
      'commercial', 'business', 'general', 
      'bush', 'aerobatic', 'glider', 
      'helicopter', 'military', 'other'
    )
  ),
  description TEXT,
  hourly_rate NUMERIC(10, 2) DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flight Statuses table - stores possible flight statuses
CREATE TABLE IF NOT EXISTS flight_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  icon TEXT NOT NULL DEFAULT '📅',
  description TEXT,
  hourly_multiplier NUMERIC(3, 2) DEFAULT 1.00,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flights table - stores flight log entries
CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  callsign TEXT NOT NULL,
  aircraft TEXT NOT NULL,
  departure TEXT NOT NULL,
  arrival TEXT NOT NULL,
  departure_time TEXT,
  arrival_time TEXT,
  flight_time TEXT,
  distance INTEGER DEFAULT 0,
  fuel_used NUMERIC(10, 2) DEFAULT 0,
  landing_rate INTEGER DEFAULT 0,
  experience_points INTEGER DEFAULT 0,
  career_rating INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Planejado',
  flight_date TEXT NOT NULL,
  route TEXT,
  notes TEXT,
  is_example BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue Categories table
CREATE TABLE IF NOT EXISTS revenue_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '💰',
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense Categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '💸',
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('revenue', 'expense')),
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category_id UUID,
  transaction_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (
    goal_type IN ('flights', 'hours', 'rating', 'distance', 'custom')
  ),
  target_value NUMERIC(10, 2) NOT NULL,
  current_value NUMERIC(10, 2) DEFAULT 0,
  target_date TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  language TEXT NOT NULL DEFAULT 'pt-BR' CHECK (language IN ('pt-BR', 'en-US')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  auto_sync_enabled BOOLEAN DEFAULT TRUE,
  offline_mode_enabled BOOLEAN DEFAULT FALSE,
  analytics_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create view for flight statistics
CREATE OR REPLACE VIEW flight_statistics AS
SELECT 
  user_id,
  COUNT(*) as total_flights,
  COUNT(*) FILTER (WHERE status = 'Concluído') as completed_flights,
  SUM(career_rating) as total_career_rating,
  SUM(distance) as total_distance,
  CASE 
    WHEN COUNT(*) > 0 THEN SUM(career_rating) / COUNT(*) 
    ELSE 0 
  END as avg_career_rating
FROM flights
GROUP BY user_id;

-- Create view for financial balance
CREATE OR REPLACE VIEW financial_balance AS
SELECT 
  user_id,
  SUM(amount) FILTER (WHERE transaction_type = 'revenue') as total_revenue,
  SUM(amount) FILTER (WHERE transaction_type = 'expense') as total_expenses,
  SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE -amount END) as net_balance
FROM financial_transactions
GROUP BY user_id;

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_custom_aircraft_timestamp
BEFORE UPDATE ON custom_aircraft
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_flight_statuses_timestamp
BEFORE UPDATE ON flight_statuses
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_flights_timestamp
BEFORE UPDATE ON flights
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_revenue_categories_timestamp
BEFORE UPDATE ON revenue_categories
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_expense_categories_timestamp
BEFORE UPDATE ON expense_categories
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_financial_transactions_timestamp
BEFORE UPDATE ON financial_transactions
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_goals_timestamp
BEFORE UPDATE ON goals
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_user_settings_timestamp
BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Set up row-level security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Add similar policies for other tables...

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;