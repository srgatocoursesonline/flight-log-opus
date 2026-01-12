import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
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
  Loader2,
  Wrench,
  ShoppingCart,
  BarChart3,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Building2,
  Calculator,
  Map,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MSFSLogo } from "@/components/ui/msfs-logo";
import { MobileDrawer } from "./MobileDrawer";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Estrutura do menu com seções
const menuStructure = {
  dashboard: { to: "/dashboard", icon: Home, labelKey: "navigation.dashboard" },
  sections: [
    {
      key: "operational",
      labelKey: "navigation.operational",
      items: [
        { to: "/flights", icon: Plane, labelKey: "navigation.flights" },
        { to: "/history", icon: History, labelKey: "navigation.history" },
        { to: "/manutencao", icon: Wrench, labelKey: "navigation.maintenance" },
        { to: "/realtime", icon: Activity, labelKey: "navigation.realtime" },
        { to: "/ranking", icon: Trophy, labelKey: "navigation.ranking" },
        { to: "/goals", icon: Target, labelKey: "navigation.goals" },
      ],
    },
    {
      key: "financialSection",
      labelKey: "navigation.financialSection",
      items: [
        { to: "/financial", icon: DollarSign, labelKey: "navigation.financial" },
        { to: "/compras", icon: ShoppingCart, labelKey: "navigation.purchases" },
        { to: "/relatorios-financeiros", icon: BarChart3, labelKey: "navigation.financialReports" },
      ],
    },
    {
      key: "analytics",
      labelKey: "navigation.analytics",
      items: [
        { to: "/reports", icon: FileText, labelKey: "navigation.reports" },
      ],
    },
    {
      key: "business",
      labelKey: "navigation.business",
      items: [
        { to: "/companies", icon: Building2, labelKey: "navigation.companies" },
      ],
    },
    {
      key: "tools",
      labelKey: "navigation.tools",
      items: [
        { to: "/tod-calculator", icon: Calculator, labelKey: "navigation.todCalculator" },
        { to: "/flight-planner", icon: Map, labelKey: "navigation.flightPlanner" },
        { to: "/airport-search", icon: Plane, labelKey: "navigation.airportSearch" },
      ],
    },
    {
      key: "administrative",
      labelKey: "navigation.administrative",
      items: [
        { to: "/profile", icon: User, labelKey: "navigation.profile" },
        { to: "/settings", icon: Settings, labelKey: "navigation.settings" },
      ],
    },
  ],
};

