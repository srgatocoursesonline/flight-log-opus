-- ============================================
-- CREATE BASE TABLES FOR FLIGHT LOG SYSTEM
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FLIGHTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    flight_number TEXT,
    departure_time TIMESTAMPTZ,
    arrival_time TIMESTAMPTZ,
    departure_airport TEXT,
    arrival_airport TEXT,
    aircraft TEXT,
    aircraft_type TEXT,
    flight_time TEXT, -- Can be stored as "HH:MM" or numeric hours
    distance NUMERIC(10,2),
    fuel_used NUMERIC(10,2),
    status TEXT DEFAULT 'completed',
    notes TEXT,
    -- Financial fields
    revenue NUMERIC(12,2) DEFAULT 0,
    expenses NUMERIC(12,2) DEFAULT 0,
    profit NUMERIC(12,2) DEFAULT 0,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FINANCIAL TRANSACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('revenue', 'expense')),
    category_id TEXT,
    amount NUMERIC(12,2) NOT NULL,
    description TEXT,
    flight_id UUID REFERENCES flights(id) ON DELETE SET NULL,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MAINTENANCE RECORDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    aircraft TEXT NOT NULL,
    date DATE NOT NULL,
    maintenance_type TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    description TEXT,
    estimated_cost NUMERIC(12,2),
    actual_cost NUMERIC(12,2),
    mechanic_name TEXT,
    location TEXT,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GOALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    goal_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_value NUMERIC(12,2),
    current_value NUMERIC(12,2) DEFAULT 0,
    target_date DATE,
    is_active BOOLEAN DEFAULT true,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BASIC INDEXES FOR PERFORMANCE
-- ============================================

-- Flights indexes
CREATE INDEX IF NOT EXISTS idx_flights_user_id ON flights(user_id);
CREATE INDEX IF NOT EXISTS idx_flights_departure_time ON flights(departure_time) WHERE departure_time IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_flights_user_date ON flights(user_id, departure_time) WHERE departure_time IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_flights_airports ON flights(departure_airport, arrival_airport);
CREATE INDEX IF NOT EXISTS idx_flights_aircraft ON flights(user_id, aircraft) WHERE aircraft IS NOT NULL;

-- Financial transactions indexes
CREATE INDEX IF NOT EXISTS idx_financial_user_id ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_user_date ON financial_transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_type ON financial_transactions(user_id, transaction_type);

-- Maintenance records indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_user_id ON maintenance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance_records(date);
CREATE INDEX IF NOT EXISTS idx_maintenance_user_date ON maintenance_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_maintenance_aircraft ON maintenance_records(user_id, aircraft);

-- Goals indexes
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_active ON goals(user_id, is_active) WHERE is_active = true;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own flights" ON flights
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own financial transactions" ON financial_transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own maintenance records" ON maintenance_records
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own goals" ON goals
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT ALL ON flights TO authenticated;
GRANT ALL ON financial_transactions TO authenticated;
GRANT ALL ON maintenance_records TO authenticated;
GRANT ALL ON goals TO authenticated;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 'Base tables created successfully!' as message;