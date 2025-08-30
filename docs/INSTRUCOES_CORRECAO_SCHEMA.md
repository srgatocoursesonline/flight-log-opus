# 🔧 Correção do Schema da Tabela Profiles

## ❌ Problema Identificado

O erro no console do navegador indica que a coluna `achievements` não existe na tabela `profiles` do Supabase:

```
Erro ao salvar perfil: {code: P0ST204, details: null, hint: null, message: Could not find the 'achievements' column of 'profiles' in the schema cache}
```

## ✅ Solução

Foi criado um script SQL para adicionar as colunas que estão faltando na tabela `profiles`.

### Passos para Correção:

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione o projeto `flight-log-opus`

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Execute o Script**
   - Copie todo o conteúdo do arquivo `database/add_achievements_column.sql`
   - Cole no SQL Editor
   - Clique em "Run" para executar

4. **Verifique a Execução**
   - O script mostrará mensagens de confirmação
   - Verifique se todas as colunas foram criadas com sucesso

### Colunas que serão adicionadas:

- `achievements` (TEXT) - Para armazenar conquistas do piloto
- `perfect_flights` (INTEGER) - Contador de voos perfeitos
- `career_started` (TEXT) - Data de início da carreira
- `description` (TEXT) - Descrição/biografia do piloto

## 🔄 Após a Execução

1. **Recarregue a aplicação** no navegador
2. **Teste o modal de edição** de perfil
3. **Verifique se não há mais erros** no console

## 📝 Arquivos Atualizados

- ✅ `src/lib/supabase.ts` - Schema TypeScript atualizado
- ✅ `src/hooks/useProfile.ts` - Interface ProfileData atualizada
- ✅ `database/add_achievements_column.sql` - Script de correção criado

## 🚨 Importante

**Execute o script SQL ANTES de testar a funcionalidade de edição de perfil**, caso contrário o erro persistirá.

---

*Após executar o script e confirmar que tudo está funcionando, você pode deletar este arquivo.*