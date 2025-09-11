# Sistema Financeiro - Financial System API

## Visão Geral

O Sistema Financeiro do Flight Log Opus oferece controle completo de receitas e despesas relacionadas à aviação, com categorias personalizáveis e cálculos automáticos em tempo real.

## Hooks Principais

### `useFinancial.ts`

#### Interface Transaction
```typescript
interface Transaction {
  id: string;
  type: 'revenue' | 'expense';
  description: string;
  amount: number;
  date: string;
  category: string;
}
```

#### Métodos Disponíveis

**Receitas**:
- `addRevenue(revenue: Omit<Transaction, 'id' | 'type'>)`: Adiciona nova receita
- `updateRevenue(id: string, updates: Partial<Transaction>)`: Atualiza receita existente
- `deleteRevenue(id: string)`: Remove receita

**Despesas**:
- `addExpense(expense: Omit<Transaction, 'id' | 'type'>)`: Adiciona nova despesa
- `updateExpense(id: string, updates: Partial<Transaction>)`: Atualiza despesa existente
- `deleteExpense(id: string)`: Remove despesa

**Estatísticas**:
- `getFinancialStats()`: Retorna estatísticas financeiras completas

#### Cálculo Financeiro

```typescript
const getFinancialStats = () => {
  // Receita = Base mínima + CR dos voos reais + receitas lançadas
  const baseRevenue = 5922235;
  const realFlightsCR = flightStats.totalCR || 0;
  const additionalRevenues = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  const totalRevenue = baseRevenue + realFlightsCR + additionalRevenues;

  // Despesas
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Lucro
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    baseRevenue,
    realFlightsCR,
    additionalRevenues,
    // ... outras estatísticas
  };
};
```

### `useExpenseCategories.ts`

#### Interface ExpenseCategory
```typescript
interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
}
```

#### Categorias Padrão
- ⛽ **Combustível**: Despesas com combustível de aeronaves
- 🧽 **Lavagem do Avião**: Serviços de limpeza
- 🔧 **Manutenção**: Reparos e manutenção preventiva
- 🚗 **Translado**: Transporte para/de aeroportos
- ✈️ **Compra de Nova Aeronave**: Aquisição de aeronaves
- 🎨 **Pintura**: Personalização e pintura

#### Métodos
- `addCategory(category)`: Adiciona nova categoria
- `updateCategory(id, updates)`: Atualiza categoria
- `deleteCategory(id)`: Remove categoria (protege padrão)
- `toggleCategoryActive(id)`: Ativa/desativa categoria
- `getActiveCategories()`: Retorna categorias ativas

### `useRevenueCategories.ts`

#### Interface RevenueCategory
```typescript
interface RevenueCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
}
```

#### Categorias Padrão
- 💰 **Renda Passiva**: Investimentos e rendimentos
- 📋 **Contratos Especiais**: Voos exclusivos e especiais
- 🏆 **Bônus de Desempenho**: Prêmios por performance
- 🤝 **Patrocínio**: Acordos comerciais e patrocínios
- 👨‍🏫 **Instrução de Voo**: Receitas de treinamento
- 💵 **Outras Receitas**: Receitas diversas

## Componentes da Interface

### `Financial.tsx` (Página Principal)

#### Layout de 3 Colunas
1. **Sistema de Receitas** (coluna 1)
2. **Sistema de Despesas** (coluna 2)  
3. **Resumo de Performance** (coluna 3)

#### Cards de Estatísticas
- **Receita Total (CR)**: Base + Voos + Receitas extras
- **Custos Totais (CR)**: Soma de todas as despesas
- **Lucro Líquido (CR)**: Receita - Despesas
- **Margem de Lucro**: Percentual de margem

### Modais de Transação

#### `AddRevenueModal.tsx`
- Seleção de categoria de receita
- Valor, descrição e data
- Validação de campos obrigatórios

#### `AddExpenseModal.tsx`
- Seleção de categoria de despesa
- Valor, descrição e data
- Validação de campos obrigatórios

### Listas de Transações

#### `RevenuesList.tsx`
- Lista paginada de receitas
- Ações: editar, excluir
- Agrupamento por categoria
- Estado vazio com call-to-action

#### `ExpensesList.tsx`
- Lista paginada de despesas
- Ações: editar, excluir
- Cores baseadas no valor (>10k vermelho, >5k laranja)
- Estado vazio com call-to-action

### Gerenciadores de Categoria

#### `RevenueCategoriesManager.tsx`
- CRUD completo de categorias de receita
- Interface nas Settings
- Proteção de categorias padrão

#### `ExpenseCategoriesManager.tsx`
- CRUD completo de categorias de despesa
- Interface nas Settings
- Proteção de categorias padrão

## Persistência

### localStorage Keys
- `msfs-financial-expenses`: Array de despesas
- `msfs-financial-revenues`: Array de receitas
- `msfs-expense-categories`: Categorias de despesa
- `msfs-revenue-categories`: Categorias de receita

### Estrutura de Dados

**Transaction Storage**:
```json
{
  "id": "1635789123456",
  "type": "revenue",
  "description": "Renda de investimentos",
  "amount": 50000,
  "date": "2025-08-27",
  "category": "passive-income"
}
```

**Category Storage**:
```json
{
  "id": "fuel",
  "name": "Combustível",
  "icon": "⛽",
  "description": "Despesas com combustível de aeronaves",
  "isDefault": true,
  "isActive": true
}
```

## Validações

### Transações
- **Descrição**: Obrigatória, min 3 caracteres
- **Valor**: Obrigatório, > 0
- **Data**: Obrigatória, formato ISO
- **Categoria**: Deve existir e estar ativa

### Categorias
- **Nome**: Obrigatório, único
- **Ícone**: Obrigatório (emoji)
- **Proteção**: Categorias padrão não podem ser excluídas

## Integração com Voos

### Cálculo de CR Base
- Base fixa: **5.922.235 CR**
- Voos reais: Soma de `careerRating` onde `isExample: false`
- Total de voos e horas computados automaticamente

### Atualização Automática
- Uso do `autoRefresh()` após mudanças
- Recálculo em tempo real
- Sincronização entre componentes

## Funcionalidades Avançadas

### Formatação
- Números em formato brasileiro (PT-BR)
- Valores em CR (Career Rating)
- Datas em formato local

### Performance
- Lazy loading de listas grandes
- Debounce em buscas
- Memoização de cálculos

### UX/UI
- Feedback visual imediato
- Estados de loading
- Confirmação para exclusões
- Toast notifications

## API de Exemplo

```typescript
// Adicionar receita
const { addRevenue } = useFinancial();
addRevenue({
  description: "Bônus mensal",
  amount: 25000,
  date: "2025-08-27",
  category: "performance-bonus"
});

// Obter estatísticas
const { getFinancialStats } = useFinancial();
const stats = getFinancialStats();
console.log(`Lucro: ${stats.netProfit} CR`);

// Gerenciar categorias
const { addCategory } = useExpenseCategories();
addCategory({
  name: "Seguro",
  icon: "🛡️",
  description: "Seguro de aeronaves",
  isActive: true
});
```

## Estados de Erro

### Tratamento
- Try-catch em operações localStorage
- Fallbacks para dados corrompidos
- Mensagens de erro user-friendly
- Recovery automático quando possível

### Logs
- Console.error para debugging
- Toast notifications para usuário
- Preservação de dados em caso de erro

---

**Status**: ✅ Implementado e Estável  
**Cobertura**: Receitas + Despesas + Categorias  
**Persistência**: localStorage  
**Performance**: Otimizada