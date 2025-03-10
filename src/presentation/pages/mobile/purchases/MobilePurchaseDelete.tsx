import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { PurchaseOrderServiceImpl } from '@/domain/services/purchase-order.service.impl';

export const MobilePurchaseDelete: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!id) return;

    try {
      const orderService = new PurchaseOrderServiceImpl();
      await orderService.delete(id);
      navigate('/mobile/purchases');
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
              ¿Está seguro que desea eliminar esta orden de compra?
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