// Teste rápido para verificar busca de aeroportos
import { fetchAirportByIcao } from './src/lib/airportService.js';

async function testSearch() {
  console.log('🧪 Testando busca de aeroportos...');
  
  // Testar KCDA (que existe no CSV)
  console.log('\n🔍 Buscando KCDA...');
  const kcdaResult = await fetchAirportByIcao('KCDA');
  console.log('KCDA Result:', kcdaResult);
  
  // Testar SBGR (conhecido)
  console.log('\n🔍 Buscando SBGR...');
  const sbgrResult = await fetchAirportByIcao('SBGR');
  console.log('SBGR Result:', sbgrResult);
  
  // Testar um que não existe
  console.log('\n🔍 Buscando XXXX...');
  const xxxResult = await fetchAirportByIcao('XXXX');
  console.log('XXXX Result:', xxxResult);
}

testSearch().catch(console.error);