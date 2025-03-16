import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { BaseEntity } from '@/domain/models/base.entity';
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
  render?: (value: unknown, item: Record<string, unknown>) => React.ReactNode;
  reference?: {
    field: Field<BaseEntity>;
    displayField: string;
  };
}

interface ArrayConfig {
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

interface ArrayFieldProps {
  value: Record<string, unknown>[];
  onChange: (newValue: Record<string, unknown>[]) => void;
  config: ArrayConfig;
  FormContent: React.ComponentType<{
    arrayForm: ArrayConfig['form'];
    initialData: Record<string, unknown>;
    onSubmit: (values: Record<string, unknown>) => void;
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
      addButtonText = 'Agregar',
      editButtonTooltip = 'Editar',
      deleteButtonTooltip = 'Eliminar',
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
        data.forEach((item: BaseEntity) => {
          if (item.id) {
            dataMap[item.id] = item;
          }
        });
        newReferencedData[field.replace('Id', '')] = dataMap;
      });

      setReferencedData(newReferencedData);
    };

    loadReferencedData();
  }, [columns]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    setIsAdding(false);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
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

  const renderCellValue = (item: Record<string, unknown>, column: Column): React.ReactNode => {
    if (column.render) {
      return column.render(item[column.accessor], item);
    }

    if (column.reference) {
      const referenceId = item[column.accessor];
      const referenceName = column.accessor.replace('Id', '');
      const referencedItem = referencedData[referenceName]?.[referenceId as string];
      return referencedItem ? String((referencedItem as Record<string, unknown>)[column.reference.displayField]) : 'N/A';
    }

    return String(item[column.accessor] ?? '');
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
          {!isAdding && !editingIndex && (
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

        {(isAdding || editingIndex !== null) && (
          <div className="rounded-lg border border-border/50 p-4">
            <FormContent
              arrayForm={config.form}
              initialData={editingIndex !== null ? value[editingIndex] : {}}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              keepOpen={keepOpen}
              onKeepOpenChange={setKeepOpen}
            />
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
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className="py-2 text-sm">
                        {renderCellValue(item, column)}
                      </TableCell>
                    ))}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-0.5">
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
                                handleEdit(index);
                              }}
                            >
                              <Pencil className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{editButtonTooltip}</p>
                          </TooltipContent>
                        </Tooltip>
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