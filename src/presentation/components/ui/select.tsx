import * as React from "react";
import ReactSelect, { StylesConfig, GroupBase, Props } from "react-select";

export interface SelectOption {
  value: string | number;
  label: string;
  group?: string;
}

interface OptionGroup {
  label: string;
  options: SelectOption[];
}

type SelectOptionOrGroup = SelectOption | OptionGroup;

type BaseSelectProps = Omit<Props<SelectOption, false, GroupBase<SelectOption>>, 'onChange' | 'value'>;

export interface SelectProps extends BaseSelectProps {
  id?: string;
  name?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  options?: SelectOptionOrGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

const Select = React.forwardRef<any, SelectProps>(
  ({ 
    options = [], 
    onChange, 
    value, 
    placeholder = "Seleccione una opción...", 
    searchPlaceholder = "Escriba para buscar...",
    notFoundText = "No se encontraron resultados.", 
    disabled,
    readOnly,
    className,
    label,
    error,
    ...props 
  }, ref) => {
    // Encontrar la opción seleccionada
    const selectedOption = React.useMemo(() => {
      if (!value) return null;

      const findInOptions = (opts: SelectOption[]) => 
        opts.find(opt => {
          const [, optId] = String(opt.value).split(':');
          return optId === String(value) || String(opt.value) === String(value);
        });

      // Buscar en opciones planas o agrupadas
      for (const opt of options) {
        if ('options' in opt) {
          const found = findInOptions(opt.options);
          if (found) return found;
        } else {
          const [, optId] = String(opt.value).split(':');
          if (optId === String(value) || String(opt.value) === String(value)) {
            return opt;
          }
        }
      }
      
      return null;
    }, [value, options]);

    // Manejar el cambio de selección
    const handleChange = (option: SelectOption | null) => {
      if (onChange) {
        onChange(option ? String(option.value) : '');
      }
    };

    // Estilos personalizados para el select
    const customStyles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
      control: (base, state) => ({
        ...base,
        backgroundColor: 'hsl(var(--background))',
        borderColor: error 
          ? 'hsl(var(--destructive))' 
          : state.isFocused 
            ? 'hsl(var(--ring))' 
            : 'hsl(var(--input))',
        boxShadow: state.isFocused 
          ? error
            ? '0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--destructive))' 
            : '0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring))'
          : 'none',
        '&:hover': {
          borderColor: error 
            ? 'hsl(var(--destructive))' 
            : 'hsl(var(--ring))'
        },
        borderRadius: '0.5rem',
        padding: '1px',
        minHeight: '2.5rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 150ms'
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid hsl(var(--input))',
        boxShadow: '0px 4px 16px hsl(var(--card-foreground) / 0.1)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        zIndex: 9999,
        marginTop: '8px',
        position: 'absolute',
        width: '100%'
      }),
      menuPortal: (base) => ({
        ...base,
        zIndex: 9999
      }),
      menuList: (base) => ({
        ...base,
        padding: '4px',
        maxHeight: '300px'
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected 
          ? 'hsl(var(--primary))' 
          : state.isFocused
            ? 'hsl(var(--accent))'
            : 'transparent',
        color: state.isSelected 
          ? 'hsl(var(--primary-foreground))' 
          : state.isFocused
            ? 'hsl(var(--accent-foreground))'
            : 'hsl(var(--foreground))',
        cursor: 'pointer',
        padding: '8px 12px',
        fontSize: '0.875rem',
        transition: 'all 150ms',
        '&:active': {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))'
        },
        '&:hover': {
          backgroundColor: state.isSelected 
            ? 'hsl(var(--primary))' 
            : 'hsl(var(--accent))',
          color: state.isSelected 
            ? 'hsl(var(--primary-foreground))' 
            : 'hsl(var(--accent-foreground))'
        }
      }),
      input: (base) => ({
        ...base,
        color: 'hsl(var(--foreground))'
      }),
      singleValue: (base) => ({
        ...base,
        color: 'hsl(var(--foreground))',
        fontSize: '0.875rem'
      }),
      placeholder: (base) => ({
        ...base,
        color: 'hsl(var(--muted-foreground))',
        fontSize: '0.875rem'
      }),
      dropdownIndicator: (base, state) => ({
        ...base,
        transition: 'transform 150ms ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : undefined,
        color: 'hsl(var(--muted-foreground))',
        padding: '0 4px',
        '&:hover': {
          color: 'hsl(var(--foreground))'
        }
      }),
      clearIndicator: (base) => ({
        ...base,
        color: 'hsl(var(--muted-foreground))',
        padding: '0 2px',
        '&:hover': {
          color: 'hsl(var(--foreground))'
        }
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: 'hsl(var(--accent))',
        borderRadius: '4px'
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: 'hsl(var(--accent-foreground))',
        fontSize: '0.875rem'
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: 'hsl(var(--accent-foreground))',
        '&:hover': {
          backgroundColor: 'hsl(var(--destructive))',
          color: 'hsl(var(--destructive-foreground))'
        }
      })
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <label 
            htmlFor={props.id || props.name}
            className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <ReactSelect<SelectOption>
          {...props}
          ref={ref}
          options={options}
          value={selectedOption}
          onChange={(newValue) => handleChange(newValue as SelectOption)}
          isDisabled={disabled || readOnly}
          placeholder={placeholder}
          noOptionsMessage={() => notFoundText}
          classNamePrefix="react-select"
          className={className}
          styles={customStyles}
          isSearchable={!readOnly}
          isClearable={!readOnly}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          menuPlacement="auto"
          menuShouldBlockScroll={true}
          menuShouldScrollIntoView={false}
          closeMenuOnScroll={false}
          blurInputOnSelect={true}
          captureMenuScroll={false}
          closeMenuOnSelect={true}
          pageSize={5}
          tabSelectsValue={true}
          openMenuOnFocus={!readOnly}
          components={{
            IndicatorSeparator: () => null
          }}
          theme={(theme) => ({
            ...theme,
            spacing: {
              ...theme.spacing,
              controlHeight: 40,
              menuGutter: 8
            },
            colors: {
              ...theme.colors,
              primary: 'hsl(var(--primary))',
              primary75: 'hsl(var(--primary-foreground))',
              primary50: 'hsl(var(--accent))',
              primary25: 'hsl(var(--accent))',
              danger: 'hsl(var(--destructive))',
              dangerLight: 'hsl(var(--destructive) / 0.1)',
            },
          })}
        />
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select }; 