// Componente de seção expansível
interface ExpandableSectionProps {
  section: {
    key: string;
    labelKey: string;
    items: Array<{
      to: string;
      icon: any;
      labelKey: string;
    }>;
  };
  isExpanded: boolean;
  onToggle: () => void;
  loadingPath: string | null;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  section,
  isExpanded,
  onToggle,
  loadingPath,
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  // Verificar se algum item da seção está ativo
  const isAnyItemActive = section.items.some(item => 
    location.pathname === item.to || 
    (item.to !== "/dashboard" && location.pathname.startsWith(item.to))
  );

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => onToggle()}
      className="mb-2"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isAnyItemActive ? "bg-accent text-accent-foreground" : "text-readable-muted"
              )}
            >
              <span>{t(section.labelKey)}</span>
              {isExpanded ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
          </CollapsibleTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{isExpanded ? "Recolher menu" : "Expandir menu"}</p>
        </TooltipContent>
      </Tooltip>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="ml-4 mt-1 space-y-1">
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || 
              (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
            const isLoading = loadingPath === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive: navIsActive }) =>
                  cn(
                    "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    navIsActive || isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-readable-muted"
                  )
                }
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4 mr-3" />
                )}
                {t(item.labelKey)}
              </NavLink>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const Navigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Carregar estado de expansão do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('navigation-expanded-sections');
    if (savedState) {
      try {
        setExpandedSections(JSON.parse(savedState));
      } catch (error) {
        console.error('Erro ao carregar estado de expansão:', error);
      }
    } else {
      // Estado padrão: todas as seções expandidas
      const defaultState = menuStructure.sections.reduce((acc, section) => {
        acc[section.key] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setExpandedSections(defaultState);
    }
  }, []);

  // Deep linking: expandir seção automaticamente baseado na rota atual (apenas na primeira carga)
  useEffect(() => {
    const currentPath = location.pathname;
    const hasStoredState = localStorage.getItem('navigation-expanded-sections');
    
    // Só aplicar deep linking se não houver estado salvo (primeira visita)
    if (!hasStoredState) {
      // Encontrar qual seção contém a rota atual
      for (const section of menuStructure.sections) {
        const hasActiveItem = section.items.some(item => 
          currentPath === item.to || 
          (item.to !== "/dashboard" && currentPath.startsWith(item.to))
        );
        
        if (hasActiveItem) {
          setExpandedSections(prev => {
            const newState = { ...prev, [section.key]: true };
            localStorage.setItem('navigation-expanded-sections', JSON.stringify(newState));
            return newState;
          });
          break;
        }
      }
    }
  }, [location.pathname]);

  // Reset loading state when location changes
  useEffect(() => {
    setLoadingPath(null);
  }, [location.pathname]);

  // Timeout de segurança para o loading state
  useEffect(() => {
    if (loadingPath) {
      const timer = setTimeout(() => {
        setLoadingPath(null);
      }, 2000); // 2 segundos timeout é suficiente para navegação local
      return () => clearTimeout(timer);
    }
  }, [loadingPath]);

  // Salvar estado de expansão no localStorage
  const saveExpandedState = (newState: Record<string, boolean>) => {
    localStorage.setItem('navigation-expanded-sections', JSON.stringify(newState));
  };

  const handleNavClick = (path: string) => {
    // Show loading state for navigation
    setLoadingPath(path);
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => {
      const newState = { ...prev, [sectionKey]: !prev[sectionKey] };
      saveExpandedState(newState);
      return newState;
    });
  };

  // Lógica para expandir/recolher tudo
  const areAllExpanded = menuStructure.sections.every(section => expandedSections[section.key]);

  const handleToggleAll = () => {
    const newState = menuStructure.sections.reduce((acc, section) => {
      acc[section.key] = !areAllExpanded;
      return acc;
    }, {} as Record<string, boolean>);
    
    setExpandedSections(newState);
    saveExpandedState(newState);
  };

  // Função para renderizar itens do bottom bar mobile (4 principais + drawer)
  const getBottomBarItems = () => {
    return [
      menuStructure.dashboard,
      menuStructure.sections[0].items[0], // Voos
      menuStructure.sections[1].items[0], // Financeiro
      menuStructure.sections[2].items[0], // Perfil
    ];
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:overflow-hidden lg:h-screen">
        <div className="glass-panel flex h-full flex-col gap-y-3 px-4 pb-3 pt-16">
          <div className="flex shrink-0 items-center">
            <div className="flex items-center gap-3">
              <MSFSLogo size="lg" className="pulse-glow" />
            </div>
          </div>
          <nav className="scrollbar-hover-reveal flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-h-0">
            <ul role="list" className="flex flex-col gap-y-1">
              {/* Dashboard - sempre fixo no topo */}
              <li>
                <NavLink
                  to={menuStructure.dashboard.to}
                  onClick={() => handleNavClick(menuStructure.dashboard.to)}
                  className={({ isActive }) => {
                    const isActiveDashboard = location.pathname === menuStructure.dashboard.to || location.pathname === "/";
                    const isLoading = loadingPath === menuStructure.dashboard.to;
                    
                    return cn(
                      "group flex gap-x-3 rounded-lg p-2 text-sm font-medium transition-all duration-200 mb-2",
                      isActive || isActiveDashboard
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "text-readable-muted hover:text-readable hover:bg-muted/50",
                      isLoading && "opacity-75"
                    );
                  }}
                >
                  {loadingPath === menuStructure.dashboard.to ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                  ) : (
                    <menuStructure.dashboard.icon className="h-5 w-5 shrink-0" />
                  )}
                  {t(menuStructure.dashboard.labelKey)}
                </NavLink>
              </li>

              {/* Botão Global Expand/Collapse */}
              <li className="px-2 pb-2 flex items-center justify-between">
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                   Menu
                 </span>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <Button
                       variant="ghost"
                       size="icon"
                       className="h-6 w-6 hover:bg-accent hover:text-accent-foreground"
                       onClick={handleToggleAll}
                     >
                       {areAllExpanded ? (
                         <Minus className="h-4 w-4" />
                       ) : (
                         <Plus className="h-4 w-4" />
                       )}
                     </Button>
                   </TooltipTrigger>
                   <TooltipContent side="right">
                     <p>{areAllExpanded ? "Recolher tudo" : "Expandir tudo"}</p>
                   </TooltipContent>
                 </Tooltip>
              </li>

              {/* Seções expansíveis */}
              {menuStructure.sections.map((section) => (
                <li key={section.key}>
                  <ExpandableSection
                    section={section}
                    isExpanded={expandedSections[section.key] || false}
                    onToggle={() => toggleSection(section.key)}
                    loadingPath={loadingPath}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Drawer */}
        <MobileDrawer 
          open={isDrawerOpen} 
          onOpenChange={setIsDrawerOpen}
        />

        {/* Mobile Bottom Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-border/50">
            <div className="flex items-center justify-around py-2 px-4">
              {/* 4 atalhos principais */}
              {getBottomBarItems().map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || 
                  (item.to !== "/dashboard" && item.to !== "/" && location.pathname.startsWith(item.to)) ||
                  (item.to === "/dashboard" && location.pathname === "/");
                const isLoading = loadingPath === item.to;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => handleNavClick(item.to)}
                    className={({ isActive: navIsActive }) =>
                      cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] justify-center",
                        navIsActive || isActive
                          ? "text-primary bg-primary/10"
                          : "text-readable-muted hover:text-readable",
                        isLoading && "opacity-75"
                      )
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                    <span className="text-xs font-medium leading-tight">{t(item.labelKey)}</span>
                  </NavLink>
                );
              })}
              
              {/* Botão "Mais" para abrir drawer */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawerOpen(true)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] justify-center",
                  isDrawerOpen
                    ? "text-primary bg-primary/10"
                    : "text-readable-muted hover:text-readable"
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-xs font-medium leading-tight">{t('navigation.more')}</span>
              </Button>
            </div>
          </nav>
      </div>
    </TooltipProvider>
  );
};