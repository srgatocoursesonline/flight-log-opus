import React, { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface MultiSelectFilterProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  title?: string;
  maxDisplayItems?: number;
  className?: string;
  searchable?: boolean;
}

export function MultiSelectFilter({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Selecionar itens...',
  title,
  maxDisplayItems = 3,
  className,
  searchable = true
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleToggleOption = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(options.map(option => option.value));
    }
  };

  const handleClearSelection = () => {
    onSelectionChange([]);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }

    if (selectedValues.length <= maxDisplayItems) {
      return selectedValues
        .map(value => options.find(opt => opt.value === value)?.label || value)
        .join(', ');
    }

    return `${selectedValues.length} selecionado${selectedValues.length !== 1 ? 's' : ''}`;
  };

  const selectedOptions = selectedValues.map(value => 
    options.find(opt => opt.value === value)
  ).filter(Boolean);

  return (
    <div className={cn('space-y-2', className)}>
      {title && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{title}</label>
          {selectedValues.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar tudo
            </Button>
          )}
        </div>
      )}

      {/* Selected items as badges */}
      {selectedValues.length > 0 && selectedValues.length <= maxDisplayItems && (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <Badge
              key={option?.value}
              variant="secondary"
              className="text-xs"
            >
              {option?.label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (option?.value) {
                    handleToggleOption(option.value);
                  }
                }}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between"
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2">
            {/* Search input */}
            {searchable && (
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}

            {/* Select all / Clear all */}
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-auto p-0 text-xs"
              >
                {selectedValues.length === options.length ? 'Limpar tudo' : 'Selecionar tudo'}
              </Button>
              <span className="text-xs text-muted-foreground">
                {selectedValues.length} de {options.length} selecionado{selectedValues.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Options list */}
            <ScrollArea className="h-[200px]">
              <div className="space-y-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 p-2 hover:bg-muted rounded-sm cursor-pointer"
                    onClick={() => handleToggleOption(option.value)}
                  >
                    <Checkbox
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleToggleOption(option.value)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {selectedValues.includes(option.value) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
                {filteredOptions.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhuma opção encontrada
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}