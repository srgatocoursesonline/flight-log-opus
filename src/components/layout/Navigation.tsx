import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Plane, 
  TrendingUp, 
  History, 
  Target, 
  DollarSign,
  Settings,
  User,
  Activity,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { MSFSLogo } from "@/components/ui/msfs-logo";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/", icon: Home, labelKey: "navigation.dashboard" },
  { to: "/flights", icon: Plane, labelKey: "navigation.flights" },
  { to: "/realtime", icon: Activity, labelKey: "navigation.realtime" },
  { to: "/ranking", icon: TrendingUp, labelKey: "navigation.ranking" },
  { to: "/history", icon: History, labelKey: "navigation.history" },
  { to: "/goals", icon: Target, labelKey: "navigation.goals" },
  { to: "/financial", icon: DollarSign, labelKey: "navigation.financial" },
  { to: "/profile", icon: User, labelKey: "navigation.profile" },
  { to: "/settings", icon: Settings, labelKey: "navigation.settings" },
];

export const Navigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // Reset loading state when location changes
  useEffect(() => {
    setLoadingPath(null);
  }, [location.pathname]);

  const handleNavClick = (path: string) => {
    // Show loading state for navigation
    setLoadingPath(path);
  };
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="glass-panel flex grow flex-col gap-y-5 px-6 pb-4 pt-20">
          <div className="flex shrink-0 items-center">
            <div className="flex items-center gap-3">
              <MSFSLogo size="lg" className="pulse-glow" />
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => handleNavClick(item.to)}
                    className={({ isActive }) =>
                      cn(
                        "group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                        loadingPath === item.to && "opacity-75"
                      )
                    }
                  >
                    {loadingPath === item.to ? (
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                    ) : (
                      <item.icon className="h-5 w-5 shrink-0" />
                    )}
                    {t(item.labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <nav className="glass-panel border-t border-border/50">
          <div className="flex justify-around items-center py-2">
            {navItems.slice(0, 6).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => handleNavClick(item.to)}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground",
                    loadingPath === item.to && "opacity-75"
                  )
                }
              >
                {loadingPath === item.to ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <item.icon className="h-5 w-5" />
                )}
                <span className="text-xs font-medium">{t(item.labelKey)}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};