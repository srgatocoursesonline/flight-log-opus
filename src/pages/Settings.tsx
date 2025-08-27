import { Settings as SettingsIcon, Bell, Shield, Database, Smartphone, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { autoRefresh } from "@/utils/autoRefresh";
import { ExpenseCategoriesManager } from "@/components/financial/ExpenseCategoriesManager";
import { RevenueCategoriesManager } from "@/components/financial/RevenueCategoriesManager";
import { FlightConfigManager } from "@/components/flight/FlightConfigManager";

const Settings = () => {
  const { t } = useTranslation();
  
  // Estados para controlar seções abertas/fechadas - TODAS RECOLHIDAS POR PADRÃO
  const [openSections, setOpenSections] = useState({
    notifications: false,
    financial: false,
    flight: false,
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
  
  const handleExportData = () => {
    // TODO: Implementar export de dados
    console.log('Exportando dados...');
    autoRefresh();
  };
  
  const handleBackup = () => {
    // TODO: Implementar backup
    console.log('Criando backup...');
    autoRefresh();
  };
  
  const handleResetData = () => {
    // TODO: Implementar reset de dados
    if (confirm('Tem certeza que deseja resetar todos os dados?')) {
      console.log('Resetando dados...');
      // Aqui seria implementado o reset real
      autoRefresh();
    }
  };
  
  const handleConnectSupabase = () => {
    // TODO: Implementar conexão Supabase
    console.log('Conectando ao Supabase...');
    autoRefresh();
  };
  
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col gap-2 fade-in">
        <h1 className="text-3xl font-bold tracking-tight gradient-title">
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
                  <h3 className="text-lg font-semibold text-foreground">{t('settings.notifications')}</h3>
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
                    <h4 className="font-medium text-foreground">{t('settings.flightReminders')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.flightRemindersDesc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t('settings.goalProgress')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.goalProgressDesc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t('settings.achievementUnlocked')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.achievementUnlockedDesc')}</p>
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
                  <Database className="h-6 w-6 text-success icon-hover" />
                  <h3 className="text-lg font-semibold text-foreground">Configurações Financeiras</h3>
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
                  <SettingsIcon className="h-6 w-6 text-accent icon-hover" />
                  <h3 className="text-lg font-semibold text-foreground">Configurações de Voo</h3>
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

        {/* Seção: Preferências do App */}
        <Collapsible open={openSections.app} onOpenChange={() => toggleSection('app')}>
          <div className="hud-display stats-card settings-section fade-in" style={{ animationDelay: '0.4s' }}>
            <CollapsibleTrigger className="w-full text-left settings-trigger rounded-lg">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6 text-accent icon-hover" />
                  <h3 className="text-lg font-semibold text-foreground">{t('settings.appPreferences')}</h3>
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
                    <h4 className="font-medium text-foreground">{t('settings.offlineMode')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.offlineModeDesc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t('settings.autoSync')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.autoSyncDesc')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t('settings.analytics')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.analyticsDesc')}</p>
                  </div>
                  <Switch />
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
                  <Database className="h-6 w-6 text-info icon-hover" />
                  <h3 className="text-lg font-semibold text-foreground">{t('settings.dataManagement')}</h3>
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
                    <h4 className="font-medium text-foreground">{t('settings.exportData')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.exportDataDesc')}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportData}>{t('settings.export')}</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{t('settings.backup')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.backupDesc')}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleBackup}>{t('settings.backup')}</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground text-destructive">{t('settings.resetData')}</h4>
                    <p className="text-sm text-muted-foreground">{t('settings.resetDataDesc')}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleResetData}>{t('settings.reset')}</Button>
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
                  <Shield className="h-6 w-6 text-warning icon-hover" />
                  <h3 className="text-lg font-semibold text-foreground">{t('settings.privacySecurity')}</h3>
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
                    {t('settings.securityFeatures')}
                  </p>
                  <Button variant="hud" onClick={handleConnectSupabase}>
                    {t('settings.connectSupabase')}
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