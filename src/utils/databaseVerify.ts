import { supabase } from '@/lib/supabase';

// Utility function to verify database values directly
export const verifyDatabaseValues = async (userId: string) => {
  try {
    // Removido o console.log para reduzir logs
    
    // Get profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      // Removido o console.error para reduzir logs
      return;
    }
    
    // Get completed flights count
    const { data: flightsData, error: flightsError } = await supabase
      .from('flights')
      .select('flight_time')
      .eq('user_id', userId)
      .eq('status', 'Concluído');
      
    if (flightsError) {
      // Removido o console.error para reduzir logs
      return;
    }
    
    const completedFlightsCount = flightsData?.length || 0;
    
    // Calculate expected totals
    const initialFlights = profileData?.initial_flights || 0;
    const totalFlights = profileData?.total_flights || 0;
    const expectedTotal = initialFlights + totalFlights;
    
    // Removido o console.log para reduzir logs
    
    // Check for any discrepancies
    if (totalFlights !== completedFlightsCount) {
      // Removido o console.warn para reduzir logs
    }
    
    // Return the data for further analysis
    return {
      profile: profileData,
      completedFlightsCount,
      expectedTotal
    };
  } catch (error) {
    // Removido o console.error para reduzir logs
  }
};

// Expose a function to fix inconsistencies if needed
export const fixDatabaseInconsistencies = async (userId: string) => {
  try {
    // First verify the current state
    const verification = await verifyDatabaseValues(userId);
    
    if (!verification || !verification.profile) {
      // Removido o console.error para reduzir logs
      return;
    }
    
    // Check if total_flights is inconsistent with the actual count
    if (verification.profile.total_flights !== verification.completedFlightsCount) {
      // Removido o console.log para reduzir logs
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          total_flights: verification.completedFlightsCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) {
        // Removido o console.error para reduzir logs
      } else {
        // Removido o console.log para reduzir logs
        // Verify again to confirm the fix
        await verifyDatabaseValues(userId);
      }
    } else {
      // Removido o console.log para reduzir logs
    }
  } catch (error) {
    // Removido o console.error para reduzir logs
  }
};

// Expose a function to automatically monitor and fix inconsistencies
export const setupDatabaseConsistencyMonitor = (userId: string, intervalMinutes = 15) => {
  if (!userId) {
    // Removido o console.error para reduzir logs
    return null;
  }
  
  // Removido o console.log para reduzir logs
  
  // First check immediately
  const checkAndFixInconsistencies = async () => {
    // Removido o console.log para reduzir logs
    try {
      await fixDatabaseInconsistencies(userId);
    } catch (error) {
      // Removido o console.error para reduzir logs
    }
  };
  
  // Run initial check
  checkAndFixInconsistencies();
  
  // Setup interval
  const intervalId = setInterval(checkAndFixInconsistencies, intervalMinutes * 60 * 1000);
  
  // Return a function to clear the interval if needed
  return () => {
    clearInterval(intervalId);
    // Removido o console.log para reduzir logs
  };
};