-- SQL script to check profile and flight counts
-- Use this in Supabase SQL editor to verify the actual values

-- 1. Check the current profile data
SELECT 
  id, 
  display_name, 
  initial_flights, 
  initial_minutes, 
  total_flights, 
  total_minutes
FROM profiles
WHERE id = 'YOUR_USER_ID';  -- Replace with your actual user ID or remove WHERE clause to see all profiles

-- 2. Count the number of completed flights
SELECT COUNT(*) as completed_flights_count
FROM flights
WHERE user_id = 'YOUR_USER_ID'  -- Replace with your actual user ID
AND status = 'Concluído';

-- 3. Check some sample flight data
SELECT 
  id, 
  callsign, 
  departure, 
  arrival, 
  flight_time, 
  status,
  created_at
FROM flights
WHERE user_id = 'YOUR_USER_ID'  -- Replace with your actual user ID
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check for any potential data inconsistencies in profiles
SELECT 
  id, 
  display_name,
  initial_flights,
  total_flights,
  (initial_flights + total_flights) as calculated_total_flights,
  initial_minutes,
  total_minutes,
  (initial_minutes + total_minutes) as calculated_total_minutes
FROM profiles
WHERE id = 'YOUR_USER_ID';  -- Replace with your actual user ID

-- 5. Check if there are any duplicated flight records
SELECT 
  callsign, 
  departure, 
  arrival, 
  flight_time, 
  status, 
  COUNT(*) as count
FROM flights
WHERE user_id = 'YOUR_USER_ID'  -- Replace with your actual user ID
GROUP BY callsign, departure, arrival, flight_time, status
HAVING COUNT(*) > 1;