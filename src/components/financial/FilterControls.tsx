import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, X, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface FilterControlsProps {
  categories: Array<{ id: string; name: string; icon: string }>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterControls = ({
  categories,
  selectedCategory,
  onCategoryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClearFilters,
  hasActiveFilters
}: FilterControlsProps) => {
  const parseISOToDate = (value?: string) => {
    if (!value) return undefined;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
  };

  const formatDateISO = (date?: Date) => {
    if (!date) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <Card className="hud-display mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium label-text">Filtros</Label>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="ml-auto h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
        
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {/* Filtro de Categoria */}
          <div className="space-y-1 min-w-0">
            <Label htmlFor="category-filter" className="text-xs description-text">
          Categoria
        </Label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="h-8 w-full min-w-[140px] sm:min-w-[160px]">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Data Inicial */}
          <div className="space-y-1 min-w-0">
            <Label htmlFor="start-date" className="text-xs description-text">Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 w-full justify-start text-left font-normal min-w-[120px] sm:min-w-[140px] lg:min-w-[160px] text-xs">
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {startDate ? format(parseISOToDate(startDate) as Date, 'dd/MM/yyyy') : <span className="text-readable-muted">dd/mm/aaaa</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-panel" align="start">
                <CalendarComponent
                  mode="single"
                  selected={parseISOToDate(startDate)}
                  onSelect={(d) => onStartDateChange(formatDateISO(d || undefined as unknown as Date))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro de Data Final */}
          <div className="space-y-1 min-w-0">
            <Label htmlFor="end-date" className="text-xs description-text">Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 w-full justify-start text-left font-normal min-w-[120px] sm:min-w-[140px] lg:min-w-[160px] text-xs">
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {endDate ? format(parseISOToDate(endDate) as Date, 'dd/MM/yyyy') : <span className="text-readable-muted">dd/mm/aaaa</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-panel" align="start">
                <CalendarComponent
                  mode="single"
                  selected={parseISOToDate(endDate)}
                  onSelect={(d) => onEndDateChange(formatDateISO(d || undefined as unknown as Date))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};