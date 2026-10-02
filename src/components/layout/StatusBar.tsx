import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UIModeToggle } from "@/components/ui/ui-mode-toggle";
import { ProfileDropdown } from "./ProfileDropdown";

export const StatusBar = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 lg:h-12">
      <div className="hud-display h-full flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-success">{t('statusBar.online')}</span>
          </div>
          <div className="text-xs text-readable-muted font-mono hidden sm:block">
            {t('statusBar.appName')}
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <ProfileDropdown />
          <div className="h-4 w-px bg-border hidden sm:block" />
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="text-xs font-mono text-foreground hidden md:block">
            {currentTime.toLocaleTimeString('en-US', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <div className="flex items-center gap-1 lg:gap-2">
            {isOnline ? (
              <Wifi className="h-3 w-3 lg:h-4 lg:w-4 text-success" />
            ) : (
              <WifiOff className="h-3 w-3 lg:h-4 lg:w-4 text-destructive" />
            )}
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <UIModeToggle />
        </div>
      </div>
    </div>
  );
};