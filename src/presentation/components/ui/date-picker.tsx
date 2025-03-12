import React from 'react';
import { isValid, format } from 'date-fns';
import { cn, formatDateToDisplay, formatDateToServer, parseDate } from '@/lib/utils';
import { Calendar } from 'lucide-react';

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
        // Convertir la fecha seleccionada a formato ISO preservando la fecha local
        const [year, month, day] = newValue.split('-').map(Number);
        const date = new Date(year, month - 1, day, 12); // Usar hora 12 para evitar problemas con zonas horarias
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
      <div className={cn("w-full space-y-2", containerClassName)}>
        {label && (
          <label 
            htmlFor={props.id || props.name}
            className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <div
            onClick={handleClick}
            className={cn(
              "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2",
              "text-sm ring-offset-background cursor-pointer",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              !value && "text-muted-foreground",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
          >
            <Calendar className="mr-2 h-4 w-4 opacity-50" />
            {displayValue || props.placeholder || 'Seleccione una fecha'}
          </div>
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
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker"; 