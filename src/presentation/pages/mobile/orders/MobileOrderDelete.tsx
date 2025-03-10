import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { CustomerOrderServiceImpl } from '@/domain/services/customer-order.service.impl';

export const MobileOrderDelete: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!id) return;

    try {
      const orderService = new CustomerOrderServiceImpl();
      await orderService.delete(id);
      navigate('/mobile/orders');
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="p-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-center">
              ¿Está seguro que desea eliminar este pedido?
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="w-full"
              >
                Eliminar
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 