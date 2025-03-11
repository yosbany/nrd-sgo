import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
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
  }>;
}

export function ArrayField({
  value = [],
  onChange,
  config,
  FormContent,
}: ArrayFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [referencedData, setReferencedData] = useState<Record<string, Record<string, any>>>({});
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
      disableDeleteIf,
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
      const newReferencedData: Record<string, Record<string, any>> = {};

      results.forEach(({ field, data }) => {
        const dataMap: Record<string, any> = {};
        data.forEach(item => {
          dataMap[item.id] = item;
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
    setEditingItem(null);
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any, index: number) => {
    setEditingItem(item);
    setEditingIndex(index);
    setIsModalOpen(true);
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

  const handleSubmit = (formValues: any) => {
    const newValue = [...value];
    if (editingIndex !== null) {
      newValue[editingIndex] = formValues;
    } else {
      newValue.push(formValues);
    }
    setIsModalOpen(false);
    onChange(newValue);
  };

  const renderCellValue = (item: any, column: Column) => {
    if (column.render) {
      return column.render(item[column.accessor], item);
    }

    if (column.reference) {
      const referenceId = item[column.accessor];
      const referenceName = column.accessor.replace('Id', '');
      const referencedItem = referencedData[referenceName]?.[referenceId];
      return referencedItem ? referencedItem[column.reference.displayField] : 'N/A';
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
          <Button 
            onClick={handleAdd} 
            size="sm" 
            variant="outline" 
            className="h-8"
            type="button"
          >
            <Plus className="h-4 w-4 mr-1" />
            {addButtonText}
          </Button>
        </div>

        {value.length === 0 ? (
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
                        {(!disableEditIf || !disableEditIf(item)) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEdit(item, index);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
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
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteClick(index);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {editingItem ? modalTitles.edit : modalTitles.add}
              </DialogTitle>
            </DialogHeader>
            <FormContent
              arrayForm={config.form}
              initialData={editingItem || {}}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
} 