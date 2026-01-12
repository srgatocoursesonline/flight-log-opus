-- ============================================
-- CREATE REPORT VIEWS AND MATERIALIZED VIEWS
-- ============================================

-- Drop existing views if they exist
DROP MATERIALIZED VIEW IF EXISTS flight_report_data CASCADE;
DROP MATERIALIZED VIEW IF EXISTS financial_report_data CASCADE;
DROP MATERIALIZED VIEW IF EXISTS airport_stats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS route_stats CASCADE;
DROP VIEW IF EXISTS maintenance_report_summary CASCADE;

-- ============================================
-- FLIGHT REPORT MATERIALIZED VIEW
-- ============================================

CREATE MATERIALIZED VIEW flight_report_data AS
SELECT 
  user_id,
  date_trunc('month', departure_time) as month,
  date_trunc('year', departure_time) as year,
  COUNT(*) as flight_count,
  -- Calculate total hours from flight_time field
  SUM(
    CASE 
      WHEN flight_time ~ '^[0-9]+:[0-9]+$' THEN 
        EXTRACT(EPOCH FROM flight_time::interval) / 3600.0
      WHEN flight_time ~ '^[0-9]+\.?[0-9]*$' THEN 
        flight_time::numeric
      ELSE 
        0
    END
  ) as total_hours,
  SUM(COALESCE(distance, 0)) as total_distance,
  SUM(COALESCE(fuel_used, 0)) as total_fuel,
  -- Calculate averages
  AVG(
    CASE 
      WHEN flight_time ~ '^[0-9]+:[0-9]+$' THEN 
        EXTRACT(EPOCH FROM flight_time::interval) / 3600.0
      WHEN flight_time ~ '^[0-9]+\.?[0-9]*$' THEN 
        flight_time::numeric
      ELSE 
        NULL
    END
  ) as avg_duration,
  AVG(COALESCE(distance, 0)) as avg_distance,
  -- Count unique values
  COUNT(DISTINCT departure_airport) as unique_departure_airports,
  COUNT(DISTINCT arrival_airport) as unique_arrival_airports,
  COUNT(DISTINCT aircraft) as unique_aircraft,
  -- Group by fields
  aircraft,
  status,
  -- Financial metrics
  SUM(COALESCE(revenue, 0)) as total_revenue,
  SUM(COALESCE(expenses, 0)) as total_expenses,
  SUM(COALESCE(profit, 0)) as total_profit
FROM flights 
WHERE departure_time IS NOT NULL
GROUP BY user_id, month, year, aircraft, status;

-- Create indexes on flight report data
CREATE UNIQUE INDEX idx_flight_report_data_unique ON flight_report_data(user_id, month, year, COALESCE(aircraft, ''), COALESCE(status, ''));
CREATE INDEX idx_flight_report_data_user_month ON flight_report_data(user_id, month);
CREATE INDEX idx_flight_report_data_user_year ON flight_report_data(user_id, year);
CREATE INDEX idx_flight_report_data_aircraft ON flight_report_data(user_id, aircraft) WHERE aircraft IS NOT NULL;
CREATE INDEX idx_flight_report_data_status ON flight_report_data(user_id, status) WHERE status IS NOT NULL;

-- ============================================
-- FINANCIAL REPORT MATERIALIZED VIEW
-- ============================================

CREATE MATERIALIZED VIEW financial_report_data AS
SELECT 
  user_id,
  date_trunc('month', transaction_date::timestamp) as month,
  date_trunc('year', transaction_date::timestamp) as year,
  transaction_type,
  category_id,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  AVG(amount) as avg_amount,
  MIN(amount) as min_amount,
  MAX(amount) as max_amount
FROM financial_transactions
GROUP BY user_id, month, year, transaction_type, category_id;

-- Create indexes on financial report data
CREATE UNIQUE INDEX idx_financial_report_data_unique ON financial_report_data(user_id, month, year, transaction_type, COALESCE(category_id, ''));
CREATE INDEX idx_financial_report_data_user_month ON financial_report_data(user_id, month);
CREATE INDEX idx_financial_report_data_user_year ON financial_report_data(user_id, year);
CREATE INDEX idx_financial_report_data_type ON financial_report_data(user_id, transaction_type);
CREATE INDEX idx_financial_report_data_category ON financial_report_data(user_id, category_id) WHERE category_id IS NOT NULL;

-- ============================================
-- AIRPORT STATISTICS MATERIALIZED VIEW
-- ============================================

