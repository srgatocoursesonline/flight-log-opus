# Sistema de Configuração de Voo - Flight Configuration System

## Visão Geral

O Sistema de Configuração de Voo foi implementado para permitir que os usuários personalizem aeronaves e status de voo com taxas horárias personalizadas. Este sistema integra-se completamente com o formulário de voos, permitindo que aeronaves e status customizados apareçam nas listas de seleção.

## Componentes Principais

### 1. Hooks de Gerenciamento

#### `useAircraftManager.ts`
- **Localização**: `src/hooks/useAircraftManager.ts`
- **Funcionalidade**: Gerencia aeronaves customizadas com propriedades específicas
- **Características**:
  - Nome, fabricante, tipo de aeronave
  - Taxa horária de CR (Career Rating)
  - Status ativo/inativo
  - Persistência no localStorage
  - Aeronaves padrão do MSFS

**Tipos de Aeronave Suportados**:
- `commercial` - Comercial
- `business` - Executiva
- `general` - Aviação Geral
- `bush` - Bush/Sport
- `aerobatic` - Acrobática
- `glider` - Planador
- `helicopter` - Helicóptero
- `military` - Militar
- `other` - Outros

#### `useFlightStatusManager.ts`
- **Localização**: `src/hooks/useFlightStatusManager.ts`
- **Funcionalidade**: Gerencia status de voo customizados
- **Características**:
  - Nome, ícone, cor personalizada
  - Multiplicador de CR por hora
  - Descrição personalizada
  - Status ativo/inativo
  - Status padrão protegidos

**Status Padrão**:
- 📅 Planejado (1.0x CR)
- ✈️ Em Voo (1.0x CR)
- ✅ Completado (1.0x CR)
- ❌ Cancelado (0x CR)
- ⏰ Atrasado (1.0x CR)
- 🚨 Emergência (1.5x CR)

### 2. Interface de Usuário

#### `FlightConfigManager.tsx`
- **Localização**: `src/components/flight/FlightConfigManager.tsx`
- **Interface**: Sistema de abas com dois painéis:

##### Aba "Aeronaves"
- Lista de aeronaves customizadas
- Botão "Nova Aeronave" para adicionar
- Switch para ativar/desativar aeronaves
- Botão de exclusão para aeronaves não-padrão
- Restauração para configurações padrão

##### Aba "Status"
- Lista de status de voo
- Botão "Novo Status" para adicionar
- Configuração de multiplicador CR
- Seletor de cor personalizada
- Switch para ativar/desativar

#### Campos do Formulário

**Nova Aeronave**:
- Nome* (obrigatório)
- Fabricante
- Tipo (dropdown)
- CR por Hora
- Descrição

**Novo Status**:
- Nome* (obrigatório)
- Ícone
- Cor (color picker)
- Multiplicador CR
- Descrição

## Integração com Sistema de Voos

### 3. Formulário de Voos Atualizado

#### `AddFlightModal.tsx`
**Atualizações Implementadas**:
- Importação dos hooks `useAircraftManager` e `useFlightStatusManager`
- Lista dinâmica de aeronaves: customizadas + padrão MSFS
- Lista dinâmica de status: customizados + padrão
- Priorização de aeronaves customizadas no topo da lista

**Comportamento**:
- Aeronaves customizadas aparecem primeiro na lista
- Status customizados aparecem com ícones e nomes
- Fallback para listas padrão se não houver customizações

#### `Flights.tsx` (Página de Voos)
**Atualizações**:
- Filtro de status usa lista dinâmica
- Status customizados aparecem no filtro
- Integração completa com o sistema de status

#### `FlightCard.tsx`
**Atualizações**:
- Exibição de status customizados com cores e ícones
- Fallback para status padrão
- Cores dinâmicas baseadas na configuração

## Localização na Interface

### Settings > Configurações de Voo
1. Navegue para **Settings** (Configurações)
2. Expanda a seção **"Configurações de Voo"**
3. Use as abas **"Aeronaves"** e **"Status"**

### Formulário de Voos
1. Navegue para **Flights** (Voos)
2. Clique em **"Novo Voo"**
3. As aeronaves customizadas aparecem no dropdown "Aircraft"
4. Os status customizados aparecem no dropdown "Status"

## Persistência de Dados

### localStorage Keys
- `msfs-custom-aircraft`: Aeronaves customizadas
- `msfs-flight-status`: Status de voo customizados

### Estrutura de Dados

**CustomAircraft**:
```typescript
{
  id: string;
  name: string;
  manufacturer: string;
  type: AircraftType;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  hourlyRate: number;
}
```

**FlightStatus**:
```typescript
{
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  hourlyMultiplier: number;
}
```

## Funcionalidades

### Aeronaves
- ✅ Adicionar aeronaves customizadas
- ✅ Configurar taxa horária CR
- ✅ Ativar/desativar aeronaves
- ✅ Excluir aeronaves não-padrão
- ✅ Restaurar configurações padrão
- ✅ Integração com formulário de voos

### Status
- ✅ Criar status customizados
- ✅ Configurar multiplicador CR
- ✅ Personalizar cores e ícones
- ✅ Ativar/desativar status
- ✅ Proteger status padrão
- ✅ Integração com filtros e formulários

## Validações

### Aeronaves
- Nome obrigatório
- Taxa horária numérica (≥ 0)
- Tipo válido da lista predefinida

### Status
- Nome obrigatório
- Cor válida (hex)
- Multiplicador numérico (≥ 0)
- Proteção contra exclusão de status padrão

## Benefícios

1. **Personalização Completa**: Usuários podem criar aeronaves e status específicos
2. **Integração Seamless**: Funciona automaticamente com todos os formulários
3. **Flexibilidade**: Taxa horária e multiplicadores personalizados
4. **Usabilidade**: Interface intuitiva com abas organizadas
5. **Persistência**: Configurações mantidas entre sessões
6. **Segurança**: Proteção de dados padrão essenciais

## Próximos Passos Potenciais

- [ ] Importação/exportação de configurações
- [ ] Categorias de aeronaves mais específicas
- [ ] Histórico de mudanças
- [ ] Backup na nuvem
- [ ] Compartilhamento de configurações

---

**Status**: ✅ Implementado e Funcional  
**Versão**: 1.0  
**Data**: Agosto 2025