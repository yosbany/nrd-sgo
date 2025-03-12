import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { ProductionOrder } from '@/domain/models/production-order.model';
import { ProductionOrderServiceImpl } from '@/domain/services/production-order.service.impl';
import { toast } from 'sonner';

export const MobileProductionDelete: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = React.useState<ProductionOrder | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const orderService = new ProductionOrderServiceImpl();

  React.useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;

      try {
        const data = await orderService.findById(id);
        setOrder(data);
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error('Error al cargar la orden');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await orderService.delete(id);
      toast.success('Orden eliminada correctamente');
      navigate('/mobile/production');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error al eliminar la orden');
    } finally {
      setIsDeleting(false);
    }
  };

  const getShortId = (id: string) => {
    if (!id) return '';
    // Tomar los primeros 3 y últimos 2 caracteres
    const start = id.slice(0, 3);
    const end = id.slice(-2);
    return `${start}${end}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Orden no encontrada</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-red-500">
            ¿Estás seguro de eliminar esta orden?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Esta acción no se puede deshacer. Se eliminará la Orden #{order.consecutive || getShortId(order.id)} y todos sus datos asociados.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="danger"
            className="w-full"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate(-1)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}; 