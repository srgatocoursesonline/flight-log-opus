-- Função para executar SQL diretamente
-- Use esta função quando precisar executar comandos SQL dinâmicos

CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao executar SQL: %', SQLERRM;
  RETURN false;
END;
$$;

-- Conceder permissões de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;