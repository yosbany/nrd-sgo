import React from 'react';
import { parseISO } from 'date-fns';
import { cn, formatDateToDisplay } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  value?: string | Date;
  onChange?: (value: string) => void;
  defaultValue?: string | Date;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, containerClassName, value, onChange, defaultValue, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Función auxiliar para convertir cualquier fecha a objeto Date
    const toDate = (dateValue: Date | string): Date | null => {
      try {
        if (dateValue instanceof Date) {
          return dateValue;
        }
        
        if (typeof dateValue === 'string') {
          if (dateValue.includes('GMT')) {
            // Extraer la parte de la fecha del string GMT
            const dateMatch = dateValue.match(/(\w+)\s+(\w+)\s+(\d+)\s+(\d+)/);
            if (dateMatch) {
              const [, , month, date, year] = dateMatch;
              // Convertir el nombre del mes a número
              const monthMap: { [key: string]: number } = {
                Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
              };
              const monthNum = monthMap[month];
              if (monthNum !== undefined) {
                // Crear la fecha en zona horaria local
                return new Date(Number(year), monthNum, Number(date));
              }
            }
          } else if (dateValue.includes('T')) {
            return parseISO(dateValue);
          }
          // Para fechas en formato YYYY-MM-DD, crear en zona horaria local
          const [year, month, day] = dateValue.split('-').map(Number);
          return new Date(year, month - 1, day);
        }
        
        return new Date(dateValue);
      } catch (error) {
        console.error('Error converting to date:', error);
        return null;
      }
    };

    // Convertir el valor a formato YYYY-MM-DD para el input nativo
    const inputValue = React.useMemo(() => {
      const dateValue = value || defaultValue;
      if (!dateValue) return '';
      const date = toDate(dateValue);
      if (!date) return '';
      // Usar métodos locales para mantener consistencia con la zona horaria
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }, [value, defaultValue]);

    // Convertir el valor a formato de visualización dd/MM/yyyy
    const displayValue = React.useMemo(() => {
      const dateValue = value || defaultValue;
      if (!dateValue) return '';
      const date = toDate(dateValue);
      if (!date) return '';
      return formatDateToDisplay(date);
    }, [value, defaultValue]);

    // Manejar el cambio de fecha
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (onChange) {
        // El valor ya viene en formato YYYY-MM-DD, lo pasamos directamente
        onChange(newValue);
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
              !value && !defaultValue && "text-muted-foreground",
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