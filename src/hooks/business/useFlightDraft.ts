import { useState, useEffect, useCallback } from 'react';

// Constantes para persistência
const DRAFT_STORAGE_KEY = 'flight_draft_data';
const MODAL_STATE_KEY = 'flight_modal_open';

// Tipo para dados do formulário
export interface FlightFormData {
  callsign: string;
  aircraft: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  flightTime: string;
  distance: string;
  fuelUsed: string;
  landingRate: string;
  experiencePoints: string;
  careerRating: string;
  status: string;
  date: string;
  route: string;
  notes: string;
  serviceType: string;
  originCountry: string;
  destinationCountry: string;
  originAirportName: string;
  destinationAirportName: string;
}

// Função para obter dados padrão do formulário
const getDefaultFormData = (): FlightFormData => {
  // Get today's date in YYYY-MM-DD format without timezone issues
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  return {
    callsign: '',
    aircraft: '',
    departure: '',
    arrival: '',
    departureTime: '',
    arrivalTime: '',
    flightTime: '',
    distance: '',
    fuelUsed: '',
    landingRate: '',
    experiencePoints: '',
    careerRating: '',
    status: 'planned',
    date: todayString,
    route: '',
    notes: '',
    serviceType: 'employee',
    originCountry: '',
    destinationCountry: '',
    originAirportName: '',
    destinationAirportName: ''
  };
}

// Hook personalizado para gerenciar persistência do modal de voo
export const useFlightDraft = (isEditing: boolean = false) => {
  // Função para salvar rascunho no localStorage
  const saveDraftData = useCallback((data: FlightFormData) => {
    if (isEditing) return; // Não salvar se estiver editando
    
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    }
  }, [isEditing]);

  // Função para carregar rascunho do localStorage
  const loadDraftData = useCallback((): FlightFormData | null => {
    if (isEditing) return null; // Não carregar se estiver editando
    
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Verificar se o rascunho não está muito antigo (24 horas)
        const timestamp = new Date(parsed.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          delete parsed.timestamp;
          return parsed;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar rascunho:', error);
    }
    return null;
  }, [isEditing]);

  // Função para limpar rascunho
  const clearDraftData = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(MODAL_STATE_KEY);
    } catch (error) {
      console.error('Erro ao limpar rascunho:', error);
    }
  }, []);

  // Função para salvar estado do modal
  const saveModalState = useCallback((isOpen: boolean) => {
    if (isEditing) return; // Não salvar estado se estiver editando
    
    try {
      localStorage.setItem(MODAL_STATE_KEY, JSON.stringify(isOpen));
    } catch (error) {
      console.error('Erro ao salvar estado do modal:', error);
    }
  }, [isEditing]);

  // Função para carregar estado do modal
  const loadModalState = useCallback((): boolean => {
    if (isEditing) return false; // Não carregar estado se estiver editando
    
    try {
      const saved = localStorage.getItem(MODAL_STATE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Erro ao carregar estado do modal:', error);
      return false;
    }
  }, [isEditing]);

  // Verificar se há dados de rascunho
  const hasDraftData = useCallback((): boolean => {
    const draftData = loadDraftData();
    if (!draftData) return false;
    
    // Get today's date in YYYY-MM-DD format without timezone issues
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    return Object.values(draftData).some(value => 
      value && value.toString().trim() !== '' && 
      value !== 'planned' && 
      value !== todayString
    );
  }, [loadDraftData]);

  return {
    saveDraftData,
    loadDraftData,
    clearDraftData,
    saveModalState,
    loadModalState,
    hasDraftData,
    getDefaultFormData
  };
};