CREATE MATERIALIZED VIEW airport_stats AS
WITH airport_visits AS (
  SELECT 
    user_id,
    departure_airport as airport_code,
    departure_time as visit_time,
    CASE 
      WHEN flight_time ~ '^[0-9]+:[0-9]+$' THEN 
        EXTRACT(EPOCH FROM flight_time::interval) / 3600.0
      WHEN flight_time ~ '^[0-9]+\.?[0-9]*$' THEN 
        flight_time::numeric
      ELSE 
        0
    END as flight_duration,
    'departure' as visit_type
  FROM flights
  WHERE departure_airport IS NOT NULL AND departure_time IS NOT NULL
  
  UNION ALL
  
  SELECT 
    user_id,
    arrival_airport as airport_code,
    arrival_time as visit_time,
    CASE 
      WHEN flight_time ~ '^[0-9]+:[0-9]+$' THEN 
        EXTRACT(EPOCH FROM flight_time::interval) / 3600.0
      WHEN flight_time ~ '^[0-9]+\.?[0-9]*$' THEN 
        flight_time::numeric
      ELSE 
        0
    END as flight_duration,
    'arrival' as visit_type
  FROM flights
  WHERE arrival_airport IS NOT NULL AND arrival_time IS NOT NULL
)
SELECT 
  user_id,
  airport_code,
  COUNT(*) as visit_count,
  MIN(visit_time) as first_visit,
  MAX(visit_time) as last_visit,
  SUM(flight_duration) as total_flight_time,
  AVG(flight_duration) as avg_flight_time
FROM airport_visits
GROUP BY user_id, airport_code;

-- Create indexes on airport stats
CREATE UNIQUE INDEX idx_airport_stats_unique ON airport_stats(user_id, airport_code);
CREATE INDEX idx_airport_stats_user ON airport_stats(user_id);
CREATE INDEX idx_airport_stats_visits ON airport_stats(user_id, visit_count DESC);

-- ============================================
-- ROUTE STATISTICS MATERIALIZED VIEW
-- ============================================

CREATE MATERIALIZED VIEW route_stats AS
SELECT 
  user_id,
  departure_airport as origin,
  arrival_airport as destination,
  COUNT(*) as flight_count,
  SUM(COALESCE(distance, 0)) as total_distance,
  SUM(
    CASE 
      WHEN flight_time ~ '^[0-9]+:[0-9]+$' THEN 
        EXTRACT(EPOCH FROM flight_time::interval) / 3600.0
      WHEN flight_time ~ '^[0-9]+\.?[0-9]*$' THEN 
        flight_time::numeric
      ELSE 
        0
    END
  ) as total_time,
  AVG(
    CASE 
      WHEN flight_time ~ '^[0-9]+:[0-9]+$' THEN 
        EXTRACT(EPOCH FROM flight_time::interval) / 3600.0
      WHEN flight_time ~ '^[0-9]+\.?[0-9]*$' THEN 
        flight_time::numeric
      ELSE 
        NULL
    END
  ) as avg_time,
  SUM(COALESCE(revenue, 0)) as total_revenue,
  AVG(COALESCE(revenue, 0)) as avg_revenue,
  MIN(departure_time) as first_flight,
  MAX(departure_time) as last_flight
FROM flights
WHERE departure_airport IS NOT NULL 
  AND arrival_airport IS NOT NULL
  AND departure_airport != arrival_airport
GROUP BY user_id, departure_airport, arrival_airport;

-- Create indexes on route stats
CREATE UNIQUE INDEX idx_route_stats_unique ON route_stats(user_id, origin, destination);
CREATE INDEX idx_route_stats_user ON route_stats(user_id);
CREATE INDEX idx_route_stats_frequency ON route_stats(user_id, flight_count DESC);

-- ============================================
-- MAINTENANCE REPORT VIEW (Regular View)
-- ============================================

CREATE VIEW maintenance_report_summary AS
SELECT 
  user_id,
  aircraft,
  date_trunc('month', date::timestamp) as month,
  date_trunc('year', date::timestamp) as year,
  COUNT(*) as maintenance_count,
  SUM(COALESCE(actual_cost, estimated_cost, 0)) as total_cost,
  AVG(COALESCE(actual_cost, estimated_cost, 0)) as avg_cost,
  MIN(date) as first_maintenance,
  MAX(date) as last_maintenance,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
  COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count
FROM maintenance_records
GROUP BY user_id, aircraft, month, year;

-- ============================================
-- ROW LEVEL SECURITY FOR VIEWS
-- ============================================

-- Enable RLS on materialized views
ALTER TABLE flight_report_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_report_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE airport_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for views
CREATE POLICY "Users can only see their own flight report data" ON flight_report_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own financial report data" ON financial_report_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own airport stats" ON airport_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own route stats" ON route_stats
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT SELECT ON flight_report_data TO authenticated;
GRANT SELECT ON financial_report_data TO authenticated;
GRANT SELECT ON airport_stats TO authenticated;
GRANT SELECT ON route_stats TO authenticated;
GRANT SELECT ON maintenance_report_summary TO authenticated;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 'Report views created successfully!' as message;