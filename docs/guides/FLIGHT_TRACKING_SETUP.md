# Flight Tracking System - MVP Sprint 1

Sistema de tracking de voos MSFS em tempo real com WebSocket e persistência no banco de dados.

## 🏗️ Arquitetura

```
MSFS 2024 → SimConnect → Companion (Node.js) → WebSocket → Backend → Supabase
                                    ↓
                              Frontend (Live Map)
```

## 🚀 Configuração Rápida

### 1. Banco de Dados

```sql
-- Execute o schema no Supabase
psql -h your-supabase-host -U postgres -d postgres -f backend/flight_tracking_schema.sql
```

### 2. Backend Flight Tracking

```bash
cd backend

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Editar .env com suas credenciais Supabase

# Iniciar servidor de flight tracking
npm run start:tracking
```

O servidor estará rodando em `http://localhost:3001`

### 3. Companion MSFS

```bash
cd companion

# Configurar .env
cp .env.example .env

# Registrar dispositivo (obter token)
curl -X POST http://localhost:3001/devices/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"your-user-id","deviceName":"MSFS Companion Desktop"}'

# Copiar o deviceToken retornado para .env
# DEVICE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Iniciar companion
npm run dev
```

### 4. Testar Conexão

1. Abra o MSFS 2024
2. Carregue qualquer aeronave
3. Verifique os logs do companion:
   ```
   ✅ Conectado ao MSFS
   ✅ Conectado ao Flight Tracking WebSocket
   ✅ Autenticado no Flight Tracking: MSFS Companion Desktop
   ```

## 📡 API Endpoints

### WebSocket

**Endpoint:** `ws://localhost:3001/flight-tracking`

**Mensagens:**

```javascript
// Autenticação
{
  "type": "auth",
  "deviceToken": "your_jwt_token"
}

// Iniciar voo
{
  "type": "start_flight",
  "data": {
    "aircraft": "Cessna 172",
    "latitude": 47.4502,
    "longitude": -122.3088
  }
}

// Dados de voo
{
  "type": "flight_data",
  "data": {
    "sessionId": "uuid",
    "latitude": 47.4502,
    "longitude": -122.3088,
    "altitude": 1500,
    "groundSpeed": 120,
    "indicatedAirspeed": 110,
    "verticalSpeed": 500,
    "heading": 270,
    "onGround": false,
    "aircraft": "Cessna 172",
    "timestamp": 1640995200000
  }
}

// Finalizar voo
{
  "type": "end_flight",
  "data": {
    "sessionId": "uuid",
    "latitude": 47.4502,
    "longitude": -122.3088
  }
}
```

### REST API

**Registrar Dispositivo:**
```http
POST /devices/register
Content-Type: application/json

{
  "userId": "user-uuid",
  "deviceName": "MSFS Companion Desktop"
}
```

**Listar Voos:**
```http
GET /flights/{userId}?limit=50&offset=0
```

**Detalhes do Voo:**
```http
GET /flights/{userId}/{sessionId}
```

**Health Check:**
```http
GET /health
```

## 🗄️ Estrutura do Banco

### Tabelas Principais

- **`flight_sessions`** - Sessões de voo (início, fim, aeronave)
- **`flight_points`** - Pontos de telemetria (lat/lon/alt/velocidade)
- **`authorized_devices`** - Dispositivos autorizados

### Views

- **`flight_session_stats`** - Estatísticas calculadas dos voos

### Funções

- **`start_flight_session()`** - Iniciar nova sessão
- **`end_flight_session()`** - Finalizar sessão
- **`add_flight_point()`** - Adicionar ponto de telemetria

## 🔧 Desenvolvimento

### Logs Úteis

**Backend:**
```bash
# Logs do flight tracking
npm run start:tracking

# Verificar conexões ativas
curl http://localhost:3001/health
```

**Companion:**
```bash
# Logs detalhados
DEBUG=true npm run dev
```

### Troubleshooting

**Erro de autenticação:**
- Verificar se `DEVICE_TOKEN` está correto no `.env`
- Registrar novo dispositivo se necessário

**SimConnect não conecta:**
- MSFS deve estar rodando
- Verificar se SimConnect está habilitado nas configurações

**WebSocket desconecta:**
- Verificar se backend está rodando na porta 3001
- Verificar firewall/antivírus

## 📊 Próximos Passos (Sprint 2)

- [ ] Frontend com mapa ao vivo (Leaflet)
- [ ] Interface de logbook
- [ ] Métricas e estatísticas
- [ ] Detecção automática de eventos (takeoff/landing)

## 🔐 Segurança

- Tokens JWT para autenticação de dispositivos
- Validação de sessões no backend
- Rate limiting nos endpoints
- Sanitização de dados de entrada

---

**Desenvolvido para Flight Log Opus - MVP Sprint 1**