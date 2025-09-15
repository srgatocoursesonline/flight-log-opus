export interface Flight {
  id: string;
  user_id: string;
  flight_number?: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  aircraft_type: string;
  aircraft_registration?: string;
  airline?: string;
  flight_time: string;
  distance?: number;
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled' | 'delayed';
  notes?: string;
  created_at: string;
  updated_at: string;
  pilot_name?: string;
  co_pilot?: string;
  flight_type?: 'commercial' | 'private' | 'training' | 'ferry';
  weather_conditions?: string;
  fuel_used?: number;
  route?: string;
  altitude?: number;
  speed?: number;
  passengers?: number;
  cargo_weight?: number;
  revenue?: number;
  expenses?: number;
  profit?: number;
}

export interface FlightSession {
  id: string;
  flight_id: string;
  start_time: string;
  end_time: string;
  duration: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FlightWithDetails extends Flight {
  departure_airport_details?: Airport;
  arrival_airport_details?: Airport;
  sessions?: FlightSession[];
}

export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
}

export interface FlightFilters {
  status?: string[];
  aircraft_type?: string[];
  airline?: string[];
  date_from?: string;
  date_to?: string;
  departure_airport?: string;
  arrival_airport?: string;
}

export interface FlightStats {
  total_flights: number;
  total_hours: number;
  total_distance: number;
  unique_aircraft: number;
  unique_airports: number;
}