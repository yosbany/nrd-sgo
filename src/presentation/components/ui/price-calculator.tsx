import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './button';
import { Input } from './input';
import { Select } from './select';
import { toast } from 'sonner';

interface PriceCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

type IVAType = 'EXENTO' | 'MINIMO' | 'BASICO';

const IVA_RATES = {
  EXENTO: 0,
  MINIMO: 10,
  BASICO: 22
};

const IVA_OPTIONS = [
  { value: 'EXENTO', label: 'IVA Exento' },
  { value: 'MINIMO', label: 'IVA Mínimo (10%)' },
  { value: 'BASICO', label: 'IVA Básico (22%)' }
];

interface CalculatorData {
  totalAmount: string;
  units: string;
  profitPercentage: string;
  ivaType: IVAType;
  lastUsed?: string;
}

const STORAGE_KEY = 'price-calculator-data';

export function PriceCalculator({ isOpen, onClose }: PriceCalculatorProps) {
  const [data, setData] = useState<CalculatorData>({
    totalAmount: '',
    units: '1',
    profitPercentage: '25',
    ivaType: 'EXENTO',
  });

  // Cargar datos del localStorage al montar el componente
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  // Calcular resultados
  const results = calculateResults(data);

  // Manejar cambios en los inputs
  const handleChange = (field: keyof CalculatorData) => (
    value: string | React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = typeof value === 'string' ? value : value.target.value;

    // Validar que el porcentaje de ganancia no sea igual o mayor a 100
    if (field === 'profitPercentage') {
      const profitValue = parseFloat(newValue);
      if (profitValue >= 100) {
        toast.error('El porcentaje de ganancia debe ser menor a 100%');
        return;
      }
    }

    const newData = {
      ...data,
      [field]: field === 'ivaType' ? (value as IVAType) : newValue,
      lastUsed: new Date().toLocaleString(),
    };
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  // Limpiar datos
  const handleClear = () => {
    const clearedData: CalculatorData = {
      totalAmount: '',
      units: '1',
      profitPercentage: '25',
      ivaType: 'EXENTO',
      lastUsed: new Date().toLocaleString(),
    };
    setData(clearedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clearedData));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-3xl rounded-xl bg-white dark:bg-gray-800 shadow-2xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-xl">
              <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                Calculadora de Precios
              </Dialog.Title>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
              <div className="flex flex-col space-y-4 p-4">
                {/* Datos de Entrada */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg border border-primary-200 dark:border-gray-600 shadow-sm">
                  <h3 className="text-base font-semibold text-primary-900 dark:text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                    </svg>
                    Datos de Entrada
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <Input
                        label="$ Importe Total"
                        type="number"
                        value={data.totalAmount}
                        onChange={handleChange('totalAmount')}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="font-bold"
                      />

                      <Input
                        label="Cantidad"
                        type="number"
                        value={data.units}
                        onChange={handleChange('units')}
                        placeholder="1"
                        min="1"
                        className="font-bold"
                      />
                    </div>

                    <div className="space-y-4">
                      <Select
                        label="IVA"
                        value={data.ivaType}
                        onChange={handleChange('ivaType')}
                        options={IVA_OPTIONS}
                        className="font-bold"
                      />

                      <Input
                        label="% Ganancia"
                        type="number"
                        value={data.profitPercentage}
                        onChange={handleChange('profitPercentage')}
                        placeholder="25"
                        min="0"
                        max="100"
                        className="font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Resultados del Cálculo */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                    Resultados del Cálculo
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <ResultRow label="Costo Unitario" value={results.unitCost} />
                      <ResultRow label="Ganancia por Unidad" value={results.profitPerUnit} />
                      <ResultRow 
                        label="IVA" 
                        value={data.ivaType === 'EXENTO' ? '0.00' : results.ivaAmount} 
                      />
                    </div>
                    <div className="w-full">
                      {data.ivaType === 'EXENTO' ? (
                        <ResultRow 
                          label="Precio Final" 
                          value={results.priceWithoutIVA}
                          className="bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-200 dark:border-primary-700" 
                        />
                      ) : (
                        <PriceResultRow 
                          withoutIVA={results.priceWithoutIVA} 
                          withIVA={results.finalPrice} 
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
              <div className="flex items-center justify-between">
                {data.lastUsed && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Último uso: {data.lastUsed}
                  </p>
                )}
                <div className="flex space-x-2">
                  <Button variant="secondary" onClick={handleClear} size="sm">
                    Limpiar
                  </Button>
                  <Button onClick={onClose} size="sm">
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}

interface ResultRowProps {
  label: string;
  value: string;
  className?: string;
}

function ResultRow({ label, value, className = '' }: ResultRowProps) {
  return (
    <div className={`bg-white dark:bg-gray-700 rounded-lg p-2 shadow-sm ${className}`}>
      <div className="flex flex-col space-y-0.5">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
          ${value}
        </span>
      </div>
    </div>
  );
}

function PriceResultRow({ withoutIVA, withIVA }: { withoutIVA: string; withIVA: string }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-white dark:bg-gray-700 rounded-lg p-2 shadow-sm">
        <div className="flex flex-col space-y-0.5">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Precio sin IVA
          </span>
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
            ${withoutIVA}
          </span>
        </div>
      </div>
      <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-2 shadow-sm border-2 border-primary-200 dark:border-primary-700">
        <div className="flex flex-col space-y-0.5">
          <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
            Precio con IVA
          </span>
          <span className="text-xl font-bold text-primary-700 dark:text-primary-300">
            ${withIVA}
          </span>
        </div>
      </div>
    </div>
  );
}

function calculateResults(data: CalculatorData) {
  const totalAmount = parseFloat(data.totalAmount) || 0;
  const units = parseInt(data.units) || 1;
  const profitPercentage = parseFloat(data.profitPercentage) || 0;
  const ivaRate = IVA_RATES[data.ivaType] || 0;

  // Cálculo del costo unitario
  const unitCost = totalAmount / units;

  // Cálculo del precio sin IVA usando la fórmula: costo / (1 - %ganancia)
  const priceWithoutIVA = unitCost / (1 - (profitPercentage / 100));

  // Cálculo de la ganancia por unidad
  const profitPerUnit = priceWithoutIVA - unitCost;

  // Cálculo del IVA y precio final
  const ivaAmount = (priceWithoutIVA * ivaRate) / 100;
  const finalPrice = priceWithoutIVA + ivaAmount;

  return {
    unitCost: unitCost.toFixed(2),
    profitPerUnit: profitPerUnit.toFixed(2),
    priceWithoutIVA: priceWithoutIVA.toFixed(2),
    ivaAmount: ivaAmount.toFixed(2),
    finalPrice: finalPrice.toFixed(2),
  };
} 