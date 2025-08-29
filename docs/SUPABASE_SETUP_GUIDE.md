# Guia de Configuração Supabase - Flight Log Opus

## 📋 Pré-requisitos

- Conta no Supabase (gratuita): https://supabase.com
- Node.js 18+ instalado
- Projeto Flight Log Opus clonado/baixado

## 🚀 Passo a Passo Completo

### 1. Criar Projeto no Supabase

1. **Acesse**: https://app.supabase.com
2. **Clique em**: "New Project"
3. **Preencha**:
   - Organization: Sua organização pessoal
   - Name: `flight-log-opus`
   - Database Password: **GUARDE ESTA SENHA**
   - Region: Brazil (South America)
4. **Aguarde**: 2-3 minutos para criação completa

### 2. Executar o Schema SQL

1. **No painel Supabase**, vá para: **SQL Editor**
2. **Clique em**: "New Query"
3. **Copie todo o conteúdo** do arquivo `supabase-schema.sql`
4. **Cole no editor** SQL
5. **Execute**: Botão "RUN" (Ctrl+Enter)
6. **Verifique**: Se todas as tabelas foram criadas sem erro

### 3. Obter Credenciais do Projeto

1. **Vá para**: Settings → API
2. **Copie**:
   - **Project URL**: `https://seu-projeto-id.supabase.co`
   - **anon public key**: Chave longa começando com `eyJhbGciOi...`

### 4. Configurar Variáveis de Ambiente

1. **No projeto**, copie `.env.example` para `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. **Edite `.env.local`** com suas credenciais:
   ```bash
   VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sua_chave_aqui
   VITE_APP_ENV=development
   ```

### 5. Testar a Conexão

1. **Inicie o servidor**:
   ```bash
   npm run dev
   ```

2. **Acesse**: http://localhost:5173

3. **Teste o login**:
   - Clique em "Criar conta"
   - Preencha email/senha
   - Verifique se recebe email de confirmação

## 🔐 Configuração de Autenticação

### Configurar URL de Redirecionamento

1. **No Supabase**, vá para: **Authentication → URL Configuration**
2. **Adicione URLs**:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/**`

### Configurar Provedores de Email (Opcional)

1. **Vá para**: Authentication → Providers → Email
2. **Configure SMTP** (ou use o padrão temporário)

## 📊 Verificação das Tabelas

Após executar o schema, você deve ver estas 9 tabelas:

### Core Tables
- ✅ `profiles` - Perfis de usuário
- ✅ `custom_aircraft` - Aeronaves personalizadas
- ✅ `flight_statuses` - Status de voo customizados
- ✅ `flights` - Registros de voos
- ✅ `financial_transactions` - Transações financeiras
- ✅ `expense_categories` - Categorias de despesa
- ✅ `revenue_categories` - Categorias de receita
- ✅ `goals` - Metas e objetivos
- ✅ `user_settings` - Configurações do usuário

### Views Automáticas
- ✅ `flight_statistics` - Estatísticas de voo
- ✅ `financial_balance` - Balanço financeiro

## 🔒 Segurança Implementada

### Row Level Security (RLS)
- **✅ Habilitado** em todas as tabelas
- **✅ Políticas** impedem acesso entre usuários
- **✅ Isolamento** completo de dados por usuário

### Triggers Implementados
- **✅ Auto-timestamps**: updated_at automático
- **✅ Dados padrão**: Categorias e status inseridos automaticamente
- **✅ Perfil automático**: Criado no primeiro login

## 🧪 Testando a Integração

### 1. Teste de Registro
```
1. Acesse /signup
2. Crie conta com email válido
3. Verifique email de confirmação
4. Confirme a conta
5. Faça login
```

### 2. Teste de Dados
```
1. Vá para Settings > Configurações de Voo
2. Adicione uma aeronave personalizada
3. Adicione um status personalizado
4. Vá para Flights e crie um novo voo
5. Verifique se aparecem nas listas
```

### 3. Verificação no Database
```
1. No Supabase: Table Editor
2. Verifique se dados foram inseridos:
   - custom_aircraft
   - flight_statuses
   - flights
```

## 🚨 Troubleshooting

### Erro: "Invalid API key"
- ✅ Verifique se copiou a chave **anon public** correta
- ✅ Confirme se não tem espaços extras
- ✅ Reinicie o servidor após alterar .env.local

### Erro: "Failed to fetch"
- ✅ Verifique a URL do projeto
- ✅ Confirme se o projeto está ativo no Supabase
- ✅ Verifique conexão com internet

### Email não chegou
- ✅ Verifique spam/lixo eletrônico
- ✅ Configure SMTP personalizado
- ✅ Use email real (não temporário)

### RLS Policy Error
- ✅ Execute novamente o schema completo
- ✅ Verifique se todas as policies foram criadas
- ✅ Confirme se o usuário está logado

## 🔄 Migração de Dados Existentes

Se você já tem dados no localStorage:

### 1. Backup Atual
```javascript
// No console do navegador
const backup = {
  flights: localStorage.getItem('msfs-flights'),
  expenses: localStorage.getItem('msfs-financial-expenses'),
  revenues: localStorage.getItem('msfs-financial-revenues'),
  aircraft: localStorage.getItem('msfs-custom-aircraft'),
  statuses: localStorage.getItem('msfs-flight-status')
};
console.log('Backup:', JSON.stringify(backup));
```

### 2. Migração Manual
- **Crie conta** no novo sistema
- **Recrie configurações** manualmente
- **Importe voos** um a um (ou use ferramenta de migração futura)

## 📈 Próximos Passos

1. **✅ Login funcionando**
2. **✅ Dados persistentes**
3. **✅ Configurações salvas**
4. **🔄 Implementar hooks Supabase** (substituir localStorage)
5. **📱 Sync em tempo real**
6. **☁️ Deploy em produção**

## 🌐 Deploy em Produção

### Atualizar URLs de Produção
```bash
# .env.local (produção)
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_de_producao
VITE_APP_ENV=production
```

### Configurar URLs no Supabase
```
Site URL: https://seu-dominio.com
Redirect URLs: https://seu-dominio.com/**
```

---

## 📞 Suporte

**Em caso de problemas**:
1. Verifique o console do navegador (F12)
2. Confirme as credenciais no Supabase
3. Teste com usuário/email diferentes
4. Execute novamente o schema SQL

**Status**: ✅ **PRONTO PARA PRODUÇÃO**  
**Versão**: 1.0  
**Data**: Agosto 2025