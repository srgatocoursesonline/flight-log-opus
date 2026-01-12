// ============================================
// DATABASE SETUP UTILITIES FOR REPORTS
// ============================================

import { supabase } from '@/lib/supabase';

// ============================================
// SETUP FUNCTIONS
// ============================================

/**
 * Check if report views and indexes exist
 */
export async function checkReportDatabaseSetup(): Promise<{
  viewsExist: boolean;
  indexesExist: boolean;
  functionsExist: boolean;
  error?: any;
}> {
  try {
    // Check if materialized views exist
    const { data: views, error: viewsError } = await supabase
      .from('pg_matviews')
      .select('matviewname')
      .in('matviewname', ['flight_report_data', 'financial_report_data', 'airport_stats', 'route_stats']);

    if (viewsError) {
      console.error('Error checking views:', viewsError);
      return { viewsExist: false, indexesExist: false, functionsExist: false, error: viewsError };
    }

    const expectedViews = ['flight_report_data', 'financial_report_data', 'airport_stats', 'route_stats'];
    const existingViews = views?.map(v => v.matviewname) || [];
    const viewsExist = expectedViews.every(view => existingViews.includes(view));

    // Check if indexes exist
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('indexname')
      .like('indexname', 'idx_flight_report_data_%');

    if (indexesError) {
      console.error('Error checking indexes:', indexesError);
      return { viewsExist, indexesExist: false, functionsExist: false, error: indexesError };
    }

    const indexesExist = (indexes?.length || 0) > 0;

    // Check if functions exist
    const { data: functions, error: functionsError } = await supabase
      .from('pg_proc')
      .select('proname')
      .in('proname', ['get_flight_stats', 'get_financial_stats', 'get_flights_by_month']);

    if (functionsError) {
      console.error('Error checking functions:', functionsError);
      return { viewsExist, indexesExist, functionsExist: false, error: functionsError };
    }

    const expectedFunctions = ['get_flight_stats', 'get_financial_stats', 'get_flights_by_month'];
    const existingFunctions = functions?.map(f => f.proname) || [];
    const functionsExist = expectedFunctions.every(func => existingFunctions.includes(func));

    return {
      viewsExist,
      indexesExist,
      functionsExist,
      error: null
    };
  } catch (error) {
    console.error('Error in checkReportDatabaseSetup:', error);
    return { viewsExist: false, indexesExist: false, functionsExist: false, error };
  }
}

/**
 * Refresh materialized views
 */
export async function refreshReportViews(): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase.rpc('refresh_report_views');

    if (error) {
      console.error('Error refreshing report views:', error);
      return { success: false, error };
    }

    console.log('Report views refreshed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in refreshReportViews:', error);
    return { success: false, error };
  }
}

/**
 * Get materialized view status and statistics
 */
export async function getReportViewStatus(): Promise<{
  status: any[] | null;
  error?: any;
}> {
  try {
    const { data, error } = await supabase
      .from('report_view_status')
      .select('*');

    if (error) {
      console.error('Error getting report view status:', error);
      return { status: null, error };
    }

    return { status: data, error: null };
  } catch (error) {
    console.error('Error in getReportViewStatus:', error);
    return { status: null, error };
  }
}

/**
 * Execute database function with error handling
 */
