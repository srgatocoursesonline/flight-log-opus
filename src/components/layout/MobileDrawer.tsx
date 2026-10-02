import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useUIMode } from "@/hooks/ui/useUIMode";
import { Button } from "@/components/ui/button";
import {
  Home,
  Plane,
  Activity,
  Trophy,
  History,
  Target,
  DollarSign,
  User,
  Settings,
  Wrench,
  ShoppingCart,
  BarChart3,
  Menu,
  ChevronDown,
  ChevronRight,
  Building2, Calculator, Map
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MSFSLogo } from "@/components/ui/msfs-logo";

// Estrutura do menu conforme PRD
const drawerMenuStructure = {
  shortcutTabs: ["dashboard", "voos", "financeiro", "perfil", "more"],
  drawer: [
    {
      type: "section",
      id: "operacional",
      label: "Operacional",
      items: [
        { id: "voos", to: "/flights", icon: Plane, labelKey: "navigation.flights" },
        { id: "historico", to: "/history", icon: History, labelKey: "navigation.history" },
        { id: "manutencao", to: "/manutencao", icon: Wrench, labelKey: "navigation.maintenance" },
        { id: "tempo-real", to: "/realtime", icon: Activity, labelKey: "navigation.realtime" },
        { id: "ranking", to: "/ranking", icon: Trophy, labelKey: "navigation.ranking" },
        { id: "metas", to: "/goals", icon: Target, labelKey: "navigation.goals" },
      ],
    },
    {
      type: "section",
      id: "financeiro",
      label: "Financeiro",
      items: [
        { id: "financeiro", to: "/financial", icon: DollarSign, labelKey: "navigation.financial" },
        { id: "compras", to: "/compras", icon: ShoppingCart, labelKey: "navigation.purchases" },
        { id: "relatorios", to: "/relatorios-financeiros", icon: BarChart3, labelKey: "navigation.financialReports" },
      ],
    },
    {
      type: "section",
      id: "negocios",
      label: "Negócios",
      items: [
        { id: "empresas", to: "/companies", icon: Building2, labelKey: "navigation.companies" },
      ],
    },
    {
      type: "section",
      id: "ferramentas",
      label: "Ferramentas Úteis",
      items: [
        { id: "calculadora-tod", to: "/tod-calculator", icon: Calculator, labelKey: "navigation.todCalculator" },
        { id: "planejador-voo", to: "/flight-planner", icon: Map, labelKey: "navigation.flightPlanner" },
        { id: "busca-aeroportos", to: "/airport-search", icon: Plane, labelKey: "navigation.airportSearch" },
      ],
    },
    {
      type: "section",
      id: "adm",
      label: "Administrativo",
      items: [
        { id: "perfil", to: "/profile", icon: User, labelKey: "navigation.profile" },
        { id: "config", to: "/settings", icon: Settings, labelKey: "navigation.settings" },
      ],
    },
  ],
};

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileDrawer = ({ open, onOpenChange }: MobileDrawerProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isNewUI } = useUIMode();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Carregar estado das seções do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('mobile-drawer-expanded-sections');
    if (savedState) {
      try {
        setExpandedSections(JSON.parse(savedState));
      } catch (error) {
        console.error('Error loading expanded sections state:', error);
      }
    } else {
      // Estado inicial: expandir seção ativa
      const activeSection = getActiveSectionFromPath(location.pathname);
      if (activeSection) {
        setExpandedSections({ [activeSection]: true });
      }
    }
  }, [location.pathname]);

  // Salvar estado das seções no localStorage
  const saveExpandedState = (state: Record<string, boolean>) => {
    localStorage.setItem('mobile-drawer-expanded-sections', JSON.stringify(state));
  };

  // Determinar seção ativa baseada no path
  const getActiveSectionFromPath = (pathname: string): string | null => {
    if (pathname.startsWith('/flights') || pathname.startsWith('/history') || 
        pathname.startsWith('/manutencao') || pathname.startsWith('/realtime') ||
        pathname.startsWith('/ranking') || pathname.startsWith('/goals')) {
      return 'operacional';
    }
    if (pathname.startsWith('/financial') || pathname.startsWith('/compras') || pathname.startsWith('/relatorios-financeiros')) {
      return 'financeiro';
    }
    if (pathname.startsWith('/companies')) {
      return 'negocios';
    }
    if (pathname.startsWith('/tod-calculator') || pathname.startsWith('/flight-planner')) {
      return 'ferramentas';
    }
    if (pathname.startsWith('/profile') || pathname.startsWith('/settings')) {
      return 'adm';
    }
    return null;
  };

  // Toggle seção
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newState = { ...prev, [sectionId]: !prev[sectionId] };
      saveExpandedState(newState);
      return newState;
    });
  };

  // Expandir seção quando navegar diretamente
  useEffect(() => {
    const activeSection = getActiveSectionFromPath(location.pathname);
    if (activeSection && !expandedSections[activeSection]) {
      setExpandedSections(prev => {
        const newState = { ...prev, [activeSection]: true };
        saveExpandedState(newState);
        return newState;
      });
    }
  }, [location.pathname]);

  const handleNavClick = (to: string) => {
    onOpenChange(false); // Fechar drawer ao navegar
  };

  const triggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden h-10 w-10 hover:bg-accent"
      aria-label="Abrir menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );

  const drawerBody = (
    <>
      <div className="p-6 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <MSFSLogo size="md" className="pulse-glow" />
          {isNewUI ? (
            <DrawerTitle className="text-lg font-semibold">
              MSFS Career Manager
            </DrawerTitle>
          ) : (
            <SheetTitle className="text-lg font-semibold">
              MSFS Career Manager
            </SheetTitle>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
          {/* Dashboard - sempre no topo */}
          <div className="mb-6">
            <NavLink
              to="/dashboard"
              onClick={() => handleNavClick('/dashboard')}
              className={({ isActive }) => {
                const isDashboardActive = location.pathname === '/dashboard' || location.pathname === '/';
                return cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mb-2",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "min-h-[44px]", // Acessibilidade: hit area ≥ 44px
                  isActive || isDashboardActive
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-readable-muted"
                );
              }}
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">{t('navigation.dashboard')}</span>
            </NavLink>
          </div>

          {/* Seções colapsáveis */}
          <div className="space-y-2">
            {drawerMenuStructure.drawer.map((section) => {
              const isExpanded = expandedSections[section.id] || false;
              const hasActiveItem = section.items.some(item => 
                location.pathname === item.to || 
                (item.to !== '/dashboard' && item.to !== '/' && location.pathname.startsWith(item.to))
              );

              return (
                <div key={section.id} className="space-y-1">
                  {/* Cabeçalho da seção */}
                  <Button
                    variant="ghost"
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      "w-full justify-between p-3 h-auto min-h-[44px]",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      hasActiveItem ? "text-primary font-medium" : "text-readable-muted"
                    )}
                    aria-expanded={isExpanded}
                    role="button"
                  >
                    <span className="font-medium">{section.label}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Itens da seção */}
                  {isExpanded && (
                    <div className="ml-4 space-y-1 border-l border-border/30 pl-4">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to ||
                          (item.to !== '/dashboard' && item.to !== '/' && location.pathname.startsWith(item.to));

                        return (
                          <NavLink
                            key={item.id}
                            to={item.to}
                            onClick={() => handleNavClick(item.to)}
                            className={({ isActive: navIsActive }) =>
                              cn(
                                "flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
                                "hover:bg-accent hover:text-accent-foreground",
                                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                "min-h-[44px]", // Acessibilidade: hit area ≥ 44px
                                navIsActive || isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-readable-muted"
                              )
                            }
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{t(item.labelKey)}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
    </>
  );

  if (isNewUI) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="left">
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent className="inset-y-0 left-0 h-full w-[80%] max-w-sm p-0 glass-panel border-r border-border/50">
          <div
            aria-hidden="true"
            className="absolute right-1.5 top-1/2 h-10 w-1 -translate-y-1/2 rounded-full bg-muted-foreground/40"
          />
          {drawerBody}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{triggerButton}</SheetTrigger>
      <SheetContent
        side="left"
        className="w-[80%] max-w-sm p-0 glass-panel border-r border-border/50"
      >
        {drawerBody}
      </SheetContent>
    </Sheet>
  );
};