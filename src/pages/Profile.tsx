import { User, Edit, Star, Calendar, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { autoRefresh } from "@/utils/autoRefresh";
import { useState, useEffect } from "react";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { useProfile } from "@/hooks/useProfile";
import { useProfileFinancialSync } from "@/hooks/useProfileFinancialSync";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const Profile = () => {
  const { t } = useTranslation();
  const { profile, isLoading, fetchProfile, getProfileStats } = useProfile();
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
    if (profile) {
      const profileStats = getProfileStats();
      setStats(profileStats);
    }
  }, [profile, getProfileStats]);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-title">
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

      <div className="grid gap-6 lg:grid-cols-3">
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
              <Star className="h-4 w-4 text-accent fill-current" />
              <span className="font-bold text-accent font-mono">CR {stats?.dynamicCR?.toLocaleString('pt-BR') || '0'}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground font-mono">{stats?.totalFlights || 0}</p>
                <p className="text-xs text-muted-foreground uppercase">{t('profile.flights')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground font-mono">{stats?.totalHours || 0}</p>
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
              <p className="text-sm text-muted-foreground">{profile?.career_started ? new Date(profile.career_started).toLocaleDateString('pt-BR') : 'January 15, 2024'}</p>
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
          total_flights: profile.total_flights,
          total_hours: profile.total_hours,
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