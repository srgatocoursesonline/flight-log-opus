// Test case for flight count calculation
// Run this in the browser console to verify the fix

(function testFlightCountCalculation() {
  console.log('🧪 RUNNING FLIGHT COUNT CALCULATION TEST 🧪');
  console.log('===========================================');
  
  // Check if the debugTrace utility is available
  if (typeof window.__DEBUG_TRACE === 'undefined') {
    console.error('Debug trace utility not available. Open the Profile page first.');
    return;
  }
  
  // Clear previous trace entries
  window.__DEBUG_TRACE.valueHistory = [];
  console.log('✅ Debug trace history cleared');
  
  // Simulate a profile with baseline and system flights
  const mockProfile = {
    id: 'mock-user-id',
    initial_flights: 100,
    total_flights: 50,
    initial_minutes: 6000,
    total_minutes: 3000
  };
  
  console.log('📊 Mock profile created:', mockProfile);
  console.log('Expected total flights:', mockProfile.initial_flights + mockProfile.total_flights);
  
  // Add trace for this mock profile
  window.__DEBUG_TRACE.addTrace('TEST - Mock Profile', {
    initial_flights: mockProfile.initial_flights,
    total_flights: mockProfile.total_flights,
    calculatedTotal: mockProfile.initial_flights + mockProfile.total_flights
  });
  
  // Simulate adding a flight and dispatching an event
  console.log('🧪 Simulating flight completed event...');
  
  const testEvent = new CustomEvent('flightCompleted', {
    detail: {
      flightTime: '1h 30m',
      status: 'Concluído'
    }
  });
  
  window.dispatchEvent(testEvent);
  console.log('✅ Test flight event dispatched');
  
  // Print a summary of the test
  console.log('🧪 TEST SUMMARY 🧪');
  console.log('==================');
  console.log('Initial mock profile:', {
    initial_flights: mockProfile.initial_flights,
    total_flights: mockProfile.total_flights,
    expectedTotal: mockProfile.initial_flights + mockProfile.total_flights
  });
  
  // Print the trace history
  console.log('📋 Trace history:');
  window.__DEBUG_TRACE.printSummary();
  
  console.log('🏁 TEST COMPLETED 🏁');
})();