import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

// SVG das bandeiras inline para melhor performance
const BrazilFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm">
    <rect width="20" height="15" fill="#009739"/>
    <polygon points="10,2.5 17,7.5 10,12.5 3,7.5" fill="#FEDD00"/>
    <circle cx="10" cy="7.5" r="3" fill="#012169"/>
    <path d="M7.5,6.5 Q10,8 12.5,6.5 Q10,9 7.5,7.5" fill="#FEDD00" stroke="#FEDD00" strokeWidth="0.3"/>
  </svg>
);

const USFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm">
    <rect width="20" height="15" fill="#B22234"/>
    <rect width="20" height="1.15" y="0" fill="#FFFFFF"/>
    <rect width="20" height="1.15" y="2.3" fill="#FFFFFF"/>
    <rect width="20" height="1.15" y="4.6" fill="#FFFFFF"/>
    <rect width="20" height="1.15" y="6.9" fill="#FFFFFF"/>
    <rect width="20" height="1.15" y="9.2" fill="#FFFFFF"/>
    <rect width="20" height="1.15" y="11.5" fill="#FFFFFF"/>
    <rect width="20" height="1.15" y="13.8" fill="#FFFFFF"/>
    <rect width="8" height="8" fill="#3C3B6E"/>
    <g fill="#FFFFFF" fontSize="1.5">
      <text x="1" y="1.5">⭐</text>
      <text x="3" y="1.5">⭐</text>
      <text x="5" y="1.5">⭐</text>
      <text x="7" y="1.5">⭐</text>
      <text x="2" y="3">⭐</text>
      <text x="4" y="3">⭐</text>
      <text x="6" y="3">⭐</text>
      <text x="1" y="4.5">⭐</text>
      <text x="3" y="4.5">⭐</text>
      <text x="5" y="4.5">⭐</text>
      <text x="7" y="4.5">⭐</text>
      <text x="2" y="6">⭐</text>
      <text x="4" y="6">⭐</text>
      <text x="6" y="6">⭐</text>
    </g>
  </svg>
);

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const getCurrentFlag = () => {
    return i18n.language === 'pt-BR' ? <BrazilFlag /> : <USFlag />;
  };

  const getCurrentLanguage = () => {
    return i18n.language === 'pt-BR' ? 'PT' : 'EN';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="hud-display border-primary/30 hover:border-primary/50 transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            {getCurrentFlag()}
            <span className="text-xs font-mono">{getCurrentLanguage()}</span>
            <Languages className="h-3 w-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="hud-display border-primary/30 min-w-[140px]"
      >
        <DropdownMenuItem 
          onClick={() => changeLanguage('pt-BR')}
          className="cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-3 w-full">
            <BrazilFlag />
            <span className="font-medium">Português</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('en-US')}
          className="cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-3 w-full">
            <USFlag />
            <span className="font-medium">English</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};