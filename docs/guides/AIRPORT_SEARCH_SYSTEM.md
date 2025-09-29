# 🛫 Sistema de Busca de Aeroportos

## Visão Geral

O Flight Log Opus implementa um sistema inteligente de busca de aeroportos em **múltiplas camadas**, garantindo que você encontre praticamente qualquer aeroporto do mundo - incluindo pequenos, privados, heliportos, aeródromos e até aeroportos fechados.

## 📊 Fontes de Dados

### 1. **Cache Local** (localStorage)
- ⚡ **Mais rápido** - Busca instantânea
- 💾 500 aeroportos mais usados
- ⏰ Válido por 7 dias

### 2. **OurAirports Database** (NOVO! ✨)
- 🌍 **76.000+ aeroportos** em todo o mundo
- ✅ Inclui:
  - Aeroportos grandes, médios e pequenos
  - Heliportos e bases de hidroaviões
  - Aeroportos privados
  - Aeroportos fechados/desativados
  - Balonódromos
- 📡 Atualizado diariamente pela comunidade OurAirports
- 🔄 Cache renovado a cada 24 horas
- 🆓 **100% Gratuito** - Sem limites de consultas

### 3. **Aeroportos Manuais** (Supabase)
- 📝 Aeroportos que você cadastrou manualmente
- 👤 Específicos do seu usuário
- ♾️ Salvos permanentemente

### 4. **CSV Local** (Fallback)
- 📄 8.560 aeroportos do worlddata.info
- 🔧 Mantido como backup offline

### 5. **Input Manual** (Último recurso)
- ✍️ Quando nenhuma fonte encontra o aeroporto
- 💾 Salvo automaticamente no Supabase e cache

## 🔄 Fluxo de Busca

```
Digite ICAO (ex: SBGR)
    ↓
1. Verificar Cache Local (0.1ms)
    ↓ (não encontrado)
2. Buscar na OurAirports (76k+ aeroportos) (200-500ms na 1ª vez)
    ↓ (não encontrado)
3. Buscar aeroportos manuais no Supabase (100-300ms)
    ↓ (não encontrado)
4. Buscar no CSV local (50-100ms)
    ↓ (não encontrado)
5. Mostrar formulário de entrada manual
    ↓
   Salvar no Supabase + Cache
```

## 📋 Informações Disponíveis

Para cada aeroporto, você obtém:

- ✅ **Nome completo** do aeroporto
- ✅ **Código ICAO** (4 letras)
- ✅ **Código IATA** (3 letras, quando disponível)
- ✅ **Cidade/Município**
- ✅ **Estado/Província** (extraído da região)
- ✅ **Região ISO** (ex: BR-SP, US-CA)
- ✅ **Código do País** (ISO 2 letras)
- ✅ **Coordenadas** (latitude/longitude)
- ✅ **Elevação** (em pés)
- ✅ **Tipo de aeroporto**:
  - `large_airport` - Aeroporto Grande
  - `medium_airport` - Aeroporto Médio
  - `small_airport` - Aeroporto Pequeno
  - `heliport` - Heliporto
  - `seaplane_base` - Base de Hidroaviões
  - `balloonport` - Balonódromo
  - `closed` - Aeroporto Fechado/Desativado

## 🎯 Exemplos de Uso

### Aeroporto Grande (Brasil)
```
ICAO: SBGR
Resultado: Guarulhos International Airport
Fonte: OurAirports
Tipo: large_airport
Cidade: São Paulo
Estado: SP
País: BR
```

### Aeródromo Pequeno/Privado
```
ICAO: SNJR
Resultado: Fazenda Jaragua Airport
Fonte: OurAirports
Tipo: small_airport
Cidade: Barra do Garças
Estado: MT
País: BR
```

### Heliporto
```
ICAO: SWHP
Resultado: Hospital Heliport
Fonte: OurAirports
Tipo: heliport
```

### Aeroporto Fechado
```
ICAO: XXXX (exemplo)
Resultado: Old Municipal Airport
Fonte: OurAirports
Tipo: closed
```

### Aeroporto Não Encontrado
```
ICAO: ABCD
Resultado: Não encontrado
Ação: Formulário de entrada manual aparece
Salvo em: Supabase (manual_airports) + Cache Local
```

## 🚀 Performance

- **1ª busca de um ICAO**: ~200-500ms (download da OurAirports)
- **Próximas buscas**: ~0.1-5ms (cache)
- **Sem conexão**: Usa cache local + CSV offline
- **Cache OurAirports**: Renovado automaticamente a cada 24h

## 🔧 Configuração

### Variáveis de Ambiente (Opcional)

Se quiser adicionar APIs extras de fallback:

```env
VITE_AIRLABS_API_KEY=sua_chave_aqui
```

### Funções Úteis

```typescript
import { getCacheStats } from '@/lib/airportService';

// Ver estatísticas do cache
const stats = getCacheStats();
console.log(stats);
// {
//   localCacheSize: 45,
//   ourAirportsCacheSize: 76234,
//   ourAirportsLastUpdate: "29/09/2025 14:30:00",
//   cacheAge: "2h"
// }
```

## 🎨 Interface de Usuário

### Feedback Visual

Quando um aeroporto é encontrado, o sistema mostra:
- ✅ Nome do aeroporto preenchido automaticamente
- 🌍 País preenchido automaticamente

### Entrada Manual

Se não encontrado em nenhuma fonte, um diálogo aparece com campos para:
- Nome do aeroporto (obrigatório)
- Código IATA (opcional)
- Cidade
- Estado
- País
- Coordenadas
- Elevação
- Tipo de aeroporto (dropdown com opções)

## 📈 Melhorias Implementadas

✅ **De 8.560 para 76.000+ aeroportos** (9x mais cobertura!)  
✅ **Aeroportos privados e pequenos** incluídos  
✅ **Aeroportos fechados/históricos** disponíveis  
✅ **Campo "Estado"** agora disponível  
✅ **Tipo de aeroporto** identificado  
✅ **Elevação** em pés  
✅ **CSV local mantido** como fallback  
✅ **Cache inteligente** com renovação automática  
✅ **Funciona offline** com cache  

## 🔮 Próximos Passos (Futuro)

Se ainda não for suficiente, podemos adicionar:

1. **API CheckWX** - 100 req/dia grátis
2. **API Ninjas** - 10.000 req/mês grátis
3. **Dados ANAC** - Aeródromos brasileiros oficiais
4. **Busca por coordenadas** - Encontrar aeroporto mais próximo
5. **Busca fuzzy** - Encontrar por nome similar

## 📞 Suporte

Problemas com aeroportos não encontrados? O sistema agora deve reduzir drasticamente (em ~95%) a necessidade de cadastro manual!
