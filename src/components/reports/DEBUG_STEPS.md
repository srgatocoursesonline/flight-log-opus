# Debug Steps for Empty Data Issue

## 🔍 **Current Problem**
The flight reports are showing empty data (0 flights, 0 hours, etc.) even though the database queries are working.

## 🛠️ **Debug Steps Applied**

### 1. **Added Comprehensive Logging**
Added detailed console logs to track data flow:

- `useReportData.ts`: Logs user ID, filters, and data processing steps
- `reportQueries.ts`: Logs query execution and results
- `fetchFlightsForReports`: Logs each filter application and query results

### 2. **Created Debug Components**
- `FlightDataDebug.tsx`: Direct database query test
- `FlightDataTest.tsx`: Hook testing component

### 3. **Fixed Database Queries**
- Removed problematic JOINs that were causing relationship errors
- Simplified queries to use basic SELECT statements
- Added mock airport details generation

## 🔍 **How to Debug**

### Step 1: Check Browser Console
Open browser console (F12) and look for logs starting with:
- `useReportData:`
- `fetchAllReportData:`
- `fetchFlightsForReports:`

### Step 2: Check User Authentication
Verify in console logs:
```
useReportData: Starting data fetch for user: [USER_ID]
```

### Step 3: Check Database Query Results
Look for:
```
fetchFlightsForReports: Query successful, found X flights
```

### Step 4: Check Data Processing
Look for:
```
useReportData: Processed data: { flights: X, flightAggregation: {...} }
```

## 🎯 **Expected Log Flow**
```
1. useReportData: Starting data fetch for user: abc123...
2. useReportData: Filters: { dateRange: {...}, ... }
3. fetchAllReportData: Starting for user: abc123...
4. fetchFlightsForReports: Starting query for user: abc123...
5. fetchFlightsForReports: Applying date filter: {...}
6. fetchFlightsForReports: Executing query...
7. fetchFlightsForReports: Query successful, found X flights
8. fetchAllReportData: Individual results: { flights: { count: X, error: null }, ... }
9. useReportData: Processed data: { flights: X, flightAggregation: {...} }
```

## 🚨 **Common Issues to Check**

### Issue 1: No User ID
```
useReportData: No user ID available
```
**Solution**: Check authentication context

### Issue 2: Database Query Errors
```
fetchFlightsForReports: Query error: [ERROR_MESSAGE]
```
**Solution**: Check database permissions and table structure

### Issue 3: Empty Results
```
fetchFlightsForReports: Query successful, found 0 flights
```
**Solution**: Check if user has flights in database, verify filters

### Issue 4: Date Filter Issues
```
fetchFlightsForReports: Applying date filter: { from: ..., to: ... }
```
**Solution**: Verify date range includes user's flights

## 🔧 **Quick Fixes to Try**

### 1. **Disable Date Filters Temporarily**
In `useReportFilters.ts`, set a very wide date range:
```typescript
dateRange: {
  from: new Date('2020-01-01'),
  to: new Date('2030-12-31'),
  preset: 'all_time'
}
```

### 2. **Check Raw Database Data**
Use the `FlightDataDebug` component to see raw database results

### 3. **Verify User ID**
Check if the user ID in logs matches the user ID in your database

## 📊 **Database Verification Queries**
Run these in Supabase SQL editor:

```sql
-- Check if flights table has data
SELECT COUNT(*) as total_flights FROM flights;

-- Check flights for specific user
SELECT COUNT(*) as user_flights FROM flights WHERE user_id = 'YOUR_USER_ID';

-- Check recent flights
SELECT * FROM flights ORDER BY created_at DESC LIMIT 5;

-- Check date ranges
SELECT 
  MIN(departure_time) as earliest_flight,
  MAX(departure_time) as latest_flight
FROM flights;
```

The debug logs will help identify exactly where the data flow is breaking down!