import { useState, useEffect } from "react";
import { Wifi, WifiOff, Battery, Signal } from "lucide-react";

export const StatusBar = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());

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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-success">ONLINE</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono hidden lg:block">
            MSFS Career Manager v1.0
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-foreground">
            {currentTime.toLocaleTimeString('en-US', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            <Signal className="h-4 w-4 text-success" />
            <Battery className="h-4 w-4 text-warning" />
          </div>
        </div>
      </div>
    </div>
  );
};