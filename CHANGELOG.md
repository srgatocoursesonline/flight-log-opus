# Changelog

## [Unreleased] - 2025-08-29

### Added
- Comprehensive database structure documentation in `src/db/README.md`
- Complete database schema in `src/db/supabase/schema/complete-schema.sql`
- Project structure documentation in `PROJECT_STRUCTURE.md`

### Changed
- Reorganized SQL files into a structured directory layout:
  - Database functions moved to `src/db/supabase/functions/`
  - Schema definitions moved to `src/db/supabase/schema/`
  - Fix scripts moved to `src/db/supabase/fixes/`
  - Documentation moved to `src/db/docs/`
- Improved error handling in `useSupabaseCareerManager.ts` with multiple fallback approaches
- Enhanced form handling in `CareerRatingManager.tsx` to avoid page reloads

### Fixed
- Fixed career data persistence issues:
  - Added proper data type handling in RPC function parameters
  - Implemented multiple fallback methods for data updates
  - Added comprehensive error handling
  - Created direct SQL update methods when RPC fails
- Fixed schema cache issues with custom SQL execution approach
- Added debugging information to help troubleshoot future issues

## [1.0.0] - 2025-08-28

### Added
- Initial release with core flight logging functionality
- User profile management
- Career tracking integration with Microsoft Flight Simulator
- Custom aircraft management
- Flight status tracking
- Dashboard with key metrics
- Financial tracking with income and expenses
- Goals system for tracking progress

### Technical Details
- Built with React, TypeScript, and Vite
- Supabase integration for backend storage and authentication
- Tailwind CSS and shadcn/ui for UI components
- Internationalization support (pt-BR and en-US)