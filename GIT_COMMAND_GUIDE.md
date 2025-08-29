# Guia de Comandos Git para o Projeto Flight Log Opus

Este guia fornece instruções passo a passo para operações comuns do Git, como verificar o status, fazer commit de alterações e enviar para o GitHub.

## Fluxo Básico do Git

### 1. Verificar o Status do Seu Repositório

Para ver quais arquivos foram modificados, quais estão preparados para commit e quais não estão sendo rastreados:

```bash
git status
```

### 2. Adicionar Arquivos à Área de Staging

Para adicionar todos os arquivos modificados e novos à área de staging:

```bash
git add .
```

Para adicionar arquivos específicos à área de staging:

```bash
git add arquivo1.ts arquivo2.tsx
```

Para adicionar todos os arquivos de um tipo específico:

```bash
git add *.ts
```

### 3. Fazer Commit das Alterações

Para fazer commit das suas alterações preparadas com uma mensagem:

```bash
git commit -m "Sua mensagem detalhada de commit aqui"
```

Para as alterações recentes deste projeto, use:

```bash
git commit -m "refactor: reorganizar estrutura do projeto e melhorar documentação

- Criada estrutura lógica de diretórios para arquivos de banco de dados
- Movidos arquivos SQL para diretórios apropriados
- Criada documentação abrangente
- Atualizado README.md com nova estrutura do projeto
- Melhorado tratamento de erros na gestão de dados de carreira"
```

### 4. Enviar Alterações para o GitHub

Para enviar seus commits para o repositório remoto:

```bash
git push origin main
```

Se você estiver em um branch diferente, substitua `main` pelo nome do seu branch:

```bash
git push origin nome-do-seu-branch
```

## Comandos Úteis Adicionais

### Verificar Diferença Entre Diretório de Trabalho e Último Commit

```bash
git diff
```

### Verificar Histórico de Commits

```bash
git log
```

Para um log mais conciso:

```bash
git log --oneline
```

### Criar e Mudar para um Novo Branch

```bash
git checkout -b nome-do-novo-branch
```

### Alternar Entre Branches Existentes

```bash
git checkout nome-do-branch
```

### Descartar Alterações no Diretório de Trabalho

Para descartar alterações em um arquivo específico:

```bash
git checkout -- nome-do-arquivo
```

Para descartar todas as alterações:

```bash
git checkout -- .
```

### Limpar o Repositório

Para remover arquivos e diretórios não rastreados:

```bash
git clean -fd
```

## Fluxo Completo para as Alterações Atuais do Projeto

Execute estes comandos em ordem:

```bash
# 1. Verificar status atual
git status

# 2. Adicionar todas as alterações
git add .

# 3. Fazer commit com mensagem descritiva
git commit -m "refactor: reorganizar estrutura do projeto e melhorar documentação

- Criada estrutura lógica de diretórios para arquivos de banco de dados
- Movidos arquivos SQL para diretórios apropriados
- Criada documentação abrangente
- Atualizado README.md com nova estrutura do projeto
- Melhorado tratamento de erros na gestão de dados de carreira"

# 4. Enviar para o GitHub
git push origin main
```

## Limpeza Após Commit

Após o commit bem-sucedido, você pode querer remover os arquivos duplicados que foram movidos:

```bash
# Remover arquivos SQL antigos do diretório raiz
rm supabase-career-functions.sql
rm supabase-exec-sql.sql
rm supabase-fix-all-career-issues.sql
rm supabase-fix-profiles.sql
rm supabase-schema-update.sql
rm supabase-schema.sql

# Remover arquivos de documentação antigos do diretório raiz
rm CORRECAO_DADOS_CARREIRA.md
rm SUPABASE_SETUP_INSTRUCTIONS.md
```

Em seguida, faça commit dessas remoções:

```bash
git add .
git commit -m "chore: remover arquivos duplicados após reorganização"
git push origin main
```