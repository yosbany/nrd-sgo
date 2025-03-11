import React from 'react';
import { isValid, format } from 'date-fns';
import { cn, formatDateToDisplay, formatDateToServer, parseDate } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { Button } from './button';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string;
  error?: string;
  containerClassName?: string;
  value?: string | Date;
  onChange?: (value: string) => void;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, containerClassName, value, onChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Convertir el valor a formato YYYY-MM-DD para el input nativo
    const inputValue = React.useMemo(() => {
      if (!value) return '';
      try {
        const dateObj = typeof value === 'string' ? parseDate(value) : value;
        if (!dateObj) return '';
        return format(dateObj, 'yyyy-MM-dd');
      } catch {
        return '';
      }
    }, [value]);

    // Convertir el valor a formato de visualización dd/MM/yyyy
    const displayValue = React.useMemo(() => {
      return formatDateToDisplay(value);
    }, [value]);

    // Manejar el cambio de fecha
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (onChange) {
        // Convertir la fecha seleccionada a formato ISO
        const date = new Date(newValue);
        onChange(date.toISOString());
      }
    };

    // Manejar el clic en el botón
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.showPicker();
      }
    };

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label 
            htmlFor={props.id || props.name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error ? "border-red-500" : "",
              className
            )}
            onClick={handleClick}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {displayValue || props.placeholder || 'Seleccione una fecha'}
          </Button>
          <input
            {...props}
            type="date"
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            value={inputValue}
            onChange={handleChange}
            className="sr-only"
          />
        </div>
        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker"; 