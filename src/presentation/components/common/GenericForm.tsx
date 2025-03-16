import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Select, SelectOption } from '@/presentation/components/ui/select';
import { Textarea } from '@/presentation/components/ui/textarea';
import { DatePicker } from '@/presentation/components/ui/date-picker';
import { Loader2 } from 'lucide-react';
import { BaseService } from '@/domain/interfaces/base-service.interface';
import { BaseEntity } from '@/domain/models/base.entity';
import { toast } from 'sonner';
import { ArrayField } from './ArrayField';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { PageHeader } from './PageHeader';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/presentation/components/ui/form";
import { useForm, DefaultValues, Path, PathValue } from "react-hook-form";
import { ArrowLeft } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/presentation/components/ui/tooltip";

export interface RelatedService<R extends BaseEntity = BaseEntity> {
  service: BaseService<R>;
  labelField?: string;
  valueField?: string;
  labelKey?: keyof R;
  valueKey?: keyof R;
}

export interface Column {
  header: string;
  accessor: string;
  render?: (value: unknown, item: Record<string, unknown>) => React.ReactNode;
  reference?: {
    field: Field<BaseEntity>;
    displayField: string;
  };
}

export interface ArrayConfig {
  columns: Column[];
  form: {
    fields: Field<BaseEntity>[];
    emptyState?: {
      title: string;
      description: string;
    };
    modalTitles?: {
      add: string;
      edit: string;
    };
    addButtonText?: string;
    editButtonTooltip?: string;
    deleteButtonTooltip?: string;
    disableEditIf?: (item: Record<string, unknown>) => boolean;
    disableDeleteIf?: (item: Record<string, unknown>) => boolean;
  };
}

export interface Field<T extends BaseEntity> {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'custom' | 'array' | 'boolean';
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  relatedService?: RelatedService<BaseEntity>;
  readOnly?: boolean;
  required?: boolean;
  onChange?: (value: unknown, formData?: Record<string, unknown>) => void | Record<string, unknown>;
  fullWidth?: boolean;
  component?: React.ReactNode;
  arrayConfig?: ArrayConfig;
  visible?: (values: Partial<T>) => boolean;
}

export interface Section<T extends BaseEntity> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  fields: Field<T>[];
  visible?: (values: Partial<T>) => boolean;
}

interface GenericFormProps<T extends BaseEntity> {
  title: string;
  fields?: Field<T>[];
  sections?: Section<T>[];
  initialValues?: DefaultValues<T>;
  backPath: string;
  service: BaseService<T>;
  onSuccess?: () => void;
  onFieldChange?: (fieldName: keyof T, value: T[keyof T]) => void;
  children?: React.ReactNode;
  transformValues?: (values: T) => T;
}

interface ArrayFormContentProps {
  arrayForm: ArrayConfig['form'];
  initialData: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
  keepOpen?: boolean;
  onKeepOpenChange?: (checked: boolean) => void;
}

