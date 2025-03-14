import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Button,
} from '@/presentation/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip';
import { Field } from './GenericForm';
import { ConfirmDialog } from './ConfirmDialog';

interface Column {
  header: string;
  accessor: string;
  render?: (value: any, item: any) => React.ReactNode;
  reference?: {
    field: Field;
    displayField: string;
  };
}

interface ArrayConfig {
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

interface ArrayFieldProps {
  value: any[];
  onChange: (newValue: any[]) => void;
  config: ArrayConfig;
  FormContent: React.ComponentType<{
    arrayForm: ArrayConfig['form'];
    initialData: Record<string, any>;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    keepOpen?: boolean;
    onKeepOpenChange?: (checked: boolean) => void;
  }>;
}

export function ArrayField({
  value = [],
  onChange,
  config,
  FormContent,
}: ArrayFieldProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [referencedData, setReferencedData] = useState<Record<string, Record<string, unknown>>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const {
    columns,
    form: {
      emptyState = {
        title: 'No hay elementos',
        description: 'Haga clic en el botón "Agregar" para comenzar.',
      },
      modalTitles = {
        add: 'Agregar elemento',
        edit: 'Editar elemento',
      },
      addButtonText = 'Agregar',
      editButtonTooltip = 'Editar',
      deleteButtonTooltip = 'Eliminar',
      disableEditIf,
    },
  } = config;

  useEffect(() => {
    const loadReferencedData = async () => {
      const referencedColumns = columns.filter(col => col.reference?.field.relatedService);
      
      const promises = referencedColumns.map(async column => {
        try {
          const service = column.reference!.field.relatedService!.service;
          const data = await service.findAll();
          return { field: column.accessor, data };
        } catch (error) {
          console.error(`Error loading referenced data for ${column.accessor}:`, error);
          return { field: column.accessor, data: [] };
        }
      });

      const results = await Promise.all(promises);
      const newReferencedData: Record<string, Record<string, unknown>> = {};

      results.forEach(({ field, data }) => {
        const dataMap: Record<string, unknown> = {};
        data.forEach(item => {
          dataMap[item.id] = item;
        });
        newReferencedData[field.replace('Id', '')] = dataMap;
      });

      setReferencedData(newReferencedData);
    };

    loadReferencedData();
  }, [columns]);

  // Actualizar el formulario cuando cambian los datos referenciados
  useEffect(() => {
    if (isAdding) {
      // Forzar una actualización del formulario
      setIsAdding(false);
      setTimeout(() => setIsAdding(true), 0);
    }
  }, [referencedData]);

  // Actualizar el formulario cuando cambian los datos referenciados
  useEffect(() => {
    if (editingIndex !== null) {
      // Forzar una actualización del formulario
      const currentIndex = editingIndex;
      setEditingIndex(null);
      setTimeout(() => setEditingIndex(currentIndex), 0);
    }
  }, [referencedData]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
  };

  const handleEdit = (item: Record<string, unknown>, index: number) => {
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleDeleteClick = (index: number) => {
    setItemToDelete(index);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (formValues: Record<string, unknown>) => {
    const newValue = [...value];
    if (editingIndex !== null) {
      newValue[editingIndex] = formValues;
      setEditingIndex(null);
    } else {
      newValue.push(formValues);
      if (!keepOpen) {
        setIsAdding(false);
      }
    }
    onChange(newValue);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
  };

  const renderCellValue = (item: Record<string, unknown>, column: Column) => {
    if (column.render) {
      return column.render(item[column.accessor], item);
    }

    if (column.reference) {
      const referenceId = item[column.accessor];
      const referenceName = column.accessor.replace('Id', '');
      const referencedItem = referencedData[referenceName]?.[referenceId as string];
      return referencedItem ? (referencedItem as Record<string, unknown>)[column.reference.displayField] : 'N/A';
    }

    return item[column.accessor];
  };

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Confirmar eliminación"
          description="¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer."
          onConfirm={() => itemToDelete !== null && handleDelete(itemToDelete)}
          confirmText="Eliminar"
          variant="destructive"
        />

        <div className="flex items-center justify-between">
          {!isAdding && (
            <Button 
              onClick={handleAdd} 
              size="sm" 
              variant="secondary" 
              className="h-8"
              type="button"
            >
              <Plus className="h-4 w-4 mr-1" />
              {addButtonText}
            </Button>
          )}
        </div>

        {isAdding && (
          <div className="rounded-lg border border-border/50 p-4">
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <FormContent
                  arrayForm={config.form}
                  initialData={{}}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  keepOpen={keepOpen}
                  onKeepOpenChange={(checked) => setKeepOpen(checked)}
                />
              </div>
            </div>
          </div>
        )}

        {value.length === 0 && !isAdding ? (
          <div className="text-center py-6 rounded-lg bg-muted/5 border border-dashed">
            <h4 className="text-sm font-medium text-muted-foreground">
              {emptyState.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {emptyState.description}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {columns.map((column, index) => (
                    <TableHead key={index} className="h-9 text-xs">
                      {column.header}
                    </TableHead>
                  ))}
                  <TableHead className="h-9 w-[80px] text-xs">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {value.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/5">
                    {editingIndex === index ? (
                      <TableCell colSpan={columns.length + 1} className="p-0">
                        <div className="p-4">
                          <FormContent
                            arrayForm={config.form}
                            initialData={item}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                          />
                        </div>
                      </TableCell>
                    ) : (
                      <>
                        {columns.map((column, colIndex) => (
                          <TableCell key={colIndex} className="py-2 text-sm">
                            {renderCellValue(item, column)}
                          </TableCell>
                        ))}
                        <TableCell className="py-2">
                          <div className="flex items-center gap-0.5">
                            {(disableEditIf ? !disableEditIf(item) : true) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleEdit(item, index);
                                    }}
                                  >
                                    <Pencil className="h-5 w-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{editButtonTooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-transparent"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteClick(index);
                                  }}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{deleteButtonTooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
} 