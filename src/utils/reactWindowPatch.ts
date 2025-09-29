/**
 * Patch para corrigir o bug do react-window com Object.values em objetos null/undefined
 * Este patch intercepta chamadas para Object.values e garante que nunca seja chamado
 * com null ou undefined, evitando o erro "Cannot convert undefined or null to object"
 */

// Salvar a implementação original do Object.values
const originalObjectValues = Object.values;

// Criar uma versão segura que verifica null/undefined
const safeObjectValues = (obj: any) => {
  if (obj === null || obj === undefined) {
    return [];
  }
  return originalObjectValues(obj);
};

// Aplicar o patch apenas quando necessário
let patchApplied = false;

export function applyReactWindowPatch() {
  if (patchApplied) {
    return;
  }
  
  try {
    // Substituir Object.values por nossa versão segura
    (Object as any).values = safeObjectValues;
    patchApplied = true;
    console.log('React Window patch aplicado com sucesso');
  } catch (error) {
    console.warn('Falha ao aplicar patch do React Window:', error);
  }
}

export function removeReactWindowPatch() {
  if (!patchApplied) {
    return;
  }
  
  try {
    // Restaurar a implementação original
    (Object as any).values = originalObjectValues;
    patchApplied = false;
    console.log('React Window patch removido');
  } catch (error) {
    console.warn('Falha ao remover patch do React Window:', error);
  }
}

// Auto-aplicar o patch quando o módulo for importado
if (typeof window !== 'undefined') {
  applyReactWindowPatch();
}
