# Database Structure & SQL Functions

This document provides an overview of the database structure and SQL functions used in the Flight Log Opus project.

## Directory Structure

The database files are organized as follows:

```
src/db/
├── supabase/
│   ├── functions/    # RPC functions for database operations
│   │   ├── career-functions.sql   # Career data related functions
│   │   └── exec-sql.sql           # Utility for executing dynamic SQL
│   │
│   ├── schema/       # Database schema definitions
│   │   └── profiles-schema.sql    # Profile table schema with career fields
│   │
│   └── fixes/        # Fix scripts for database issues
│       └── fix-all-career-issues.sql  # Comprehensive fix for career data
```

## Database Schema

The project uses Supabase (PostgreSQL) with the following key tables:

### Profiles Table

Stores user profile information including:
- `id`: UUID (from auth.users)
- `display_name`: String
- `email`: String
- `avatar_url`: String
- `total_rating`: Integer - Career total rating
- `career_level`: Integer - Career level
- `career_class`: String - Career class (S, A, B, C, or D)
- `total_flights`: Integer
- `total_hours`: Integer
- `world_ranking`: Integer
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Other Tables (defined elsewhere)
- `flights`: Flight log entries
- `flight_statuses`: Possible flight statuses
- `custom_aircraft`: User-defined aircraft
- `financial_transactions`: Financial transactions
- `revenue_categories`: Revenue category definitions
- `expense_categories`: Expense category definitions
- `goals`: User goals
- `user_settings`: User preferences

## RPC Functions

### Career Management Functions

1. `fetch_career_data(user_id UUID)`
   - Returns career data for a specific user
   - Creates necessary columns if they don't exist
   - Returns default values if user profile doesn't exist

2. `update_career_data(user_id UUID, data_json JSON)`
   - Updates career data for a specific user
   - Creates profile if it doesn't exist
   - Creates necessary columns if they don't exist
   - Returns boolean indicating success/failure

### Utility Functions

1. `exec_sql(sql_query TEXT)`
   - Executes arbitrary SQL queries
   - Used for dynamic SQL operations
   - Returns boolean indicating success/failure

## How to Use

To execute any SQL file:
1. Navigate to Supabase dashboard
2. Select SQL Editor
3. Copy content from relevant SQL file
4. Paste into editor and execute

For more details on specific issues and fixes, refer to:
- `CORRECAO_DADOS_CARREIRA.md` - For career data issues
- `SUPABASE_SETUP_INSTRUCTIONS.md` - For general Supabase setup