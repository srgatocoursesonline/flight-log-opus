-- ============================================
-- RECRIAR TABELA CUSTOM_AIRCRAFT
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: Execute APÓS criar a tabela profiles

-- 1. Recriar tabela custom_aircraft
CREATE TABLE IF NOT EXISTS public.custom_aircraft (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  manufacturer TEXT,
  aircraft_type TEXT DEFAULT 'general' CHECK (
    aircraft_type IN (
      'commercial', 'business', 'general', 
      'bush', 'aerobatic', 'glider', 
      'helicopter', 'military', 'other'
    )
  ),
  description TEXT,
  hourly_rate NUMERIC(10, 2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Comentários nas colunas para documentação
COMMENT ON COLUMN custom_aircraft.name IS 'Nome da aeronave personalizada';
COMMENT ON COLUMN custom_aircraft.manufacturer IS 'Fabricante da aeronave';
COMMENT ON COLUMN custom_aircraft.aircraft_type IS 'Tipo de aeronave (commercial, business, general, etc.)';
COMMENT ON COLUMN custom_aircraft.description IS 'Descrição detalhada da aeronave';
COMMENT ON COLUMN custom_aircraft.hourly_rate IS 'Taxa por hora de voo da aeronave';
COMMENT ON COLUMN custom_aircraft.is_default IS 'Indica se é uma aeronave padrão do sistema';
COMMENT ON COLUMN custom_aircraft.is_active IS 'Indica se a aeronave está ativa para uso';

-- 3. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_custom_aircraft_user_id ON custom_aircraft(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_aircraft_is_active ON custom_aircraft(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_aircraft_is_default ON custom_aircraft(is_default);
CREATE INDEX IF NOT EXISTS idx_custom_aircraft_type ON custom_aircraft(aircraft_type);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE custom_aircraft ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança
CREATE POLICY "Users can view own custom aircraft" ON custom_aircraft
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom aircraft" ON custom_aircraft
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom aircraft" ON custom_aircraft
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom aircraft" ON custom_aircraft
  FOR DELETE USING (auth.uid() = user_id AND is_default = false);

-- 6. Inserir aeronaves padrão
-- NOTA: Estas aeronaves serão inseridas para todos os usuários existentes
-- Para novos usuários, use um trigger ou função para criar automaticamente

INSERT INTO public.custom_aircraft (user_id, name, manufacturer, aircraft_type, description, hourly_rate, is_default, is_active)
SELECT 
  p.id as user_id,
  aircraft.name,
  aircraft.manufacturer,
  aircraft.aircraft_type,
  aircraft.description,
  aircraft.hourly_rate,
  true as is_default,
  true as is_active
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('Cessna 172', 'Cessna', 'general', 'Aeronave de treinamento e voos recreativos', 150.00),
    ('Piper Cherokee', 'Piper', 'general', 'Aeronave monomotor para voos de instrução', 140.00),
    ('Beechcraft Baron', 'Beechcraft', 'business', 'Aeronave bimotor executiva', 450.00),
    ('Cirrus SR22', 'Cirrus', 'general', 'Aeronave moderna com paraquedas balístico', 380.00),
    ('King Air 350', 'Beechcraft', 'business', 'Turboélice executivo de médio porte', 2800.00),
    ('Citation CJ4', 'Cessna', 'business', 'Jato executivo leve', 3200.00),
    ('Robinson R44', 'Robinson', 'helicopter', 'Helicóptero leve de 4 lugares', 1200.00),
    ('Bell 407', 'Bell', 'helicopter', 'Helicóptero utilitário médio', 2500.00),
    ('Extra 300', 'Extra', 'aerobatic', 'Aeronave acrobática de alta performance', 350.00),
    ('Piper Cub', 'Piper', 'bush', 'Aeronave clássica para voos em pistas curtas', 120.00),
    ('Cessna 208 Caravan', 'Cessna', 'commercial', 'Aeronave utilitária de carga e passageiros', 1800.00),
    ('DHC-6 Twin Otter', 'De Havilland', 'commercial', 'Aeronave STOL para operações especiais', 2200.00)
) AS aircraft(name, manufacturer, aircraft_type, description, hourly_rate)
WHERE NOT EXISTS (
  SELECT 1 FROM public.custom_aircraft ca 
  WHERE ca.user_id = p.id AND ca.name = aircraft.name
);

SELECT 'Tabela custom_aircraft recriada com sucesso!' as status;
SELECT COUNT(*) || ' aeronaves padrão inseridas' as aircraft_count 
FROM custom_aircraft WHERE is_default = true;