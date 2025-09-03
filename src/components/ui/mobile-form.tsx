import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X, AlertCircle } from 'lucide-react';

// Tipos de teclado mobile
export type MobileKeyboardType = 
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'decimal'
  | 'search'
  | 'url'
  | 'time'
  | 'date'
  | 'datetime-local';

// Interface para validação
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Props do MobileInput
interface MobileInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  keyboardType?: MobileKeyboardType;
  mask?: string;
  validation?: ValidationRule;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showValidation?: boolean;
  autoComplete?: string;
  maxLength?: number;
}

// Props do MobileTextarea
interface MobileTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  validation?: ValidationRule;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showValidation?: boolean;
  rows?: number;
  maxLength?: number;
}

// Props do MobileFormSection
interface MobileFormSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

// Função de validação
const validateField = (value: string, validation?: ValidationRule): ValidationResult => {
  if (!validation) return { isValid: true };
  
  // Verificar se é obrigatório
  if (validation.required && !value.trim()) {
    return { isValid: false, message: 'Campo obrigatório' };
  }
  
  // Se não há valor e não é obrigatório, é válido
  if (!value.trim()) {
    return { isValid: true };
  }
  
  // Verificar comprimento mínimo
  if (validation.minLength && value.length < validation.minLength) {
    return { isValid: false, message: `Mínimo ${validation.minLength} caracteres` };
  }
  
  // Verificar comprimento máximo
  if (validation.maxLength && value.length > validation.maxLength) {
    return { isValid: false, message: `Máximo ${validation.maxLength} caracteres` };
  }
  
  // Verificar padrão regex
  if (validation.pattern && !validation.pattern.test(value)) {
    return { isValid: false, message: 'Formato inválido' };
  }
  
  // Verificar validação customizada
  if (validation.custom) {
    const customMessage = validation.custom(value);
    if (customMessage) {
      return { isValid: false, message: customMessage };
    }
  }
  
  return { isValid: true };
};

// Função para aplicar máscara
const applyMask = (value: string, mask?: string): string => {
  if (!mask) return value;
  
  let maskedValue = '';
  let valueIndex = 0;
  
  for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
    const maskChar = mask[i];
    const valueChar = value[valueIndex];
    
    if (maskChar === '9') {
      if (/\d/.test(valueChar)) {
        maskedValue += valueChar;
        valueIndex++;
      } else {
        break;
      }
    } else if (maskChar === 'A') {
      if (/[A-Za-z]/.test(valueChar)) {
        maskedValue += valueChar.toUpperCase();
        valueIndex++;
      } else {
        break;
      }
    } else {
      maskedValue += maskChar;
    }
  }
  
  return maskedValue;
};

