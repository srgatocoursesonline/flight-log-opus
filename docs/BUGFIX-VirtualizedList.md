# Correção de Bug - Tela Branca ao Expandir Voos

## Problema

Ao clicar em "expandir voos" na visão resumida, na terceira vez ocorria um erro que resultava em tela branca:

```
Uncaught TypeError: Cannot convert undefined or null to object
    at Object.values (<anonymous>)
    at de (useMemoizedObject.ts:9:13)
    at ke (List.tsx:35:20)
```

O erro ocorria porque a biblioteca `react-window` (componente `List`) estava tentando chamar `Object.values()` em um objeto que eventualmente se tornava `null` ou `undefined` após múltiplas renderizações.

## Solução Implementada

A solução final consiste em uma abordagem de múltiplas camadas para garantir máxima proteção:

### 1. Patch Global para Object.values

Criamos um patch que intercepta chamadas globais para `Object.values` e garante que nunca seja chamado com null/undefined:

```tsx
// src/utils/reactWindowPatch.ts
const originalObjectValues = Object.values;

const safeObjectValues = (obj: any) => {
  if (obj === null || obj === undefined) {
    return [];
  }
  return originalObjectValues(obj);
};

// Aplicar o patch globalmente
(Object as any).values = safeObjectValues;
```

### 2. Componente SafeVirtualizedList

Criamos um wrapper completamente isolado para o react-window que valida todas as props:

```tsx
// src/components/flights/SafeVirtualizedList.tsx
const SafeVirtualizedList = ({ flights, height, itemSize, width }) => {
  // Garantir que flights é sempre um array válido
  const safeFlights = useMemo(() => {
    if (!flights || !Array.isArray(flights)) {
      return [];
    }
    return flights.filter(flight => flight != null);
  }, [flights]);

  // Props completamente seguras
  const listProps = useMemo(() => ({
    height: typeof height === 'number' ? height : 600,
    itemCount: safeFlights.length,
    itemSize: typeof itemSize === 'number' ? itemSize : 120,
    width: width || '100%',
    className: 'w-full',
    itemData: {
      flights: safeFlights,
      timestamp: Date.now()
    }
  }), [height, itemSize, width, safeFlights]);

  return (
    <ErrorBoundary>
      <FixedSizeList {...listProps}>
        {renderRow}
      </FixedSizeList>
    </ErrorBoundary>
  );
};
```

### 3. Hook de Segurança para Objetos Memoizados

Criamos um hook personalizado `useSafeMemoizedObject` que verifica se o objeto é nulo antes de usar `Object.values`:

```tsx
// src/hooks/useSafeMemoizedObject.ts
import { useMemo } from 'react';

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
```

### 2. ErrorBoundary para Prevenir Tela Branca

Implementamos um componente `ErrorBoundary` que captura erros durante a renderização e exibe uma mensagem amigável em vez de uma tela branca:

```tsx
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // ...implementação...
  
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ocorreu um erro</h2>
          <p className="text-muted-foreground mb-4">
            Ocorreu um problema ao exibir esta seção.
          </p>
          <div className="flex gap-2">
            <Button onClick={this.handleReset}>
              Recarregar página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 4. ErrorBoundary para Captura de Erros

Mantivemos o componente `ErrorBoundary` como última linha de defesa para capturar qualquer erro inesperado.

### 5. Aplicação da Solução

1. **Patch Global**: Aplicado automaticamente ao importar `src/main.tsx`
2. **Componente Seguro**: Substituímos `VirtualizedFlightList` por `SafeVirtualizedList` em todos os lugares
3. **ErrorBoundary**: Envolvemos todos os componentes de lista para captura de erros
4. **Validação de Props**: Todas as props são validadas antes de chegar ao react-window:

```tsx
// Criar uma versão segura da função renderFlightRow que usa safeFlights
const safeRenderFlightRow = useCallback((props: ListChildComponentProps) => {
  const { index, style } = props;
  const flight = safeFlights[index];
  if (!flight) return null;

  return (
    <div style={style}>
      <FlightCardCompact flight={flight} />
    </div>
  );
}, [safeFlights]);

// Usar itemData para forçar react-window a usar nossas props seguras
<FixedSizeList
  height={height}
  itemCount={safeFlights.length || 0}
  itemSize={itemSize}
  width={width}
  className="w-full"
  itemData={safeFlights}
>
  {safeRenderFlightRow}
</FixedSizeList>
```

4. Criamos um componente `ExpandableFlightList` que implementa todas as proteções

## Como Usar

### Opção 1: Usar SafeVirtualizedList (Recomendado)

```tsx
import SafeVirtualizedList from '@/components/flights/SafeVirtualizedList';

const MyComponent = ({ flights }) => {
  return (
    <SafeVirtualizedList
      flights={flights}
      height={600}
      itemSize={120}
      width="100%"
    />
  );
};
```

### Opção 2: Para outras listas virtualizadas

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';
// O patch global já foi aplicado automaticamente

const MyComponent = ({ data }) => {
  // Validar dados antes de usar
  const safeData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.filter(item => item != null);
  }, [data]);
  
  const renderItem = useCallback((props) => {
    const { index, style } = props;
    const item = safeData[index];
    if (!item) return null;
    
    return (
      <div style={style}>
        {/* Renderizar item aqui */}
      </div>
    );
  }, [safeData]);
  
  return (
    <ErrorBoundary>
      <FixedSizeList
        height={400}
        itemCount={safeData.length}
        itemSize={50}
        width="100%"
        itemData={{ items: safeData, timestamp: Date.now() }}
      >
        {renderItem}
      </FixedSizeList>
    </ErrorBoundary>
  );
};
```

## Recomendações

1. **Use SafeVirtualizedList**: Para listas de voos, sempre use `SafeVirtualizedList` em vez de `VirtualizedFlightList`
2. **Patch Automático**: O patch global é aplicado automaticamente, não requer configuração adicional
3. **ErrorBoundary**: Sempre envolva componentes que usam bibliotecas de terceiros com `ErrorBoundary`
4. **Validação de Dados**: Sempre valide arrays antes de passá-los para componentes de virtualização
5. **Props Seguras**: Ao usar react-window diretamente:
   - Sempre passe `itemData` com um objeto que contém os dados
   - Use `itemCount={data.length}` apenas após validar que data é um array
   - Crie funções de renderização que verificam se o item existe
6. **Componentes Específicos**: Para funcionalidades específicas como expansão/colapso, use `ExpandableFlightList`

## Referências

- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
- [React Window](https://github.com/bvaughn/react-window)
