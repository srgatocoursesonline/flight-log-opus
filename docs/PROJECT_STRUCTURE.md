# Flight Log Opus - Project Structure

## Overview

Flight Log Opus is a web application for managing flight logs, tracking career progression, and monitoring financial aspects of flight activities. The application integrates with Supabase for backend data storage and authentication.

## Project Structure

```
flight-log-opus/
├── public/                  # Static assets
├── src/
│   ├── components/          # React components
│   │   ├── career/          # Career-related components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── flights/         # Flight management components
│   │   ├── financial/       # Financial components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI primitive components (shadcn/ui)
│   │
│   ├── contexts/            # React context providers
│   │   └── AuthContext.tsx  # Authentication context
│   │
│   ├── db/                  # Database-related files
│   │   ├── supabase/
│   │   │   ├── functions/   # Supabase RPC functions
│   │   │   ├── schema/      # Database schema definitions
│   │   │   └── fixes/       # Database fix scripts
│   │   └── README.md        # Database documentation
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── use-toast.ts     # Toast notification hook
│   │   ├── useSupabaseCareerManager.ts    # Career data management
│   │   ├── useSupabaseFlightStatusManager.ts  # Flight status management
│   │   └── ... other hooks
│   │
│   ├── lib/                 # Utility libraries
│   │   ├── supabase.ts      # Supabase client and types
│   │   └── i18n.ts          # Internationalization setup
│   │
│   ├── pages/               # Application pages
│   │   ├── Index.tsx        # Dashboard page
│   │   ├── Flights.tsx      # Flight management page
│   │   ├── Settings.tsx     # Settings page
│   │   └── ... other pages
│   │
│   ├── utils/               # Utility functions
│   │   └── autoRefresh.ts   # Page refresh utility
│   │
│   ├── App.tsx              # Root application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
│
├── .env.example             # Example environment variables
├── .env.local               # Local environment variables (git-ignored)
├── package.json             # Project dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Key Components and Features

### Authentication
- User authentication via Supabase Auth
- User profile management with custom display names and avatars

### Flight Management
- Flight logging with detailed information
- Custom aircraft configuration
- Flight status tracking

### Career Progression
- Career rating tracking from Microsoft Flight Simulator
- Career class and level visualization
- Progress monitoring

### Financial Management
- Income and expense tracking
- Category management
- Financial reporting and visualization

### Settings
- Theme switching (light/dark)
- Language selection (pt-BR/en-US)
- Data synchronization options

## Database Structure

The application uses Supabase (PostgreSQL) with the following key tables:
- `profiles`: User profile information
- `flights`: Flight log entries
- `flight_statuses`: Possible flight statuses
- `custom_aircraft`: User-defined aircraft
- `financial_transactions`: Financial transactions
- `revenue_categories`: Revenue category definitions
- `expense_categories`: Expense category definitions
- `goals`: User goals
- `user_settings`: User preferences

For more details on the database structure, see `src/db/README.md`.

## Development

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase URL and anon key
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`

### Supabase Setup
1. Create a new Supabase project
2. Execute the schema files in `src/db/supabase/schema/`
3. Execute the function files in `src/db/supabase/functions/`

## Troubleshooting

For career data persistence issues, refer to:
- `CORRECAO_DADOS_CARREIRA.md` - Detailed solutions for career data issues
- Execute the fix script in `src/db/supabase/fixes/fix-all-career-issues.sql`