import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/button';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { BaseService } from '@/domain/interfaces/base-service.interface';
import { BaseEntity } from '@/domain/models/base.entity';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PageHeader } from './PageHeader';
import { ConfirmDialog } from './ConfirmDialog';

interface Field {
  label: string;
  value: string | number | React.ReactNode;
  colSpan?: number;
}

interface GenericDetailsProps<T extends BaseEntity> {
  title: string;
  fields: (data: T) => Field[];
  editPath: string;
  backPath: string;
  service: BaseService<T>;
  id: string;
}

export function GenericDetails<T extends BaseEntity>({
  title,
  fields,
  editPath,
  backPath,
  service,
  id,
}: GenericDetailsProps<T>) {
  const navigate = useNavigate();
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Cargando detalles', { id });
        const result = await service.findById(id);
        setData(result);
        console.log('Detalles cargados exitosamente', { data: result });
      } catch (error) {
        console.error('Error al cargar los detalles', { error });
        toast.error('Error al cargar los detalles');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, service]);

  const handleDelete = async () => {
    try {
      console.log('Eliminando registro', { id });
      await service.delete(id);
      console.log('Registro eliminado exitosamente', { id });
      toast.success('Registro eliminado exitosamente');
      navigate(backPath);
    } catch (error) {
      console.error('Error al eliminar el registro', { error });
      toast.error('Error al eliminar el registro');
    }
  };

  if (isLoading || !data) {
    console.log('Mostrando estado de carga', { isLoading, hasData: !!data });
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const fieldValues = fields(data);
  console.log('Renderizando detalles', { 
    fieldsCount: fieldValues.length,
    hasData: !!data 
  });

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={title}
        subtitle="Detalles del registro"
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
            <Link to={editPath}>
              <Button variant="ghost" className="flex items-center gap-2">
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                console.log('Iniciando proceso de eliminación', { id });
                setDeleteDialogOpen(true);
              }}
              className="flex items-center gap-2 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-4">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fieldValues.map((field, index) => (
            <div 
              key={index} 
              className={cn(
                React.isValidElement(field.value) ? "col-span-full" : "",
                field.colSpan ? `md:col-span-${field.colSpan}` : ""
              )}
            >
              {React.isValidElement(field.value) ? (
                <div className="space-y-2">
                  <div className="text-base font-bold text-muted-foreground">
                    {field.label}
                  </div>
                  {field.value}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">
                    {field.label}:
                  </dt>
                  <dd>
                    <span className="text-base">
                      {(!field.value || (typeof field.value === 'string' && field.value.trim() === '')) ? (
                        <span className="text-muted-foreground italic">No disponible</span>
                      ) : (
                        field.value
                      )}
                    </span>
                  </dd>
                </div>
              )}
            </div>
          ))}
        </dl>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirmar eliminación"
        description="¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        confirmText="Eliminar"
        variant="destructive"
      />
    </div>
  );
} 