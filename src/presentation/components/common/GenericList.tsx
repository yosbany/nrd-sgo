import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/button';
import { Plus, Pencil, Trash2, Eye, Search, Printer } from 'lucide-react';
import { BaseService } from '@/domain/interfaces/base-service.interface';
import { BaseEntity } from '@/domain/models/base.entity';
import { toast } from 'sonner';
import { Input } from '@/presentation/components/ui/input';
import { formatDateToDisplay } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from './ConfirmDialog';
import { PageHeader } from './PageHeader';

interface TagConfig {
  value: string | number;
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

interface Column<T> {
  header: string;
  accessor: keyof T;
  type?: 'text' | 'number' | 'date' | 'tag';
  render?: (item: T) => React.ReactNode;
  searchable?: boolean;
  tags?: TagConfig[];
}

interface GenericListProps<T extends BaseEntity> {
  columns: Column<T>[];
  title: string;
  addPath?: string;
  onAddClick?: () => void;
  backPath?: string;
  service: BaseService<T>;
  type?: 'customer' | 'production' | 'purchase';
  onPrint?: (item: T) => void;
}

const Tag: React.FC<{ config: TagConfig }> = ({ config }) => {
  const getTagStyles = (color: TagConfig['color']) => {
    switch (color) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-orange-100 text-orange-700';
      case 'danger':
        return 'bg-red-100 text-red-700';
      case 'info':
        return 'bg-blue-100 text-blue-700';
      case 'primary':
        return 'bg-primary/20 text-primary';
      case 'secondary':
        return 'bg-secondary/20 text-secondary';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      getTagStyles(config.color)
    )}>
      {config.label}
    </span>
  );
};

export function GenericList<T extends BaseEntity>({
  columns,
  title,
  addPath,
  onAddClick,
  backPath,
  service,
  onPrint,
}: GenericListProps<T>) {
  const [items, setItems] = React.useState<T[]>([]);
  const [filteredItems, setFilteredItems] = React.useState<T[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<string | null>(null);

  const memoizedService = React.useMemo(() => service, [service]);
  const memoizedTitle = React.useMemo(() => title, [title]);

  const actionsColumn = {
    header: 'Acciones',
    accessor: 'actions' as keyof T,
    render: (item: T) => (
      <div className="flex gap-2 justify-end">
        {onPrint && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onPrint(item);
            }}
          >
            <Printer className="h-4 w-4" />
          </Button>
        )}
        <Link to={`${backPath || ''}/${item.id}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Ver detalles"
          >
            <Eye className="h-5 w-5" />
          </Button>
        </Link>
        <Link to={`${backPath || ''}/${item.id}/edit`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Editar"
          >
            <Pencil className="h-5 w-5" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (item.id) {
              handleDeleteClick(item.id);
            }
          }}
          title="Eliminar"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    ),
  };

  // Asegurar que el campo nro siempre sea la primera columna
  const nroColumn: Column<T> = {
    header: '#',
    accessor: 'nro' as keyof T,
    type: 'text',
    searchable: true,
  };

  // Filtrar el campo nro de las columnas existentes si ya existe
  const filteredColumns = columns.filter(col => col.accessor !== 'nro');

  // Combinar las columnas con nro al inicio
  const allColumns = [nroColumn, ...filteredColumns, actionsColumn];

  const loadItems = React.useCallback(async () => {
    try {
      // Solo logear si no estamos cargando
      if (!isLoading) {
        console.log('Cargando items', { title: memoizedTitle });
      }
      const data = await memoizedService.findAll();
      setItems(data);
      setFilteredItems(data);
      console.log('Items cargados exitosamente', { count: data.length });
    } catch (error) {
      console.error('Error al cargar los datos', { error, title: memoizedTitle });
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [memoizedService, memoizedTitle, isLoading]);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  React.useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
      return;
    }

    console.log('Filtrando items', { searchTerm, totalItems: items.length });
    const searchableColumns = columns.filter(col => col.searchable !== false);
    const filtered = items.filter(item => {
      return searchableColumns.some(column => {
        const value = column.render
          ? String(column.render(item))
          : String(item[column.accessor] ?? '');
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    console.log('Filtrado completado', { 
      filteredCount: filtered.length,
      searchableColumns: searchableColumns.length 
    });
    setFilteredItems(filtered);
  }, [searchTerm, items, columns]);

  const handleDelete = async (id: string) => {
    try {
      console.log('Eliminando item', { id, title: memoizedTitle });
      await memoizedService.delete(id);
      console.log('Item eliminado exitosamente', { id });
      toast.success('Registro eliminado exitosamente');
      loadItems();
    } catch (error) {
      console.error('Error al eliminar el registro', { error, id, title: memoizedTitle });
      toast.error('Error al eliminar el registro');
    }
  };

  const handleDeleteClick = (id: string) => {
    console.log('Iniciando proceso de eliminación', { id });
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const renderCellContent = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }

    const value = item[column.accessor];

    if (column.type === 'date') {
      return formatDateToDisplay(value as string | Date);
    }

    if (column.type === 'tag' && column.tags) {
      const tagConfig = column.tags.find(tag => tag.value === value);
      if (tagConfig) {
        return <Tag config={tagConfig} />;
      }
    }

    return String(value ?? '');
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={title}
        subtitle={`Lista de ${title.toLowerCase()}`}
        actions={
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[300px] pl-9"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            </div>
            {onAddClick ? (
              <Button onClick={onAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo
              </Button>
            ) : addPath ? (
              <Link to={addPath}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="flex-1 p-4">
        <div className="flex justify-end mb-2">
          <span className="text-sm text-muted-foreground">
            {searchTerm.trim() !== '' ? (
              <>
                Filtrados: <span className="font-medium text-foreground">{filteredItems.length}</span>
                <span className="mx-2">|</span>
                Total: <span className="font-medium text-foreground">{items.length}</span>
              </>
            ) : (
              <>
                Total: <span className="font-medium text-foreground">{items.length} {items.length === 1 ? title.slice(0, -1).toLowerCase() : title.toLowerCase()}</span>
              </>
            )}
          </span>
        </div>
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/50">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  {allColumns.map((column, index) => (
                    <th
                      key={index}
                      className={cn(
                        "h-10 px-2 text-left align-middle font-medium text-muted-foreground",
                        column.header === 'Acciones' && "text-right",
                        column.header === '#' && "w-[60px] text-center"
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={allColumns.length}
                      className="p-2 text-center text-muted-foreground"
                    >
                      {searchTerm.trim() !== ''
                        ? `No se encontraron ${title.toLowerCase()} que coincidan con la búsqueda`
                        : `No hay ${title.toLowerCase()} registrados`}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      {allColumns.map((column, index) => (
                        <td
                          key={index}
                          className={cn(
                            "p-2 align-middle",
                            column.header === '#' && "text-center font-medium"
                          )}
                        >
                          {renderCellContent(item, column as Column<T>)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirmar eliminación"
        description="¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer."
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        confirmText="Eliminar"
        variant="destructive"
      />
    </div>
  );
} 