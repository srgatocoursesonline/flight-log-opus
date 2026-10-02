-- ============================================
-- RLS PARA TABELAS CRIADAS SEM POLÍTICAS
-- ============================================
-- flight_tracks schema / scripts de manutenção criaram tabelas sem
-- RLS. Como o gateway obedece foi RLS (PostgREST semantic), tabelas
-- sem política ficariam legíveis/publicáveis por qualquer anon key.
-- Compatível com o que o Supabase prod usa: isolation por user_id.

-- authorized_devices, flight_sessions, manual_airports: isoladas por user_id
ALTER TABLE public.authorized_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_airports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS authorized_devices_isolated ON public.authorized_devices;
CREATE POLICY authorized_devices_isolated ON public.authorized_devices
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS flight_sessions_isolated ON public.flight_sessions;
CREATE POLICY flight_sessions_isolated ON public.flight_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS manual_airports_isolated ON public.manual_airports;
CREATE POLICY manual_airports_isolated ON public.manual_airports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- flight_points: crianças de flight_session (sem user_id). Isola via
-- session pertencente ao usuário autenticado.
ALTER TABLE public.flight_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS flight_points_select_own ON public.flight_points;
CREATE POLICY flight_points_select_own ON public.flight_points
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.flight_sessions fs
      WHERE fs.id = flight_session_id AND fs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS flight_points_write_own ON public.flight_points;
CREATE POLICY flight_points_write_own ON public.flight_points
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.flight_sessions fs
      WHERE fs.id = flight_session_id AND fs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.flight_sessions fs
      WHERE fs.id = flight_session_id AND fs.user_id = auth.uid()
    )
  );

-- O backend Express escreve via service_role (BYPASSRLS) — coberto.