// Componente MobileInput
export const MobileInput: React.FC<MobileInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'text',
  mask,
  validation,
  required = false,
  disabled = false,
  className,
  showValidation = true,
  autoComplete,
  maxLength
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  
  // Validação em tempo real
  useEffect(() => {
    if (hasBeenTouched || value) {
      const result = validateField(value, validation);
      setValidationResult(result);
    }
  }, [value, validation, hasBeenTouched]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Aplicar máscara se fornecida
    if (mask) {
      newValue = applyMask(newValue, mask);
    }
    
    // Aplicar maxLength se fornecido
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    
    onChange(newValue);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    setHasBeenTouched(true);
  };
  
  const showError = showValidation && hasBeenTouched && !validationResult.isValid;
  const showSuccess = showValidation && hasBeenTouched && validationResult.isValid && value;
  
  return (
    <div className={cn('mobile-form-field', className)}>
      <Label 
        htmlFor={id} 
        className={cn(
          'mobile-form-label',
          required && 'mobile-form-label-required',
          showError && 'text-destructive',
          showSuccess && 'text-success'
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={keyboardType === 'decimal' ? 'number' : keyboardType}
          inputMode={keyboardType === 'decimal' ? 'decimal' : keyboardType === 'tel' ? 'tel' : keyboardType === 'number' ? 'numeric' : 'text'}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          step={keyboardType === 'decimal' ? '0.01' : undefined}
          className={cn(
            'mobile-form-input',
            isFocused && 'mobile-form-input-focused',
            showError && 'border-destructive focus:border-destructive',
            showSuccess && 'border-success focus:border-success',
            disabled && 'mobile-form-input-disabled'
          )}
        />
        
        {/* Ícones de validação */}
        {showValidation && hasBeenTouched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validationResult.isValid && value ? (
              <Check className="h-4 w-4 text-success" />
            ) : !validationResult.isValid ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : null}
          </div>
        )}
      </div>
      
      {/* Mensagem de erro */}
      {showError && validationResult.message && (
        <p className="mobile-form-error mt-1 text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {validationResult.message}
        </p>
      )}
      
      {/* Contador de caracteres */}
      {maxLength && isFocused && (
        <p className="mt-1 text-xs text-readable-muted text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
};

// Componente MobileTextarea
export const MobileTextarea: React.FC<MobileTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  validation,
  required = false,
  disabled = false,
  className,
  showValidation = true,
  rows = 3,
  maxLength
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  
  // Validação em tempo real
  useEffect(() => {
    if (hasBeenTouched || value) {
      const result = validateField(value, validation);
      setValidationResult(result);
    }
  }, [value, validation, hasBeenTouched]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    
    // Aplicar maxLength se fornecido
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    
    onChange(newValue);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    setHasBeenTouched(true);
  };
  
  const showError = showValidation && hasBeenTouched && !validationResult.isValid;
  const showSuccess = showValidation && hasBeenTouched && validationResult.isValid && value;
  
  return (
    <div className={cn('mobile-form-field', className)}>
      <Label 
        htmlFor={id} 
        className={cn(
          'mobile-form-label',
          required && 'mobile-form-label-required',
          showError && 'text-destructive',
          showSuccess && 'text-success'
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Textarea
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            'mobile-form-textarea',
            isFocused && 'mobile-form-textarea-focused',
            showError && 'border-destructive focus:border-destructive',
            showSuccess && 'border-success focus:border-success',
            disabled && 'mobile-form-textarea-disabled'
          )}
        />
        
        {/* Ícones de validação */}
        {showValidation && hasBeenTouched && (
          <div className="absolute right-3 top-3">
            {validationResult.isValid && value ? (
              <Check className="h-4 w-4 text-success" />
            ) : !validationResult.isValid ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : null}
          </div>
        )}
      </div>
      
      {/* Mensagem de erro */}
      {showError && validationResult.message && (
        <p className="mobile-form-error mt-1 text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {validationResult.message}
        </p>
      )}
      
      {/* Contador de caracteres */}
      {maxLength && isFocused && (
        <p className="mt-1 text-xs text-readable-muted text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
};

// Componente MobileFormSection
export const MobileFormSection: React.FC<MobileFormSectionProps> = ({
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className={cn('mobile-form-section', className)}>
      <div 
        className={cn(
          'mobile-form-section-header',
          collapsible && 'cursor-pointer mobile-touch-target'
        )}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <h3 className="mobile-form-section-title">{title}</h3>
        {collapsible && (
          <Button variant="ghost" size="sm" className="p-1">
            <X className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-45')} />
          </Button>
        )}
      </div>
      
      {(!collapsible || isExpanded) && (
        <div className={cn('mobile-form-section-content', isExpanded && 'mobile-slide-down')}>
          {children}
        </div>
      )}
    </div>
  );
};

// Máscaras comuns
export const MASKS = {
  PHONE: '(99) 99999-9999',
  CPF: '999.999.999-99',
  CNPJ: '99.999.999/9999-99',
  CEP: '99999-999',
  TIME: '99:99',
  DATE: '99/99/9999',
  ICAO: 'AAAA',
  CALLSIGN: 'AAA9999'
};

// Validações comuns
export const VALIDATIONS = {
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !VALIDATIONS.EMAIL.pattern?.test(value)) {
        return 'Email inválido';
      }
      return null;
    }
  },
  ICAO: {
    pattern: /^[A-Z]{4}$/,
    minLength: 4,
    maxLength: 4,
    custom: (value: string) => {
      if (value && value.length === 4 && !/^[A-Z]{4}$/.test(value)) {
        return 'Código ICAO deve ter 4 letras maiúsculas';
      }
      return null;
    }
  },
  CALLSIGN: {
    pattern: /^[A-Z0-9]{3,8}$/,
    minLength: 3,
    maxLength: 8,
    custom: (value: string) => {
      if (value && !/^[A-Z0-9]{3,8}$/.test(value)) {
        return 'Callsign deve ter 3-8 caracteres alfanuméricos';
      }
      return null;
    }
  },
  POSITIVE_NUMBER: {
    pattern: /^\d+$/,
    custom: (value: string) => {
      const num = parseInt(value);
      if (value && (isNaN(num) || num < 0)) {
        return 'Deve ser um número positivo';
      }
      return null;
    }
  },
  LANDING_RATE: {
    pattern: /^-?\d+$/,
    custom: (value: string) => {
      const num = parseInt(value);
      if (value && (isNaN(num) || num > 0)) {
        return 'Landing rate deve ser negativo (ex: -150)';
      }
      return null;
    }
  }
};