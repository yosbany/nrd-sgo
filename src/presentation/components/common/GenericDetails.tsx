import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { BaseService } from '@/domain/interfaces/base-service.interface';
import { BaseEntity } from '@/domain/models/base.entity';
import { toast } from 'sonner';

interface Field {
  label: string;
  value: string | number | React.ReactNode;
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

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const result = await service.findById(id);
        if (result) {
          setData(result);
        } else {
          toast.error('Registro no encontrado');
          navigate(backPath);
        }
      } catch (error) {
        console.error('Error al cargar el registro:', error);
        toast.error('Error al cargar el registro');
        navigate(backPath);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, service, backPath, navigate]);

  const handleDelete = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      try {
        await service.delete(id);
        toast.success('Registro eliminado exitosamente');
        navigate(backPath);
      } catch (error) {
        console.error('Error al eliminar el registro:', error);
        toast.error('Error al eliminar el registro');
      }
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const fieldValues = fields(data);

  return (
    <div className="min-h-[80vh] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Detalles del registro
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(backPath)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Link to={editPath}>
            <Button variant="outline" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <dl className="grid gap-6 md:grid-cols-2">
          {fieldValues.map((field, index) => (
            <div key={index} className={`space-y-2 ${React.isValidElement(field.value) ? 'col-span-2' : ''}`}>
              <dt className="text-sm font-semibold tracking-tight text-foreground/90">
                {field.label}
              </dt>
              <dd className="text-sm">
                {React.isValidElement(field.value) ? (
                  <div className="rounded-md border">
                    <div className="relative w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <tbody>
                          {field.value}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  field.value || <span className="text-muted-foreground">-</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
} 