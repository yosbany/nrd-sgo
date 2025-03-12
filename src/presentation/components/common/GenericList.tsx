import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { Plus, Pencil, Trash2, Eye, Search, Printer } from 'lucide-react';
import { BaseService } from '@/domain/interfaces/base-service.interface';
import { BaseEntity } from '@/domain/models/base.entity';
import { toast } from 'sonner';
import { Input } from '@/presentation/components/ui/input';
import { formatDateToDisplay } from '@/lib/utils';
import { OrderTextFormatter } from '@/presentation/components/OrderTextFormatter';
import { CustomerOrder } from '@/domain/models/customer-order.model';
import { ProductionOrder } from '@/domain/models/production-order.model';
import { PurchaseOrder } from '@/domain/models/purchase-order.model';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from './ConfirmDialog';

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
  addPath: string;
  backPath?: string;
  service: BaseService<T>;
  type?: 'customer' | 'production' | 'purchase';
  products?: any[];
  recipes?: any[];
  customerName?: Record<string, string>;
  workerName?: Record<string, string>;
  supplierName?: Record<string, string>;
  units?: Record<string, string>;
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
  backPath,
  service,
  type,
  products,
  recipes,
  customerName,
  workerName,
  supplierName,
  units,
}: GenericListProps<T>) {
  const [items, setItems] = React.useState<T[]>([]);
  const [filteredItems, setFilteredItems] = React.useState<T[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<string | null>(null);

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
    try {
      await service.delete(id);
      toast.success('Registro eliminado exitosamente');
      loadItems();
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
      toast.error('Error al eliminar el registro');
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handlePrint = (item: T) => {
    if (!type) return;

    // Verificar que el item sea una orden válida
    const isOrder = (
      'orderDate' in item &&
      'status' in item &&
      (
        ('customerId' in item) ||
        ('responsibleWorkerId' in item) ||
        ('supplierId' in item)
      )
    );

    if (!isOrder) return;

    const order = item as unknown as CustomerOrder | ProductionOrder | PurchaseOrder;
    const text = new OrderTextFormatter({
      order,
      type,
      units: Object.entries(units || {}).map(([id, name]) => ({ id, name: name as string })),
      customerName: type === 'customer' && customerName ? customerName[(order as CustomerOrder).customerId] : undefined,
      workerName: type === 'production' && workerName ? workerName[(order as ProductionOrder).responsibleWorkerId] : undefined,
      supplierName: type === 'purchase' && supplierName ? supplierName[(order as PurchaseOrder).supplierId] : undefined,
      products,
      recipes,
      format: 'print'
    }).toString();

    // Crear un elemento temporal para imprimir
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión');
      return;
    }

    // Estilo para impresión de 80mm
    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: monospace;
              font-size: 12px;
              padding: 10px;
              white-space: pre-wrap;
              width: 80mm;
              text-align: left;
            }
            div {
              text-align: left;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          ${text.replace(/\n/g, '<br>')}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
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
    <div className="min-h-[80vh] flex flex-col gap-6">
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirmar eliminación"
        description="¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer."
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        confirmText="Eliminar"
        variant="destructive"
      />

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
                        {renderCellContent(item, column)}
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
                        {type && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePrint(item)}
                            title="Imprimir"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(item.id.toString());
                          }}
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