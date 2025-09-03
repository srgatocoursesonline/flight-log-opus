// Debugging utility to help find the issue with flight count doubling
const traceValueChanges = () => {
  // Create a global object to store trace values
  window.__DEBUG_TRACE = window.__DEBUG_TRACE || {
    valueHistory: [],
    addTrace: function(source, data) {
      this.valueHistory.push({
        timestamp: new Date(),
        source,
        data
      });
      
      // Removido o console.log para reduzir logs
      
      // Check for doubling of values if we have a value with initial_flights
      if (data.initial_flights !== undefined && data.total_flights !== undefined) {
        const expectedTotal = (data.initial_flights || 0) + (data.total_flights || 0);
        const providedTotal = data.calculatedTotal || data.totalFlights;
        
        if (providedTotal && Math.abs(providedTotal - expectedTotal) > 0.1) {
          // Removido o console.warn para reduzir logs
        }
      }
    },
    getHistory: function() {
      return this.valueHistory;
    },
    printSummary: function() {
      // Removido o console.log para reduzir logs
    }
  };
  
  // Create keyboard shortcut to print summary (Ctrl+Shift+D)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      window.__DEBUG_TRACE.printSummary();
    }
  });
  
  return window.__DEBUG_TRACE;
};

export const debugTrace = traceValueChanges();