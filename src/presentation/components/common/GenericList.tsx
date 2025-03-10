import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react';
import { BaseService } from '@/domain/interfaces/base-service.interface';
import { BaseEntity } from '@/domain/models/base.entity';
import { toast } from 'sonner';
import { Input } from '@/presentation/components/ui/input';

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (item: T) => React.ReactNode;
  searchable?: boolean;
}

interface GenericListProps<T extends BaseEntity> {
  columns: Column<T>[];
  title: string;
  addPath: string;
  backPath?: string;
  service: BaseService<T>;
}

export function GenericList<T extends BaseEntity>({
  columns,
  title,
  addPath,
  backPath,
  service,
}: GenericListProps<T>) {
  const [items, setItems] = React.useState<T[]>([]);
  const [filteredItems, setFilteredItems] = React.useState<T[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  const loadItems = React.useCallback(async () => {
    try {
      const data = await service.findAll();
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  React.useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
      return;
    }

    const searchableColumns = columns.filter(col => col.searchable !== false);
    const filtered = items.filter(item => {
      return searchableColumns.some(column => {
        const value = column.render
          ? column.render(item)?.toString()
          : String(item[column.accessor] ?? '');
        return value?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    setFilteredItems(filtered);
  }, [searchTerm, items, columns]);

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      try {
        await service.delete(id);
        toast.success('Registro eliminado exitosamente');
        loadItems();
      } catch (error) {
        console.error('Error al eliminar el registro:', error);
        toast.error('Error al eliminar el registro');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Lista de {title.toLowerCase()}
          </p>
        </div>
        <Link to={addPath}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4">
          <div className="max-w-sm">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {column.header}
                  </th>
                ))}
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="p-4 text-center text-muted-foreground"
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
                    {columns.map((column, index) => (
                      <td key={index} className="p-4 align-middle">
                        {column.render
                          ? column.render(item)
                          : String(item[column.accessor] ?? '')}
                      </td>
                    ))}
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`${backPath || ''}/${item.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`${backPath || ''}/${item.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => handleDelete(item.id.toString())}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 