-- ============================================
-- POST-RESTORE: re-aplica grants essenciais (dump veio com --no-privileges)
-- ============================================
-- Idempotente. Roda DEPOIS do pg_restore, garantindo que o gateway e RLS
-- voltem a operar: schema auth (users/sessions/refresh/identities) + public.

GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO flightlog_conn;
GRANT ALL ON TABLE auth.users TO flightlog_conn;
GRANT ALL ON TABLE auth.sessions TO flightlog_conn;
GRANT ALL ON TABLE auth.refresh_tokens TO flightlog_conn;
GRANT ALL ON TABLE auth.identities TO flightlog_conn;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO flightlog_conn;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE auth.sessions TO service_role;
GRANT ALL ON TABLE auth.users TO service_role;
GRANT ALL ON TABLE auth.identities TO service_role;
GRANT ALL ON TABLE auth.refresh_tokens TO service_role;
GRANT USAGE ON SEQUENCE auth.refresh_tokens_id_seq TO service_role;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.email() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.jwt() TO anon, authenticated, service_role;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