export async function executeReportFunction(
  functionName: string,
  params: Record<string, any>
): Promise<{ data: any; error?: any }> {
  try {
    const { data, error } = await supabase.rpc(functionName, params);

    if (error) {
      console.error(`Error executing function ${functionName}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error in executeReportFunction (${functionName}):`, error);
    return { data: null, error };
  }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate that required tables exist for reports
 */
export async function validateReportTables(): Promise<{
  valid: boolean;
  missingTables: string[];
  error?: any;
}> {
  const requiredTables = [
    'flights',
    'financial_transactions',
    'maintenance_records',
    'goals',
    'expense_categories',
    'revenue_categories'
  ];

  try {
    const missingTables: string[] = [];

    for (const table of requiredTables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        missingTables.push(table);
      }
    }

    return {
      valid: missingTables.length === 0,
      missingTables,
      error: null
    };
  } catch (error) {
    console.error('Error validating report tables:', error);
    return {
      valid: false,
      missingTables: requiredTables,
      error
    };
  }
}

/**
 * Test report queries to ensure they work correctly
 */
export async function testReportQueries(userId: string): Promise<{
  success: boolean;
  results: Record<string, any>;
  error?: any;
}> {
  try {
    const results: Record<string, any> = {};

    // Test flight stats function
    const flightStats = await executeReportFunction('get_flight_stats', {
      p_user_id: userId
    });
    results.flightStats = flightStats;

    // Test financial stats function
    const financialStats = await executeReportFunction('get_financial_stats', {
      p_user_id: userId
    });
    results.financialStats = financialStats;

    // Test flights by month function
    const flightsByMonth = await executeReportFunction('get_flights_by_month', {
      p_user_id: userId
    });
    results.flightsByMonth = flightsByMonth;

    // Test basic table queries
    const { data: flights, error: flightsError } = await supabase
      .from('flights')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    results.flightsQuery = { data: flights, error: flightsError };

    const { data: transactions, error: transactionsError } = await supabase
      .from('financial_transactions')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    results.transactionsQuery = { data: transactions, error: transactionsError };

    // Check if any queries failed
    const hasErrors = Object.values(results).some(result => result.error);

    return {
      success: !hasErrors,
      results,
      error: hasErrors ? 'Some queries failed' : null
    };
  } catch (error) {
    console.error('Error testing report queries:', error);
    return {
      success: false,
      results: {},
      error
    };
  }
}

// ============================================
// MAINTENANCE FUNCTIONS
// ============================================

/**
 * Get database performance statistics for reports
 */
export async function getReportPerformanceStats(): Promise<{
  stats: any;
  error?: any;
}> {
  try {
    // Get table sizes
    const { data: tableSizes, error: tableSizesError } = await supabase
      .from('pg_stat_user_tables')
      .select('relname, n_tup_ins, n_tup_upd, n_tup_del, seq_scan, idx_scan')
      .in('relname', ['flights', 'financial_transactions', 'maintenance_records']);

    if (tableSizesError) {
      return { stats: null, error: tableSizesError };
    }

    // Get index usage
    const { data: indexUsage, error: indexUsageError } = await supabase
      .from('pg_stat_user_indexes')
      .select('relname, indexrelname, idx_scan')
      .like('indexrelname', 'idx_%');

    if (indexUsageError) {
      return { stats: { tableSizes }, error: indexUsageError };
    }

    return {
      stats: {
        tableSizes,
        indexUsage
      },
      error: null
    };
  } catch (error) {
    console.error('Error getting performance stats:', error);
    return { stats: null, error };
  }
}

/**
 * Clean up old cached data and optimize performance
 */
export async function optimizeReportPerformance(): Promise<{
  success: boolean;
  actions: string[];
  error?: any;
}> {
  try {
    const actions: string[] = [];

    // Refresh materialized views
    const refreshResult = await refreshReportViews();
    if (refreshResult.success) {
      actions.push('Refreshed materialized views');
    }

    // Analyze tables for better query planning
    const tablesToAnalyze = ['flights', 'financial_transactions', 'maintenance_records'];
    
    for (const table of tablesToAnalyze) {
      try {
        await supabase.rpc('analyze_table', { table_name: table });
        actions.push(`Analyzed table: ${table}`);
      } catch (analyzeError) {
        console.warn(`Could not analyze table ${table}:`, analyzeError);
      }
    }

    return {
      success: true,
      actions,
      error: null
    };
  } catch (error) {
    console.error('Error optimizing report performance:', error);
    return {
      success: false,
      actions: [],
      error
    };
  }
}

// ============================================
// INITIALIZATION FUNCTION
// ============================================

/**
 * Initialize report database setup
 * This should be called once when the application starts
 */
export async function initializeReportDatabase(): Promise<{
  success: boolean;
  message: string;
  details: any;
}> {
  try {
    console.log('Initializing report database setup...');

    // Check current setup
    const setupCheck = await checkReportDatabaseSetup();
    
    if (setupCheck.error) {
      return {
        success: false,
        message: 'Failed to check database setup',
        details: setupCheck
      };
    }

    // Validate required tables
    const tableValidation = await validateReportTables();
    
    if (!tableValidation.valid) {
      return {
        success: false,
        message: `Missing required tables: ${tableValidation.missingTables.join(', ')}`,
        details: tableValidation
      };
    }

    // If views don't exist, they need to be created manually
    if (!setupCheck.viewsExist || !setupCheck.functionsExist) {
      return {
        success: false,
        message: 'Report views and functions need to be created. Please run the database setup script.',
        details: setupCheck
      };
    }

    // Refresh views to ensure they have current data
    const refreshResult = await refreshReportViews();
    
    if (!refreshResult.success) {
      console.warn('Could not refresh report views:', refreshResult.error);
    }

    console.log('Report database initialization completed successfully');

    return {
      success: true,
      message: 'Report database initialized successfully',
      details: {
        setup: setupCheck,
        tables: tableValidation,
        refresh: refreshResult
      }
    };
  } catch (error) {
    console.error('Error initializing report database:', error);
    return {
      success: false,
      message: 'Failed to initialize report database',
      details: { error }
    };
  }
}