import React from 'react';
import TodCalculator from '@/components/tools/tod';

/**
 * Página do TOD Calculator
 * Ferramenta para cálculo de Top of Descent em planejamento de voo
 */
export default function TodCalculatorPage() {
  return (
    <>

      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <TodCalculator />
      </div>
    </>
  );
}