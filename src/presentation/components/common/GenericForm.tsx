import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Select } from '@/presentation/components/ui/select';
import { Textarea } from '@/presentation/components/ui/textarea';
import { DatePicker } from '@/presentation/components/ui/date-picker';
import { ArrowLeft, Save } from 'lucide-react';
import { BaseService } from '@/domain/interfaces/base-service.interface';
import { BaseEntity } from '@/domain/models/base.entity';
import { toast } from 'sonner';
import { ArrayField } from './ArrayField';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import { Separator } from '@/presentation/components/ui/separator';
import { formatDateToServer } from '@/lib/utils';

export interface RelatedService<T extends BaseEntity> {
  service: BaseService<T>;
  labelField: keyof T;
  valueField?: keyof T;
}

export interface Column {
  header: string;
  accessor: string;
  render?: (value: any, item: Record<string, any>) => React.ReactNode;
  reference?: {
    field: Field;
    displayField: string;
  };
}

export interface ArrayConfig {
  columns: Column[];
  form: {
    fields: Field[];
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
    disableEditIf?: (item: Record<string, any>) => boolean;
    disableDeleteIf?: (item: Record<string, any>) => boolean;
  };
}

export interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea' | 'array' | 'boolean';
  options?: { value: string | number; label: string }[];
  required?: boolean;
  placeholder?: string;
  relatedService?: RelatedService<any>;
  arrayConfig?: ArrayConfig;
  readOnly?: boolean;
  onChange?: (value: any, formData?: Record<string, any>) => void | Record<string, any>;
}

export interface Section<T extends BaseEntity> {
  title: string;
  fields: Field[];
  visible?: (values: Partial<T>) => boolean;
}

interface GenericFormProps<T extends BaseEntity> {
  title: string;
  fields?: Field[];
  sections?: Section<T>[];
  initialValues?: Partial<T>;
  backPath: string;
  service: BaseService<T>;
  onSuccess?: () => void;
  onFieldChange?: (fieldName: string, value: any) => void;
  children?: React.ReactNode;
}

