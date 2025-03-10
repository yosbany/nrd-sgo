import React from 'react';
import { Input } from '@/presentation/components/ui/input';

interface QuantityInputProps {
  value: number;
  unit: { id: string; symbol: string; name: string } | undefined;
  onQuantityChange: (value: number) => void;
  onClick?: (e: React.MouseEvent) => void;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({ value, unit, onQuantityChange, onClick }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return isEditing ? (
    <div className="flex items-center bg-transparent">
      <Input
        ref={inputRef}
        type="number"
        min="1"
        className="h-10 w-20 text-left pl-0 border-0 text-lg font-bold text-blue-600 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        defaultValue=""
        onBlur={(e) => {
          const newValue = Number(e.target.value);
          if (newValue > 0) {
            onQuantityChange(newValue);
          }
          setIsEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === 'Escape') {
            setIsEditing(false);
          }
        }}
        onClick={(e) => e.stopPropagation()}
      />
      <span className="text-base font-semibold text-gray-800 italic">
        {unit?.name || unit?.symbol}
      </span>
    </div>
  ) : (
    <button
      type="button"
      className="flex items-center gap-2 text-left"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
        onClick?.(e);
      }}
    >
      <span className="text-lg font-bold text-blue-600">
        {value}
      </span>
      <span className="text-base font-semibold text-gray-800 italic">
        {unit?.name || unit?.symbol}
      </span>
    </button>
  );
}; 