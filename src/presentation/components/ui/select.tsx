import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/presentation/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/presentation/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/presentation/components/ui/popover";

export interface SelectOption {
  value: string | number;
  label: string;
  group?: string;
}

export interface SelectProps {
  id?: string;
  name?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  options?: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    options = [], 
    onChange, 
    value, 
    placeholder = "Seleccione una opción...", 
    searchPlaceholder = "Buscar...", 
    notFoundText = "No se encontraron resultados.", 
    disabled,
    ...props 
  }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");

    // Agrupar opciones por grupo si existe
    const groupedOptions = React.useMemo(() => {
      const groups: { [key: string]: SelectOption[] } = {};
      options.forEach(option => {
        const group = option.group || 'default';
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(option);
      });
      return groups;
    }, [options]);

    const selectedOption = options.find(option => String(option.value) === String(value));

    const handleSelect = React.useCallback((optionValue: string) => {
      onChange?.(optionValue);
      setOpen(false);
      setSearchValue("");
    }, [onChange]);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            {...props}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-full p-0">
          <Command shouldFilter={false} className="w-full">
            <CommandInput 
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
              className="border-none focus:ring-0"
            />
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty>{notFoundText}</CommandEmpty>
              {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <CommandGroup key={group} heading={group === 'default' ? undefined : group}>
                  {groupOptions
                    .filter(option => 
                      option.label.toLowerCase().includes(searchValue.toLowerCase())
                    )
                    .map(option => (
                      <CommandItem
                        key={option.value}
                        value={String(option.value)}
                        onSelect={() => {
                          onChange?.(String(option.value));
                          setOpen(false);
                          setSearchValue("");
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            String(value) === String(option.value) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="flex-1">{option.label}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

Select.displayName = "Select";

export { Select }; 