function ArrayFormContent({
  arrayForm,
  initialData,
  onSubmit,
  onCancel,
}: {
  arrayForm: ArrayConfig['form'];
  initialData: Record<string, any>;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = React.useState<Record<string, any>>(initialData);
  const [relatedData, setRelatedData] = React.useState<Record<string, any[]>>({});

  React.useEffect(() => {
    const loadRelatedData = async () => {
      const promises = arrayForm.fields
        .filter(field => field.relatedService)
        .map(async field => {
          try {
            const data = await field.relatedService!.service.findAll();
            return { field: field.name, data };
          } catch (error) {
            console.error(`Error loading data for ${field.name}:`, error);
            toast.error(`Error al cargar datos relacionados para ${field.label}`);
            return { field: field.name, data: [] };
          }
        });

      const results = await Promise.all(promises);
      const newRelatedData: Record<string, any[]> = {};
      
      results.forEach(({ field, data }) => {
        newRelatedData[field] = data;
      });

      setRelatedData(newRelatedData);
    };

    loadRelatedData();
  }, [arrayForm.fields]);

  const handleFieldChange = (value: string, field: Field) => {
    setFormData((prev: Record<string, any>) => ({
      ...prev,
      [field.name]: value
    }));
  };

  const getFieldOptions = (field: Field) => {
    if (field.relatedService && relatedData[field.name]) {
      const { labelField, valueField } = field.relatedService;
      return relatedData[field.name].map(item => ({
        value: item[valueField || 'id'],
        label: item[labelField],
      }));
    }
    return field.options || [];
  };

  return (
    <div className="space-y-6 py-4">
      <div className="grid gap-6">
        {arrayForm.fields.map((formField) => (
          <div key={formField.name} className="space-y-2">
            <Label htmlFor={formField.name}>
              {formField.label}
              {formField.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {formField.type === 'select' ? (
              <Select
                id={formField.name}
                name={formField.name}
                value={formData[formField.name] || ''}
                onChange={(value) => handleFieldChange(value, formField)}
                required={formField.required}
                className="w-full"
                options={getFieldOptions(formField)}
                placeholder={formField.placeholder || "Seleccione una opción"}
                searchPlaceholder="Buscar..."
                notFoundText="No se encontraron resultados"
              />
            ) : formField.type === 'textarea' ? (
              <Textarea
                id={formField.name}
                name={formField.name}
                value={formData[formField.name] || ''}
                onChange={(e) => handleFieldChange(e.target.value, formField)}
                required={formField.required}
                placeholder={formField.placeholder}
                className="min-h-[100px]"
              />
            ) : (
              <Input
                id={formField.name}
                type={formField.type}
                name={formField.name}
                value={formData[formField.name] || ''}
                onChange={(e) => handleFieldChange(e.target.value, formField)}
                required={formField.required}
                placeholder={formField.placeholder}
                className="w-full"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={() => onSubmit(formData)}>
          Guardar
        </Button>
      </div>
    </div>
  );
}

export function GenericForm<T extends BaseEntity>({
  title,
  fields,
  sections,
  initialValues = {},
  backPath,
  service,
  onSuccess,
  onFieldChange,
  children,
}: GenericFormProps<T>) {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<Partial<T>>(initialValues);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [relatedData, setRelatedData] = React.useState<Record<string, any[]>>({});

  React.useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  React.useEffect(() => {
    const loadRelatedData = async () => {
      const allFields = sections 
        ? sections.flatMap(section => section.fields)
        : fields || [];

      const promises = allFields
        .filter(field => field.relatedService)
        .map(async field => {
          try {
            const data = await field.relatedService!.service.findAll();
            return { field: field.name, data };
          } catch (error) {
            console.error(`Error loading data for ${field.name}:`, error);
            toast.error(`Error al cargar datos relacionados para ${field.label}`);
            return { field: field.name, data: [] };
          }
        });

      const results = await Promise.all(promises);
      const newRelatedData: Record<string, any[]> = {};
      
      results.forEach(({ field, data }) => {
        newRelatedData[field] = data;
      });

      setRelatedData(newRelatedData);
    };

    loadRelatedData();
  }, [fields, sections]);

  const getFieldValue = (field: Field) => {
    const value = formData[field.name as keyof T];
    
    if (field.type === 'array') {
      return Array.isArray(value) ? value : [];
    }
    
    if (field.type === 'date') {
      return formatDateToServer(value as string | Date | undefined);
    }
    
    if (field.type === 'boolean') {
      return Boolean(value);
    }

    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  };

  const getInputValue = (field: Field): string => {
    if (field.type === 'boolean') return '';
    if (field.type === 'number') {
      const value = formData[field.name as keyof T];
      return value === null || value === undefined || value === '' ? '' : String(value);
    }
    return getFieldValue(field).toString();
  };

  const handleChange = (value: any, field: Field) => {
    let processedValue: any = value;

    if (field.type === 'number') {
      if (value === '' || value === null || value === undefined) {
        processedValue = '';
      } else {
        const numValue = value?.target?.value ?? value;
        processedValue = numValue === '' ? '' : Number(numValue);
        if (isNaN(processedValue)) {
          processedValue = '';
        }
      }
    } else if (field.type === 'date') {
      // Para campos de fecha, mantenemos el valor en formato YYYY-MM-DD
      processedValue = value;
    } else if (field.type === 'boolean') {
      processedValue = Boolean(value);
    } else if (field.type === 'select') {
      processedValue = value;
    } else if (value?.target) {
      processedValue = value.target.value;
    }

    setFormData(prev => ({
      ...prev,
      [field.name]: processedValue,
    }));

    // Call field's onChange handler if provided
    if (field.onChange) {
      const result = field.onChange(processedValue, formData);
      if (result !== undefined) {
        processedValue = result;
        setFormData(prev => ({
          ...prev,
          [field.name]: result,
        }));
      }
    }

    // Notify parent component about the change
    onFieldChange?.(field.name, processedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (initialValues.id) {
        await service.update(initialValues.id, formData);
        toast.success('Registro actualizado exitosamente');
      } else {
        await service.create(formData as Omit<T, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success('Registro creado exitosamente');
      }
      onSuccess?.();
      navigate(backPath);
    } catch (error) {
      console.error('Error al guardar el registro:', error);
      toast.error('Error al guardar el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldOptions = (field: Field) => {
    if (field.relatedService && relatedData[field.name]) {
      const { labelField, valueField } = field.relatedService;
      return relatedData[field.name].map(item => ({
        value: item[valueField || 'id'],
        label: item[labelField],
      }));
    }
    return field.options || [];
  };

  const renderField = (field: Field) => (
    <div key={field.name} className={`space-y-2 ${field.type === 'array' ? 'col-span-2' : ''}`}>
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.type === 'select' ? (
        <Select
          id={field.name}
          name={field.name}
          value={getFieldValue(field) as string}
          onChange={(value) => handleChange(value, field)}
          required={field.required}
          className="w-full"
          options={getFieldOptions(field)}
          placeholder={field.placeholder || "Seleccione una opción"}
          searchPlaceholder="Buscar..."
          notFoundText="No se encontraron resultados"
        />
      ) : field.type === 'textarea' ? (
        <Textarea
          id={field.name}
          name={field.name}
          value={getFieldValue(field) as string}
          onChange={(e) => handleChange(e.target.value, field)}
          required={field.required}
          placeholder={field.placeholder}
          className="min-h-[100px]"
        />
      ) : field.type === 'boolean' ? (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            name={field.name}
            checked={getFieldValue(field) as boolean}
            onCheckedChange={(checked) => handleChange(checked, field)}
            disabled={field.readOnly}
          />
          <label
            htmlFor={field.name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {field.placeholder || field.label}
          </label>
        </div>
      ) : field.type === 'array' ? (
        <ArrayField
          config={field.arrayConfig!}
          value={getFieldValue(field) as any[]}
          onChange={(value) => handleChange(value, field)}
          FormContent={ArrayFormContent}
        />
      ) : field.type === 'date' ? (
        <DatePicker
          id={field.name}
          name={field.name}
          value={getFieldValue(field) as string}
          onChange={(value) => handleChange(value, field)}
          required={field.required}
          placeholder={field.placeholder}
          className="w-full"
        />
      ) : (
        <Input
          id={field.name}
          type={field.type}
          name={field.name}
          value={getFieldValue(field) as string}
          onChange={(e) => handleChange(e.target.value, field)}
          required={field.required}
          placeholder={field.placeholder}
          className="w-full"
        />
      )}
    </div>
  );

  const renderFields = (fieldsToRender: Field[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fieldsToRender.map(renderField)}
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate(backPath)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>

        {sections ? (
          <div className="space-y-8">
            {sections.map((section, index) => (
              section.visible ? (
                section.visible(formData) && (
                  <div key={section.title} className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      <Separator />
                    </div>
                    {renderFields(section.fields)}
                  </div>
                )
              ) : (
                <div key={section.title} className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    <Separator />
                  </div>
                  {renderFields(section.fields)}
                </div>
              )
            ))}
          </div>
        ) : (
          renderFields(fields || [])
        )}

        {children}

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(backPath)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {initialValues.id ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Card>
  );
} 