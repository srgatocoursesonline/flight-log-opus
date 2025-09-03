// ============================================
// PROFILE HOOK
// Hook for managing user profile data and statistics
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';
import { Tables } from '@/types/supabase';
import { debugTrace } from '@/utils/debugTrace';

type Profile = Tables<'profiles'>;

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setProfile(data);
    } catch (err) {
      setError('Failed to fetch profile');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create user profile
  const createProfile = async (profileData: Partial<Profile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: profileData.display_name || 'Cmdte. Rodrigo',
          email: user.email,
          avatar_url: profileData.avatar_url || '',
          total_flights: profileData.total_flights || 0,
          total_hours: profileData.total_hours || 0,
          total_minutes: profileData.total_minutes || 0,
          initial_flights: profileData.initial_flights || 0,
          initial_minutes: profileData.initial_minutes || 0,
          career_rating: profileData.career_rating || 0,
          total_rating: profileData.total_rating || 0,
          career_level: profileData.career_level || 1,
          career_class: profileData.career_class || 'D',
          world_ranking: profileData.world_ranking || 0,
          career_started: profileData.career_started || new Date().toISOString().split('T')[0],
          achievements: profileData.achievements || '',
          perfect_flights: profileData.perfect_flights || 0,
          description: profileData.description || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      await fetchProfile();
    } catch (err) {
      throw err;
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      // Refresh profile data
      await fetchProfile();
    } catch (err) {
      throw err;
    }
  };

  // Upload avatar
  const uploadAvatar = async (file: File) => {
    if (!user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: data.publicUrl });
      
      return data.publicUrl;
    } catch (err) {
      throw err;
    }
  };

  // Handle flight completion event
  const handleFlightCompleted = useCallback(async (event: CustomEvent) => {
    if (!user || !profile) return;

    try {
      const flightData = event.detail;
      
      // Add trace for debugging
      debugTrace.addTrace('useProfile.handleFlightCompleted - Event received', {
        initial_flights: profile.initial_flights,
        total_flights: profile.total_flights,
        flightData
      });
      
      // Update profile statistics
      const { error } = await supabase.rpc('increment_profile_stats', {
        p_user_id: user.id,
        p_flights: 1,
        p_minutes: flightData.flightTimeMinutes || 0
      });

      if (error) {
        throw error;
      }

      // Refresh profile data
      await fetchProfile();
    } catch (err) {
      // Error handling without console output
    }
  }, [user, profile, fetchProfile]);

  // Listen for flight completion events
  useEffect(() => {
    const handleEvent = (event: Event) => {
      handleFlightCompleted(event as CustomEvent);
    };

    window.addEventListener('flightCompleted', handleEvent);
    
    return () => {
      window.removeEventListener('flightCompleted', handleEvent);
    };
  }, [handleFlightCompleted]);

  // Fetch profile on user change
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Get profile statistics
  const getProfileStats = useCallback(() => {
    if (!profile) {
      return {
        totalFlights: 0,
        totalHours: 0,
        totalMinutes: 0,
        dynamicCR: 0,
        careerDuration: '',
        perfectFlightRate: 0,
        perfectFlights: 0,
        achievements: ''
      };
    }

    // Calculate totals using baseline + system values
    const totalFlights = (profile.initial_flights || 0) + (profile.total_flights || 0);
    const totalMinutes = (profile.initial_minutes || 0) + (profile.total_minutes || 0);
    const totalHours = totalMinutes > 0 ? Number((totalMinutes / 60).toFixed(2)) : 0;
    
    // Calculate career duration
    const careerStart = profile.career_started ? new Date(profile.career_started) : new Date();
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - careerStart.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    const careerDuration = `${diffMonths} meses`;

    // Calculate perfect flight rate
    const perfectFlights = profile.perfect_flights || 0;
    const perfectFlightRate = totalFlights > 0 ? Math.round((perfectFlights / totalFlights) * 100) : 0;

    // Calculate dynamic CR (simplified)
    const dynamicCR = profile.career_rating || 0;

    return {
      totalFlights,
      totalHours,
      totalMinutes,
      dynamicCR,
      careerDuration,
      perfectFlightRate,
      perfectFlights,
      achievements: profile.achievements || ''
    };
  }, [profile]);

  // Validate and fix profile statistics
  const validateAndFixProfileStats = useCallback(async () => {
    if (!user || !profile) return;

    try {
      // Validate that initial values are not negative
      const updates: Partial<Profile> = {};
      
      if (profile.initial_flights && profile.initial_flights < 0) {
        updates.initial_flights = 0;
      }
      
      if (profile.initial_minutes && profile.initial_minutes < 0) {
        updates.initial_minutes = 0;
      }
      
      // Apply fixes if needed
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
      }
    } catch (err) {
      // Error handling without console output
    }
  }, [user, profile, updateProfile]);

  // Sync career rating with net profit
  const syncCareerRatingWithNetProfit = useCallback(async (netProfit: number) => {
    if (!user || !profile) return;

    try {
      const calculatedCR = Math.max(0, Math.floor(netProfit / 1000));
      
      // Only update if different
      if (profile.career_rating !== calculatedCR) {
        await updateProfile({ career_rating: calculatedCR });
      }
    } catch (err) {
      // Error handling without console output
    }
  }, [user, profile, updateProfile]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
    uploadAvatar,
    getProfileStats,
    validateAndFixProfileStats,
    syncCareerRatingWithNetProfit
  };
};