const ArrayFormContent: React.FC<ArrayFormContentProps> = ({
  arrayForm,
  initialData,
  onSubmit,
  onCancel,
  keepOpen,
  onKeepOpenChange,
}) => {
  const [formData, setFormData] = React.useState<Record<string, unknown>>(initialData);
  const [relatedData, setRelatedData] = React.useState<Record<string, BaseEntity[]>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  const resetForm = () => {
    setFormData({});
  };

  const handleSubmitInternal = () => {
    onSubmit(formData);
    if (keepOpen) {
      resetForm();
    }
  };

  React.useEffect(() => {
    const loadRelatedData = async () => {
      setIsLoading(true);
      try {
        const fieldsWithService = arrayForm.fields.filter(field => 
          field.relatedService?.service && 
          typeof field.relatedService.service.findAll === 'function'
        );

        const promises = fieldsWithService.map(async field => {
          try {
            const result = await field.relatedService!.service.findAll();
            return { field: field.name, data: result };
          } catch {
            toast.error(`Error al cargar datos para ${field.label}`);
            return { field: field.name, data: [] };
          }
        });

        const results = await Promise.all(promises);
        const newRelatedData: Record<string, BaseEntity[]> = {};
        
        results.forEach(({ field, data }) => {
          if (data && Array.isArray(data)) {
            newRelatedData[field] = data;
          }
        });

        setRelatedData(newRelatedData);
      } catch (error) {
        console.error('Error loading related data', { error });
      } finally {
        setIsLoading(false);
      }
    };

    loadRelatedData();
  }, [arrayForm.fields]);

  // Actualizar el formulario cuando cambian los datos iniciales
  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleFieldChange = (value: unknown, field: Field<BaseEntity>) => {
    setFormData(prev => ({
      ...prev,
      [field.name]: value
    }));

    if (field.onChange) {
      const result = field.onChange(value, formData);
      if (result) {
        setFormData(prev => ({
          ...prev,
          ...result
        }));
      }
    }
  };

  const getFieldOptions = (field: Field<BaseEntity>): SelectOption[] => {
    if (field.options) {
      return field.options;
    }

    if (field.relatedService && relatedData[field.name] && Array.isArray(relatedData[field.name])) {
      const data = relatedData[field.name];
      const options: SelectOption[] = [];

      data.forEach(item => {
        let value: unknown;
        let label: unknown;

        const itemAsRecord = item as unknown as Record<string, unknown>;

        if (field.relatedService?.valueField) {
          value = itemAsRecord[field.relatedService.valueField];
        } else if (field.relatedService?.valueKey) {
          value = itemAsRecord[field.relatedService.valueKey as string];
        } else {
          value = itemAsRecord['id'];
        }

        if (field.relatedService?.labelField) {
          label = itemAsRecord[field.relatedService.labelField];
        } else if (field.relatedService?.labelKey) {
          label = itemAsRecord[field.relatedService.labelKey as string];
        } else {
          label = itemAsRecord['name'];
        }

        if (value === undefined || value === null || label === undefined || label === null) {
          return;
        }

        options.push({
          value: String(value),
          label: String(label)
        });
      });

      return options;
    }

    return field.options || [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Cargando opciones...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 w-full">
      {arrayForm.fields.map((formField) => {
        const options = formField.type === 'select' ? getFieldOptions(formField) : [];
        const currentValue = formData[formField.name];
        
        return (
          <div key={formField.name} className="flex-1 min-w-[200px]">
            <Label htmlFor={formField.name} className="sr-only">
              {formField.label}
              {formField.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {formField.type === 'select' ? (
              <Select
                id={formField.name}
                name={formField.name}
                value={currentValue ? String(currentValue) : ''}
                onChange={(value) => handleFieldChange(value, formField)}
                required={formField.required}
                readOnly={formField.readOnly}
                className="w-full"
                options={options}
                placeholder={formField.placeholder || formField.label}
                searchPlaceholder="Buscar..."
                notFoundText="No se encontraron resultados"
              />
            ) : formField.type === 'textarea' ? (
              <Textarea
                id={formField.name}
                name={formField.name}
                value={currentValue ? String(currentValue) : ''}
                onChange={(e) => handleFieldChange(e.target.value, formField)}
                required={formField.required}
                placeholder={formField.placeholder || formField.label}
                className="min-h-[38px] max-h-[38px]"
              />
            ) : (
              <Input
                id={formField.name}
                type={formField.type}
                name={formField.name}
                value={currentValue ? String(currentValue) : ''}
                onChange={(e) => handleFieldChange(e.target.value, formField)}
                required={formField.required}
                placeholder={formField.placeholder || formField.label}
                className="w-full"
              />
            )}
          </div>
        );
      })}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2">
          {onKeepOpenChange && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Checkbox
                    id="keepOpen"
                    checked={keepOpen}
                    onCheckedChange={onKeepOpenChange}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mantener abierto</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Button type="button" variant="ghost" onClick={onCancel} size="sm">
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmitInternal} size="sm">
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
};

export function GenericForm<T extends BaseEntity>({
  title,
  fields = [],
  sections,
  initialValues = {} as DefaultValues<T>,
  backPath,
  service,
  onSuccess,
  transformValues,
}: GenericFormProps<T>) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [relatedData, setRelatedData] = React.useState<Record<string, T[]>>({});
  const form = useForm<T>({
    defaultValues: initialValues,
  });

  // Actualizar valores del formulario cuando cambien los initialValues
  React.useEffect(() => {
    console.log('Actualizando valores iniciales del formulario', { 
      hasId: !!initialValues.id,
      fieldsCount: fields.length 
    });
    form.reset(initialValues);
  }, [form, initialValues, fields.length]);

  React.useEffect(() => {
    const loadRelatedData = async () => {
      const allFields = sections 
        ? sections.flatMap(section => section.fields)
        : fields || [];

      const fieldsToLoad = allFields
        .filter(field => 
          field.relatedService && 
          field.relatedService.service && 
          typeof field.relatedService.service.findAll === 'function' &&
          !relatedData[field.name]
        );

      if (fieldsToLoad.length === 0) return;

      console.log('Cargando datos relacionados', { 
        fieldsCount: fieldsToLoad.length,
        fields: fieldsToLoad.map(f => f.name)
      });

      const promises = fieldsToLoad.map(async field => {
        try {
          if (!field.relatedService?.service?.findAll) {
            console.warn(`Servicio no configurado correctamente para el campo ${field.name}`);
            return { field: field.name, data: [] };
          }
          const result = await field.relatedService.service.findAll();
          console.log(`Datos cargados para ${field.name}`, { count: result.length });
          return { field: field.name, data: result };
        } catch (error) {
          console.error(`Error al cargar datos para ${field.name}`, { error });
          toast.error(`Error al cargar datos relacionados para ${field.label}`);
          return { field: field.name, data: [] };
        }
      });

      const results = await Promise.all(promises);
      const newRelatedData: Record<string, T[]> = { ...relatedData };
      
      results.forEach(({ field, data }) => {
        newRelatedData[field] = data as T[];
      });

      setRelatedData(newRelatedData);
    };

    loadRelatedData();
  }, [fields, sections, relatedData]);

  const handleSubmit = async (data: T) => {
    setIsSubmitting(true);
    console.log('Iniciando envío del formulario', { 
      hasId: !!initialValues.id,
      fieldsCount: Object.keys(data).length 
    });

    try {
      // Procesar los datos antes de enviar
      const processedData = Object.entries(data).reduce((acc, [key, value]) => {
        // Si es una fecha, convertirla a formato ISO
        if (value instanceof Date) {
          acc[key] = value.toISOString();
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string | number | boolean | null | undefined | unknown[]>);

      // Aplicar transformación personalizada si existe
      const transformedData = transformValues ? transformValues(processedData as unknown as T) : processedData;

      // Eliminar campos undefined antes de enviar
      const cleanData = Object.fromEntries(
        Object.entries(transformedData).filter(([, value]) => value !== undefined)
      ) as unknown as T;

      console.log('Datos procesados para enviar:', { 
        originalData: data,
        processedData: cleanData 
      });

      if (initialValues.id) {
        console.log('Actualizando registro existente', { 
          id: initialValues.id,
          data: cleanData
        });
        await service.update(initialValues.id, cleanData);
        console.log('Registro actualizado exitosamente', { id: initialValues.id });
        toast.success('Registro actualizado exitosamente');
      } else {
        console.log('Creando nuevo registro', { data: cleanData });
        await service.create(cleanData as Omit<T, 'id' | 'nro' | 'createdAt' | 'updatedAt'>);
        console.log('Registro creado exitosamente');
        toast.success('Registro creado exitosamente');
      }
      onSuccess?.();
      navigate(backPath);
    } catch (error: unknown) {
      console.error('Error al guardar el registro', { error });
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el registro';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldOptions = (field: Field<T>): SelectOption[] => {
    if (field.options) {
      return field.options;
    }

    if (field.relatedService && relatedData[field.name] && Array.isArray(relatedData[field.name])) {
      const data = relatedData[field.name];
      const options: SelectOption[] = [];

      data.forEach(item => {
        let value: unknown;
        let label: unknown;

        const itemAsRecord = item as unknown as Record<string, unknown>;

        if (field.relatedService?.valueField) {
          value = itemAsRecord[field.relatedService.valueField];
        } else if (field.relatedService?.valueKey) {
          value = itemAsRecord[field.relatedService.valueKey as string];
        } else {
          value = itemAsRecord['id'];
        }

        if (field.relatedService?.labelField) {
          label = itemAsRecord[field.relatedService.labelField];
        } else if (field.relatedService?.labelKey) {
          label = itemAsRecord[field.relatedService.labelKey as string];
        } else {
          label = itemAsRecord['name'];
        }

        if (value === undefined || value === null || label === undefined || label === null) {
          return;
        }

        options.push({
          value: String(value),
          label: String(label)
        });
      });

      return options;
    }

    return field.options || [];
  };

  const getFieldValue = (field: Field<T>, value: unknown): string | boolean | unknown[] => {
    if (field.type === 'boolean') {
      return Boolean(value);
    }
    if (field.type === 'array') {
      return Array.isArray(value) ? value as Record<string, unknown>[] : [];
    }
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  const renderField = (field: Field<T>) => {
    const values = form.getValues();
    if (field.visible && !field.visible(values)) {
      return null;
    }

    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name as Path<T>}
        render={({ field: formField }) => {
          console.log(`Renderizando campo ${field.name}`, {
            type: field.type,
            hasOnChange: !!field.onChange,
            currentValue: formField.value
          });

          const handleChange = (value: unknown) => {
            console.log(`Cambio en campo ${field.name}`, {
              oldValue: formField.value,
              newValue: value,
              hasOnChange: !!field.onChange
            });

            // Primero actualizamos el valor en el formulario
            formField.onChange(value);

            // Si hay un onChange personalizado, lo ejecutamos después
            if (field.onChange) {
              const result = field.onChange(value, form.getValues() as Record<string, unknown>);
              if (result) {
                // Actualizamos solo los campos específicos que devuelve el onChange
                Object.entries(result).forEach(([key, val]) => {
                  form.setValue(key as Path<T>, val as unknown as PathValue<T, Path<T>>, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true
                  });
                });
              }
            }
          };

          return (
            <FormItem className={cn(
              (field.fullWidth || field.type === 'array' || field.type === 'textarea') ? "md:col-span-2 2xl:col-span-3" : "",
              field.type === 'boolean' ? "flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4" : "",
              "w-full"
            )}>
              <FormLabel className={cn(
                field.type === 'boolean' ? "leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" : ""
              )}>
                {field.label}
              </FormLabel>
              <FormControl>
                {field.type === "select" ? (
                  <Select
                    value={getFieldValue(field, formField.value) as string}
                    onChange={handleChange}
                    options={getFieldOptions(field)}
                    placeholder={field.placeholder}
                    className="w-full"
                  />
                ) : field.type === "textarea" ? (
                  <Textarea
                    value={getFieldValue(field, formField.value) as string}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full min-h-[100px]"
                  />
                ) : field.type === "custom" ? (
                  field.component
                ) : field.type === "boolean" ? (
                  <Checkbox
                    checked={getFieldValue(field, formField.value) as boolean}
                    onCheckedChange={handleChange}
                    className="h-5 w-5"
                  />
                ) : field.type === "array" ? (
                  <ArrayField
                    config={field.arrayConfig!}
                    value={(getFieldValue(field, formField.value) as unknown[]) as Record<string, unknown>[]}
                    onChange={handleChange}
                    FormContent={ArrayFormContent}
                  />
                ) : field.type === "date" ? (
                  <DatePicker
                    value={getFieldValue(field, formField.value) as string}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full"
                  />
                ) : (
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={getFieldValue(field, formField.value) as string}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full"
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={title}
        subtitle={initialValues.id ? "Editar registro" : "Crear nuevo registro"}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(backPath)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 w-full h-full">
          <div className="flex-1 w-full bg-card">
            {sections ? (
              <div className="space-y-8 p-6">
                {sections.map((section, index) => (
                  (!section.visible || section.visible(form.getValues())) && (
                    <div key={index} className="space-y-4">
                      <div className="flex flex-col space-y-1.5 pb-4 border-b">
                        <div className="flex items-center gap-2">
                          {section.icon}
                          <h3 className="text-lg font-semibold">{section.title}</h3>
                        </div>
                        {section.description && (
                          <p className="text-sm text-muted-foreground">
                            {section.description}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {section.fields.map(field => renderField(field))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 p-6">
                {fields.map(field => renderField(field))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 p-4 bg-card border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(backPath)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 