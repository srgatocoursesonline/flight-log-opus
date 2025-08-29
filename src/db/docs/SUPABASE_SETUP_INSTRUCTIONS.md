# Supabase Setup Instructions

## Setting Up Supabase for Flight Log Opus

This guide provides instructions for setting up Supabase for the Flight Log Opus application.

### Initial Setup

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project and note your project URL and anon key
3. Add these to your `.env.local` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Database Setup

1. Navigate to the SQL Editor in your Supabase dashboard
2. Execute the schema file from `src/db/supabase/schema/complete-schema.sql`
3. Execute the functions in the following order:
   - `src/db/supabase/functions/exec-sql.sql`
   - `src/db/supabase/functions/career-functions.sql`

### Authentication Setup

1. In the Supabase dashboard, go to Authentication > Settings
2. Configure your site URL to match your development or production URL
3. Enable Email/Password sign-in method
4. Optionally configure additional providers (Google, GitHub, etc.)

### Career Data Fix

If you encounter issues with career data not being saved or displayed:

1. Navigate to SQL Editor in your Supabase dashboard
2. Execute the fix script from `src/db/supabase/fixes/fix-all-career-issues.sql`
3. Follow detailed instructions in `src/db/docs/CORRECAO_DADOS_CARREIRA.md`

### Testing Your Setup

To verify everything is working correctly:

1. Start your development server (`npm run dev`)
2. Sign up or sign in to the application
3. Navigate to Settings and update your career data
4. Check the dashboard to ensure the data appears correctly

For more detailed information about the database structure, see `src/db/README.md`.