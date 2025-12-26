import { User, Edit, Star, Calendar, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { autoRefresh } from "@/utils/autoRefresh";
import { useState, useEffect } from "react";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { useProfile } from "@/hooks/useProfile";
import { useProfileBaseline } from "@/hooks/useProfileBaseline";
import { useProfileFinancialSync } from "@/hooks/useProfileFinancialSync";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { debugTrace } from "@/utils/debugTrace";
import { setupDatabaseConsistencyMonitor } from "@/utils/databaseVerify";
import { useAuth } from "@/contexts/AuthContext";


const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { profile, isLoading, fetchProfile, getProfileStats, validateAndFixProfileStats } = useProfile();
  const { getRealTimeStats } = useProfileBaseline();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Sincronização automática do career_rating com lucro líquido
  useProfileFinancialSync();

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    // Recarregar dados do perfil sem refresh da página
    fetchProfile();
  };

  // Calcular estatísticas quando o perfil mudar
  useEffect(() => {
    const loadProfileStats = async () => {
      if (profile) {
        // Add trace for profile data
        debugTrace.addTrace('Profile.tsx useEffect - Initial profile', {
          initial_flights: profile.initial_flights,
          total_flights: profile.total_flights,
          initial_minutes: profile.initial_minutes,
          total_minutes: profile.total_minutes,
          calculatedTotal: (profile.initial_flights || 0) + (profile.total_flights || 0)
        });

        try {
          // Buscar estatísticas em tempo real (agora assincronamente)
          const realTimeStats = await getRealTimeStats();

          if (realTimeStats) {
            // Add trace for realTimeStats data
            debugTrace.addTrace('Profile.tsx useEffect - getRealTimeStats result', {
              initial_flights: profile.initial_flights,
              total_flights: profile.total_flights,
              baselineFlights: realTimeStats.baselineFlights,
              flightsDone: realTimeStats.flightsDone,
              totalFlights: realTimeStats.totalFlights
            });

            // Important: We only need basic stats from getProfileStats without flight counts
            const profileStats = getProfileStats();

            // Add trace for profileStats data
            debugTrace.addTrace('Profile.tsx useEffect - getProfileStats result', {
              initial_flights: profile.initial_flights,
              total_flights: profile.total_flights,
              totalFlights: profileStats.totalFlights
            });

            // Use a simplified approach: set stats directly instead of merging potentially duplicate calculations
            setStats({
              dynamicCR: profileStats.dynamicCR,
              totalFlights: realTimeStats.totalFlights, // Use realTimeStats for flight counts
              totalHours: realTimeStats.totalHours,
              totalMinutes: realTimeStats.totalMinutes,
              careerDuration: profileStats.careerDuration,
              perfectFlightRate: profileStats.perfectFlightRate,
              perfectFlights: profileStats.perfectFlights,
              achievements: profileStats.achievements
            });

            // Add trace for final stats
            debugTrace.addTrace('Profile.tsx useEffect - Final stats set', {
              initial_flights: profile.initial_flights,
              total_flights: profile.total_flights,
              totalFlights: realTimeStats.totalFlights
            });

          } else {
            const profileStats = getProfileStats();

            // Add trace for fallback
            debugTrace.addTrace('Profile.tsx useEffect - Fallback stats', {
              initial_flights: profile.initial_flights,
              total_flights: profile.total_flights,
              totalFlights: profileStats.totalFlights
            });

            setStats(profileStats);
          }
        } catch (error) {
          const profileStats = getProfileStats();
          setStats(profileStats);
        }
      }
    };

    loadProfileStats();
  }, [profile, getProfileStats, getRealTimeStats]);

  // Configurar monitor de consistência do banco de dados
  useEffect(() => {
    if (user?.id) {
      // Configurar monitor para verificar a cada 10 minutos
      const stopMonitor = setupDatabaseConsistencyMonitor(user.id, 10);

      // Cleanup: parar o monitor quando o componente for desmontado
      return () => {
        if (stopMonitor) stopMonitor();
      };
    }
  }, [user?.id]);

  // Validar e corrigir estatísticas do perfil ao carregar a página
  useEffect(() => {
    if (profile) {
      try {
        validateAndFixProfileStats();
      } catch (error) {
        // Fallback silencioso - não quebra a página
      }
    }
  }, [profile, validateAndFixProfileStats]);

  if (isLoading) {
    return (
      <div className="mobile-page-layout mobile-section pb-20 lg:pb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-page-layout mobile-section pb-20 lg:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 fade-in">
        <div>
          <h1 className="mobile-title gradient-title">
            {t('profile.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('profile.subtitle')}
          </p>
        </div>
        <Button variant="outline" className="icon-hover" onClick={handleEditProfile}>
          <Edit className="h-4 w-4 mr-2" />
          {t('profile.editProfile')}
        </Button>
      </div>

      <div className="grid gap-2 lg:gap-3 lg:grid-cols-3">
        <div className="hud-display stats-card fade-in p-6" style={{ animationDelay: '0.1s' }}>
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage src={profile?.avatar_url} alt="Profile" />
              <AvatarFallback className="bg-gradient-primary pulse-glow">
                <User className="h-10 w-10 text-primary-foreground" />
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold text-foreground mb-1">{profile?.display_name || 'Cmdte. Rodrigo'}</h3>
            <p className="text-sm text-muted-foreground mb-4">{profile?.description || t('profile.professionalPilot')}</p>

            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
              <span className="font-bold text-green-500 font-mono">
                CR {stats?.dynamicCR?.toLocaleString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 0}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground font-mono">{stats?.totalFlights || 0}</p>
                <p className="text-xs text-muted-foreground uppercase">{t('profile.flights')}</p>
                <p className="text-[10px] text-muted-foreground opacity-50">
                  {t('profile.statsBreakdown', {
                    initial: profile?.initial_flights || 0,
                    system: ((stats?.totalFlights || 0) - (profile?.initial_flights || 0))
                  })}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground font-mono">{stats?.totalHours?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-muted-foreground uppercase">{t('profile.hours')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 hud-display chart-container fade-in p-6" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-foreground mb-6">{t('profile.careerStats')}</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h4 className="font-medium text-foreground">{t('profile.careerStarted')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{profile?.career_started ? new Date(Date.UTC(
                new Date(profile.career_started).getFullYear(),
                new Date(profile.career_started).getMonth(),
                new Date(profile.career_started).getDate()
              )).toLocaleDateString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US', { timeZone: 'UTC' }) : 'January 15, 2024'}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats?.careerDuration || t('profile.monthsAgo', { count: 8 })}</p>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-foreground" />
                <h4 className="font-medium text-foreground">{t('profile.totalFlightTime')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{stats?.totalHours || 348} {t('profile.hours')} 25 {t('profile.minutesShort')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('profile.averagePerMonth', { hours: Math.round((stats?.totalHours || 348) / 8) })}</p>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-5 w-5 text-success" />
                <h4 className="font-medium text-foreground">{t('profile.achievements')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{profile?.achievements || t('profile.achievementsCount', { count: 15 })}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('profile.inProgress', { count: 5 })}</p>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Star className="h-5 w-5 text-warning" />
                <h4 className="font-medium text-foreground">{t('profile.perfectFlights')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{stats?.perfectFlights || 23} {t('profile.flights')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('profile.successRate', { rate: stats?.perfectFlightRate || 18 })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hud-display p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">{t('profile.recentAchievements')}</h3>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-5 w-5 text-success" />
              <h4 className="font-medium text-foreground">{t('profile.atlanticCrossing')}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{t('profile.atlanticCrossingDesc')}</p>
            <p className="text-xs text-success mt-2">{t('profile.unlockedAgo', { time: t('profile.weeksAgo', { count: 3 }) })}</p>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <Star className="h-5 w-5 text-primary" />
              <h4 className="font-medium text-foreground">{t('profile.highPerformer')}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{t('profile.highPerformerDesc')}</p>
            <p className="text-xs text-primary mt-2">{t('profile.unlockedAgo', { time: t('profile.monthAgo', { count: 1 }) })}</p>
          </div>

          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-foreground" />
              <h4 className="font-medium text-foreground">{t('profile.centuryClub')}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{t('profile.centuryClubDesc')}</p>
            <p className="text-xs text-accent mt-2">{t('profile.unlockedAgo', { time: t('profile.monthsAgo', { count: 2 }) })}</p>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        profileData={profile ? {
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          initial_flights: profile.initial_flights, // Mudança: usar initial_flights
          initial_minutes: profile.initial_minutes, // Mudança: initial_hours -> initial_minutes
          career_started: profile.career_started,
          achievements: profile.achievements,
          perfect_flights: profile.perfect_flights,
          description: profile.description
        } : undefined}
      />


    </div>
  );
};

export default Profile;