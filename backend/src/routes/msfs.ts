/**
 * Rotas para integração com MSFS 2024
 * Endpoints para receber e processar dados de voo do companion service
 */

import { Router } from 'express';
import { z } from 'zod';
import { findNearestAirport } from '../services/airportService.js';
import { calculateFlightDistance, calculateFlightDuration } from '../utils/flightCalculations.js';

const router = Router();

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const FlightDataSchema = z.object({
  aircraft: z.string().min(1, 'Aircraft é obrigatório'),
  startTime: z.string().datetime('Data de início inválida'),
  endTime: z.string().datetime('Data de fim inválida'),
  departureLatLon: z.tuple([z.number(), z.number()]),
  arrivalLatLon: z.tuple([z.number(), z.number()]),
  maxAltitude: z.number().min(0),
  maxSpeed: z.number().min(0),
  distance: z.number().min(0),
  duration: z.number().min(0),
});

const TelemetrySchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number(),
  speed: z.number(),
  onGround: z.boolean(),
  aircraft: z.string(),
  heading: z.number(),
  verticalSpeed: z.number(),
  timestamp: z.number(),
});

// ============================================
// ENDPOINTS
// ============================================

/**
 * POST /api/msfs/logbook
 * Recebe dados de voo completo do companion service
 */
router.post('/logbook', async (req, res) => {
  try {
    console.log('📥 Recebendo dados de voo do MSFS:', req.body);
    
    // Validar dados
    const flightData = FlightDataSchema.parse(req.body);
    const supabase = req.app.locals.supabase;
    
    // Buscar aeroportos mais próximos
    const [departureAirport, arrivalAirport] = await Promise.all([
      findNearestAirport(flightData.departureLatLon[0], flightData.departureLatLon[1]),
      findNearestAirport(flightData.arrivalLatLon[0], flightData.arrivalLatLon[1]),
    ]);
    
    // Calcular dados adicionais
    const calculatedDistance = calculateFlightDistance(
      flightData.departureLatLon[0], flightData.departureLatLon[1],
      flightData.arrivalLatLon[0], flightData.arrivalLatLon[1]
    );
    
    const calculatedDuration = calculateFlightDuration(
      new Date(flightData.startTime),
      new Date(flightData.endTime)
    );
    
    // Preparar dados para inserção
    const flightRecord = {
      // Dados básicos
      aircraft_type: flightData.aircraft,
      flight_date: new Date(flightData.startTime).toISOString().split('T')[0],
      departure_time: flightData.startTime,
      arrival_time: flightData.endTime,
      
      // Aeroportos
      departure_icao: departureAirport?.icao_code || null,
      departure_name: departureAirport?.name || 'Unknown Airport',
      departure_lat: flightData.departureLatLon[0],
      departure_lon: flightData.departureLatLon[1],
      
      arrival_icao: arrivalAirport?.icao_code || null,
      arrival_name: arrivalAirport?.name || 'Unknown Airport',
      arrival_lat: flightData.arrivalLatLon[0],
      arrival_lon: flightData.arrivalLatLon[1],
      
      // Dados de voo
      flight_time: Math.round(calculatedDuration / 60), // em minutos
      distance: Math.round(calculatedDistance), // em km
      max_altitude: Math.round(flightData.maxAltitude),
      max_speed: Math.round(flightData.maxSpeed),
      
      // Metadados
      source: 'MSFS_2024',
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    
    // Inserir no banco de dados
    const { data: insertedFlight, error } = await supabase
      .from('msfs_flights')
      .insert([flightRecord])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao inserir voo:', error);
      throw error;
    }
    
    console.log('✅ Voo salvo com sucesso:', insertedFlight.id);
    
    // Broadcast para clientes WebSocket
    const wsClients = req.app.locals.wsClients;
    if (wsClients) {
      const message = {
        type: 'newFlight',
        data: insertedFlight,
        timestamp: new Date().toISOString(),
      };
      
      wsClients.forEach((client: any) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(message));
        }
      });
    }
    
    // Resposta
    res.status(201).json({
      success: true,
      message: 'Voo registrado com sucesso',
      data: {
        id: insertedFlight.id,
        aircraft: insertedFlight.aircraft_type,
        departure: {
          icao: insertedFlight.departure_icao,
          name: insertedFlight.departure_name,
        },
        arrival: {
          icao: insertedFlight.arrival_icao,
          name: insertedFlight.arrival_name,
        },
        duration: insertedFlight.flight_time,
        distance: insertedFlight.distance,
      },
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar voo:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message,
    });
  }
});

/**
 * POST /api/msfs/telemetry
 * Recebe dados de telemetria em tempo real (opcional)
 */
router.post('/telemetry', async (req, res) => {
  try {
    const telemetryData = TelemetrySchema.parse(req.body);
    
    // Broadcast telemetria para clientes WebSocket
    const wsClients = req.app.locals.wsClients;
    if (wsClients) {
      const message = {
        type: 'telemetry',
        data: telemetryData,
        timestamp: new Date().toISOString(),
      };
      
      wsClients.forEach((client: any) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(message));
        }
      });
    }
    
    res.json({ success: true, message: 'Telemetria recebida' });
    
  } catch (error) {
    console.error('❌ Erro ao processar telemetria:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados de telemetria inválidos',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * GET /api/msfs/flights
 * Lista voos do MSFS com paginação
 */
router.get('/flights', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // Buscar voos
    const { data: flights, error, count } = await supabase
      .from('msfs_flights')
      .select('*', { count: 'exact' })
      .order('departure_time', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      data: flights,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil((count || 0) / limit),
      },
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar voos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar voos',
    });
  }
});

/**
 * GET /api/msfs/flights/:id
 * Busca voo específico por ID
 */
router.get('/flights/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { id } = req.params;
    
    const { data: flight, error } = await supabase
      .from('msfs_flights')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Voo não encontrado',
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data: flight,
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar voo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar voo',
    });
  }
});

/**
 * GET /api/msfs/stats
 * Estatísticas dos voos do MSFS
 */
router.get('/stats', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Buscar estatísticas
    const { data: stats, error } = await supabase
      .rpc('get_msfs_flight_stats');
    
    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      data: stats || {
        total_flights: 0,
        total_hours: 0,
        total_distance: 0,
        unique_aircraft: 0,
        unique_airports: 0,
      },
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas',
    });
  }
});

export default router;