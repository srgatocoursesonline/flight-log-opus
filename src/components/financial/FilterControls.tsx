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
import { Filter, X, Calendar } from 'lucide-react';

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
            <Label htmlFor="start-date" className="text-xs description-text">
          Data Inicial
        </Label>
            <div className="relative min-w-0">
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="h-8 pr-10 w-full min-w-[120px] sm:min-w-[140px] lg:min-w-[160px] text-xs"
              />
              <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-readable-subtle pointer-events-none" />
            </div>
          </div>

          {/* Filtro de Data Final */}
          <div className="space-y-1 min-w-0">
            <Label htmlFor="end-date" className="text-xs description-text">
          Data Final
        </Label>
            <div className="relative min-w-0">
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="h-8 pr-10 w-full min-w-[120px] sm:min-w-[140px] lg:min-w-[160px] text-xs"
              />
              <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-readable-subtle pointer-events-none" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};