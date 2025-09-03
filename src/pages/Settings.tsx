import { Settings as SettingsIcon, Bell, Shield, Database, Smartphone, ChevronDown, ChevronRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { autoRefresh } from "@/utils/autoRefresh";
import { ExpenseCategoriesManager } from "@/components/financial/ExpenseCategoriesManager";
import { RevenueCategoriesManager } from "@/components/financial/RevenueCategoriesManager";
import { FinancialSettingsManager } from "@/components/financial/FinancialSettingsManager";
import { FlightConfigManager } from "@/components/flight/FlightConfigManager";
import { CareerRatingManager } from "@/components/career/CareerRatingManager";

const Settings = () => {
  const { t } = useTranslation();
  
  // Estados para controlar seções abertas/fechadas - TODAS RECOLHIDAS POR PADRÃO
  const [openSections, setOpenSections] = useState({
    notifications: false,
    financial: false,
    flight: false,
    career: false,
    app: false,
    data: false,
    security: false
  });
  
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Ouvir o evento para abrir a seção de carreira
  useEffect(() => {
    const handleOpenCareerSection = () => {
      setOpenSections(prev => ({
        ...prev,
        career: true
      }));
    };

    window.addEventListener('openCareerSection', handleOpenCareerSection);
    
    return () => {
      window.removeEventListener('openCareerSection', handleOpenCareerSection);
    };
  }, []);
  
  const handleExportData = () => {
    // TODO: Implementar export de dados
    console.log('Export data - TODO');
  };
  
  const handleBackup = () => {
    // TODO: Implementar backup
    console.log('Backup - TODO');
  };
  
  const handleResetData = () => {
    // TODO: Implementar reset de dados
    if (confirm('Tem certeza que deseja resetar todos os dados?')) {
      // Aqui seria implementado o reset real
      console.log('Reset data - TODO');
    }
  };
  
  const handleConnectSupabase = () => {
    // TODO: Implementar conexão Supabase
    console.log('Connect Supabase - TODO');
  };
  
  return (
    <div className="mobile-page-layout mobile-section pb-20 lg:pb-6">
      <div className="flex flex-col gap-1 fade-in">
        <h1 className="mobile-title gradient-title">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="grid gap-4">
        {/* Seção: Notificações */}
        <Collapsible open={openSections.notifications} onOpenChange={() => toggleSection('notifications')}>
          <div className="hud-display stats-card settings-section fade-in" style={{ animationDelay: '0.1s' }}>
            <CollapsibleTrigger className="w-full text-left settings-trigger rounded-lg">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <Bell className="h-6 w-6 text-primary icon-hover" />
                  <h3 className="text-lg font-semibold text-foreground">{t('settings.notifications.title')}</h3>
                </div>
                <div data-chevron>
                  {openSections.notifications ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="settings-content">
              <div className="px-6 pb-6 space-y-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t('settings.notifications.email')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.notifications.emailDesc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t('settings.notifications.push')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.notifications.pushDesc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                

              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Seção: Configurações Financeiras */}
        <Collapsible open={openSections.financial} onOpenChange={() => toggleSection('financial')}>
          <div className="hud-display stats-card settings-section fade-in" style={{ animationDelay: '0.2s' }}>
            <CollapsibleTrigger className="w-full text-left settings-trigger rounded-lg">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-primary icon-hover" />
                  <h3 className="text-lg font-semibold text-foreground">{t('settings.financial.title')}</h3>
                </div>
                <div data-chevron>
                  {openSections.financial ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="settings-content">
              <div className="px-6 pb-6 space-y-6 border-t border-border/50">
                <FinancialSettingsManager />
                <ExpenseCategoriesManager />
                <RevenueCategoriesManager />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Seção: Configurações de Voo */}
        <Collapsible open={openSections.flight} onOpenChange={() => toggleSection('flight')}>
          <div className="hud-display stats-card settings-section fade-in" style={{ animationDelay: '0.3s' }}>
            <CollapsibleTrigger className="w-full text-left settings-trigger rounded-lg">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <SettingsIcon className="h-6 w-6 text-primary icon-hover" />
                  <h3 className="text-lg font-semibold text-foreground">{t('settings.flights.title')}</h3>
                </div>
                <div data-chevron>
                  {openSections.flight ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="settings-content">
              <div className="px-6 pb-6 border-t border-border/50">
                <FlightConfigManager />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Seção: Configurações de Carreira */}
        <Collapsible open={openSections.career} onOpenChange={() => toggleSection('career')}>
          <div className="hud-display stats-card settings-section fade-in" style={{ animationDelay: '0.4s' }}>
            <CollapsibleTrigger className="w-full text-left settings-trigger rounded-lg">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-primary icon-hover" />
                  <h3 className="text-lg font-semibold text-foreground">{t('settings.career.title')}</h3>
                </div>
                <div data-chevron>
                  {openSections.career ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="settings-content">
              <div className="px-6 pb-6 border-t border-border/50">
                <CareerRatingManager />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Seção: Preferências do App */}
        <Collapsible open={openSections.app} onOpenChange={() => toggleSection('app')}>
          <div className="hud-display stats-card settings-section fade-in" style={{ animationDelay: '0.4s' }}>
            <CollapsibleTrigger className="w-full text-left settings-trigger rounded-lg">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6 text-primary icon-hover" />
                  <h3 className="text-lg font-semibold text-foreground">{t('settings.app.title')}</h3>
                </div>
                <div data-chevron>
                  {openSections.app ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="settings-content">
              <div className="px-6 pb-6 space-y-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t('settings.flights.offlineMode')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.flights.offlineModeDesc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t('settings.flights.autoSync')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.flights.autoSyncDesc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                

              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Seção: Gerenciamento de Dados */}
        <Collapsible open={openSections.data} onOpenChange={() => toggleSection('data')}>
          <div className="hud-display stats-card settings-section fade-in" style={{ animationDelay: '0.5s' }}>
            <CollapsibleTrigger className="w-full text-left settings-trigger rounded-lg">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-primary icon-hover" />
                  <h3 className="text-lg font-semibold text-foreground">{t('settings.data.title')}</h3>
                </div>
                <div data-chevron>
                  {openSections.data ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="settings-content">
              <div className="px-6 pb-6 space-y-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t('settings.data.export')}</h4>
                    <p className="text-sm text-muted-foreground">Baixe seus dados de voo</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportData}>{t('settings.data.export')}</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t('settings.data.backup')}</h4>
                    <p className="text-sm text-muted-foreground">Crie um backup dos seus dados</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleBackup}>{t('settings.data.backup')}</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground text-destructive">{t('settings.data.reset')}</h4>
                    <p className="text-sm text-muted-foreground">Apagar permanentemente todos os dados de voo</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleResetData}>{t('settings.data.reset')}</Button>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Seção: Privacidade e Segurança */}
        <Collapsible open={openSections.security} onOpenChange={() => toggleSection('security')}>
          <div className="hud-display stats-card settings-section fade-in" style={{ animationDelay: '0.6s' }}>
            <CollapsibleTrigger className="w-full text-left settings-trigger rounded-lg">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary icon-hover" />
                  <h3 className="text-lg font-semibold text-foreground">{t('settings.security.title')}</h3>
                </div>
                <div data-chevron>
                  {openSections.security ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="settings-content">
              <div className="px-6 pb-6 border-t border-border/50">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Recursos de segurança e privacidade para proteger seus dados
                  </p>
                  <Button variant="hud" onClick={handleConnectSupabase}>
                    {t('settings.security.connectAccount')}
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </div>
  );
};

export default Settings;