import { useMemo } from 'react';

/**
 * Hook seguro para memorizar um objeto e suas propriedades,
 * evitando o erro "Cannot convert undefined or null to object"
 * que ocorre quando Object.values é chamado em null/undefined.
 * 
 * @param obj Objeto a ser memorizado
 * @returns Versão memorizada do objeto que é segura contra valores null/undefined
 */
export function useSafeMemoizedObject<T extends object>(obj: T | null | undefined): T {
  // Primeiro, criamos uma versão segura do objeto para uso nas dependências
  const safeObj = obj ?? {} as T;
  
  // Extraímos as chaves e valores de forma segura
  const keys = Object.keys(safeObj);
  
  // Criamos um array de valores seguro para usar como dependência
  const deps = keys.map(key => (safeObj as any)[key]);
  
  // Adicionamos o próprio objeto como dependência para detectar mudanças completas
  deps.push(obj);
  
  return useMemo(() => {
    // Se o objeto for null ou undefined, retorna um objeto vazio do mesmo tipo
    if (obj === null || obj === undefined) {
      return {} as T;
    }
    
    return obj;
  }, deps);
}
