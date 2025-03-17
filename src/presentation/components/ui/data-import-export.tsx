import { FC, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Card } from './card';
import { Button } from './button';
import { Upload, Download, FileSpreadsheet, AlertCircle, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { ScrollArea } from './scroll-area';
import { Alert, AlertDescription } from './alert';
import * as XLSX from 'xlsx';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { EntityStatus } from '@/domain/enums/entity-status.enum';
import { Sector } from '@/domain/enums/sector.enum';
import { RecipeType } from '@/domain/enums/recipe-type.enum';
import { Product } from '@/domain/models/product.model';
import { Recipe } from '@/domain/models/recipe.model';
import { Customer } from '@/domain/models/customer.model';
import { Supplier } from '@/domain/models/supplier.model';
import { Worker } from '@/domain/models/worker.model';

interface DataImportExportProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportOption {
  title: string;
  description: string;
  type: string;
  icon: typeof FileSpreadsheet;
  specifications: string[];
}

interface ContactData {
  'Contacto': string;
  'Nombre/Razón Social': string;
  'Apellido/Nombre Fantasía': string;
  'Categoría': string;
  'Dirección': string;
  'Identificador': string;
  'Teléfono 1': string;
  'Teléfono 2': string;
  'Teléfono 3': string;
  'Email 1': string;
  'Email 2': string;
  'Email 3': string;
}

interface SalePriceData {
  'Contado': string;
  'Código': string;
  'Artículo': string;
  'Tipo': string;
}

type ImportData = ContactData | SalePriceData;

interface ImportPreview {
  code: string;
  name: string;
  type: 'PRODUCTO' | 'RECETA' | 'CLIENTE' | 'PROVEEDOR' | 'COLABORADOR' | 'DESCONOCIDO';
  isNew: boolean;
  originalItem?: Product | Recipe | Customer | Supplier | Worker;
  originalData?: ContactData | SalePriceData;
}

interface ValidationError {
  row: number;
  message: string;
}

const importOptions: ImportOption[] = [
  {
    title: 'Importar Inventario',
    description: 'Importa productos y recetas desde un archivo Excel',
    type: 'inventory',
    icon: FileSpreadsheet,
    specifications: [
      'Código',
      'Nombre',
      'Tipo Padre'
    ]
  },
  {
    title: 'Importar Precios de Venta',
    description: 'Actualiza los precios de venta de productos y recetas',
    type: 'sale-prices',
    icon: FileSpreadsheet,
    specifications: [
      'Código',
      'Artículo',
      'Tipo',
      'Contado'
    ]
  },
  {
    title: 'Importar Precios de Compra',
    description: 'Actualiza los precios de compra de productos',
    type: 'purchase-prices',
    icon: FileSpreadsheet,
    specifications: [
      'Código del producto',
      'Nuevo precio de compra',
      'Proveedor (opcional)',
      'Fecha de vigencia',
    ]
  },
  {
    title: 'Importar Contactos',
    description: 'Importa clientes, proveedores y colaboradores desde un archivo Excel',
    type: 'contacts',
    icon: FileSpreadsheet,
    specifications: [
      'Contacto',
      'Nombre/Razón Social',
      'Apellido/Nombre Fantasía',
      'Categoría',
      'Dirección',
      'Identificador',
      'Teléfono 1',
      'Teléfono 2',
      'Teléfono 3',
      'Email 1',
      'Email 2',
      'Email 3'
    ]
  },
];

const exportOptions = [
  {
    title: 'Exportar Inventario Completo',
    description: 'Exporta todos los productos y recetas con sus detalles',
    type: 'full-inventory',
    icon: FileSpreadsheet,
  },
];

type Step = 'select-operation' | 'select-file' | 'preview' | 'results';

interface StepConfig {
  title: string;
  description: string;
}

const steps: Record<Step, StepConfig> = {
  'select-operation': {
    title: 'Seleccionar Operación',
    description: 'Elige si deseas importar o exportar datos'
  },
  'select-file': {
    title: 'Seleccionar Archivo',
    description: 'Selecciona el archivo Excel con los datos a importar'
  },
  'preview': {
    title: 'Vista Previa',
    description: 'Revisa los datos antes de proceder'
  },
  'results': {
    title: 'Resultados',
    description: 'Resultado de la operación'
  }
};

export const DataImportExport: FC<DataImportExportProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<Step>('select-operation');
  const [selectedOperation, setSelectedOperation] = useState<'import' | 'export' | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportPreview[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'PRODUCTO' | 'RECETA'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: number }>({ success: 0, errors: 0 });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productService = new ProductServiceImpl();
  const recipeService = new RecipeServiceImpl();
  const customerService = new CustomerServiceImpl();
  const supplierService = new SupplierServiceImpl();
  const workerService = new WorkerServiceImpl();
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);

  const handleOperationSelect = (operation: 'import' | 'export', type: string) => {
    setSelectedOperation(operation);
    setSelectedType(type);
    setCurrentStep('select-file');
  };

  const handleFileSelect = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processInventoryFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setValidationErrors([]);
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<{ Código: string; Nombre: string; 'Tipo Padre': string }>(firstSheet);

        const errors: ValidationError[] = [];
        
        // Validar columnas requeridas
        const requiredColumns = ['Código', 'Nombre', 'Tipo Padre'];
        const sheetColumns = Object.keys(jsonData[0] || {});
        const missingColumns = requiredColumns.filter(col => !sheetColumns.includes(col));
        
        if (missingColumns.length > 0) {
          errors.push({
            row: 0,
            message: `Columnas faltantes: ${missingColumns.join(', ')}`
          });
          setValidationErrors(errors);
          return;
        }

        const [existingProducts, existingRecipes] = await Promise.all([
          productService.findAll(),
          recipeService.findAll()
        ]);
        
        // Validar y filtrar datos
        const validData = jsonData.filter((row, index) => {
          const code = row['Código']?.toString();
          const name = row['Nombre'];
          const parentType = row['Tipo Padre']?.toString().trim();

          if (!code || !name || !parentType) {
            errors.push({
              row: index + 2, // +2 porque Excel empieza en 1 y tiene encabezados
              message: `Fila ${index + 2}: Datos incompletos - Código, Nombre y Tipo Padre son obligatorios`
            });
            return false;
          }

          // Normalizar y validar el tipo padre
          const normalizedParentType = parentType.toUpperCase().split('\\')[0].trim();
          if (!normalizedParentType.startsWith('PRODUCCIÓN') && !normalizedParentType.startsWith('MERCADERÍA')) {
            errors.push({
              row: index + 2,
              message: `Fila ${index + 2}: Tipo Padre inválido "${parentType}" - Debe comenzar con "PRODUCCIÓN" o "MERCADERÍA"`
            });
            return false;
          }

          return true;
        });

        setValidationErrors(errors);

        if (validData.length === 0) {
          return;
        }
        
        const preview: ImportPreview[] = await Promise.all(
          validData.map(async (row) => {
            const code = row['Código'].toString();
            const name = row['Nombre'];
            const parentType = row['Tipo Padre'].toString().trim().toUpperCase().split('\\')[0];
            
            const type = parentType.startsWith('PRODUCCIÓN') ? 'RECETA' : 'PRODUCTO';
            const existingItem = type === 'PRODUCTO' 
              ? existingProducts.find(p => p.sku === code)
              : existingRecipes.find(r => r.sku === code);

            return {
              code,
              name,
              type,
              isNew: !existingItem,
              originalItem: existingItem
            };
          })
        );

        setPreviewData(preview);
        if (errors.length === 0) {
        setCurrentStep('preview');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setValidationErrors([{
          row: 0,
          message: 'Error al procesar el archivo. Verifique que sea un archivo Excel válido.'
        }]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processContactsFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setValidationErrors([]);
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { 
          type: 'array',
          codepage: 65001,
          raw: true
        });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<ContactData>(firstSheet, {
          raw: false,
          defval: ''
        });

        const errors: ValidationError[] = [];
        
        // Obtener todos los contactos existentes
        const [existingCustomers, existingSuppliers, existingWorkers] = await Promise.all([
          customerService.findAll(),
          supplierService.findAll(),
          workerService.findAll()
        ]);
        
        // Validar y filtrar datos
        const validData = jsonData.filter((row, index) => {
          const contact = row['Contacto']?.toString().trim();

          if (!contact) {
            errors.push({
              row: index + 2,
              message: `Fila ${index + 2}: El campo Contacto es obligatorio`
            });
            return false;
          }

          return true;
        });

        setValidationErrors(errors);

        if (validData.length === 0) {
          return;
        }

        const preview: ImportPreview[] = validData.map(row => {
          const contactName = row['Contacto'].toString().trim();
          const type = row['Categoría'] === 'Cliente' ? 'CLIENTE' : 
                    row['Categoría'] === 'Proveedor' ? 'PROVEEDOR' : 'COLABORADOR';
          
          // Normalizar el nombre eliminando espacios extra
          const normalizedContactName = contactName.toLowerCase().replace(/\s+/g, ' ').trim();
          
          // Agregar logs para debug
          console.log('Buscando contacto:', {
            contactName: normalizedContactName,
            type,
            existingCustomers: existingCustomers.map(c => ({ id: c.id, name: c.name.toLowerCase().replace(/\s+/g, ' ').trim() })),
            existingSuppliers: existingSuppliers.map(s => ({ id: s.id, name: s.commercialName.toLowerCase().replace(/\s+/g, ' ').trim() })),
            existingWorkers: existingWorkers.map(w => ({ id: w.id, name: w.name.toLowerCase().replace(/\s+/g, ' ').trim() }))
          });
          
          // Buscar contacto existente según el tipo con nombres normalizados
          let existingContact = null;
          switch (type) {
            case 'CLIENTE':
              existingContact = existingCustomers.find(c => 
                c.name.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedContactName
              );
              break;
            case 'PROVEEDOR':
              existingContact = existingSuppliers.find(s => 
                s.commercialName.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedContactName
              );
              break;
            case 'COLABORADOR':
              existingContact = existingWorkers.find(w => 
                w.name.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedContactName
              );
              break;
          }

          console.log('Resultado de búsqueda:', {
            contactName: normalizedContactName,
            found: !!existingContact,
            existingContact
          });

          return {
            code: row['Identificador'] || row['Contacto'],
            name: contactName,
            type,
            isNew: !existingContact,
            originalItem: existingContact,
            originalData: row
          };
        });

        setPreviewData(preview);
        if (errors.length === 0) {
          setCurrentStep('preview');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setValidationErrors([{
          row: 0,
          message: 'Error al procesar el archivo. Verifique que sea un archivo Excel válido.'
        }]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processSalePricesFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setValidationErrors([]);
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { 
          type: 'array',
          codepage: 65001,
          raw: true
        });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<SalePriceData>(firstSheet, {
          raw: false,
          defval: ''
        });

        const errors: ValidationError[] = [];
        
        // Validar columnas requeridas
        const requiredColumns = ['Código', 'Artículo', 'Tipo', 'Contado'];
        const sheetColumns = Object.keys(jsonData[0] || {});
        const missingColumns = requiredColumns.filter(col => !sheetColumns.includes(col));
        
        if (missingColumns.length > 0) {
          errors.push({
            row: 0,
            message: `Columnas faltantes: ${missingColumns.join(', ')}`
          });
          setValidationErrors(errors);
          return;
        }

        // Obtener todos los productos y recetas existentes
        const [existingProducts, existingRecipes] = await Promise.all([
          productService.findAll(),
          recipeService.findAll()
        ]);
        
        // Validar y filtrar datos
        const validData = jsonData.filter((row, index) => {
          const code = row['Código']?.toString();
          const price = parseFloat(row['Contado']?.toString() || '0');
          const type = row['Tipo']?.toString().trim().toUpperCase();

          if (!code) {
            errors.push({
              row: index + 2,
              message: `Fila ${index + 2}: El código es obligatorio`
            });
            return false;
          }

          if (isNaN(price)) {
            errors.push({
              row: index + 2,
              message: `Fila ${index + 2}: El precio debe ser un número válido`
            });
            return false;
          }

          if (!type) {
            errors.push({
              row: index + 2,
              message: `Fila ${index + 2}: El tipo es obligatorio`
            });
            return false;
          }

          return true;
        });

        setValidationErrors(errors);

        if (validData.length === 0) {
          return;
        }

        const preview: ImportPreview[] = validData.map(row => {
          const code = row['Código'].toString();
          const name = row['Artículo'];
          const type = row['Tipo'].toString().trim().toUpperCase();
          const price = parseFloat(row['Contado'].toString());
          
          let existingItem;
          let itemType: ImportPreview['type'] = 'DESCONOCIDO';
          
          if (type.includes('MERCADERÍA')) {
            existingItem = existingProducts.find(p => p.sku === code);
            itemType = 'PRODUCTO';
          } else if (type.includes('PRODUCCIÓN')) {
            existingItem = existingRecipes.find(r => r.sku === code);
            itemType = 'RECETA';
          }

          return {
            code,
            name,
            type: itemType,
            isNew: false,
            originalItem: existingItem,
            originalData: row
          };
        }).filter(item => item.originalItem !== undefined);

        setPreviewData(preview);
        if (errors.length === 0) {
          setCurrentStep('preview');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setValidationErrors([{
          row: 0,
          message: 'Error al procesar el archivo. Verifique que sea un archivo Excel válido.'
        }]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedType) {
      setSelectedFile(file);
      if (selectedType === 'inventory') {
        processInventoryFile(file);
      } else if (selectedType === 'contacts') {
        processContactsFile(file);
      } else if (selectedType === 'sale-prices') {
        processSalePricesFile(file);
      } else {
        // TODO: Implementar procesamiento de otros tipos de archivos
        setCurrentStep('preview');
      }
    }
  };

  const handleImport = async () => {
    if (!selectedType || !previewData.length) return;

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      if (selectedType === 'sale-prices') {
        const total = previewData.length;
        setImportProgress({ current: 0, total });

        for (let i = 0; i < previewData.length; i++) {
          try {
            const item = previewData[i];
            if (!item.originalItem || !item.originalData || !isSalePriceData(item.originalData)) {
              errorCount++;
              continue;
            }

            const newPrice = parseFloat(item.originalData.Contado);
            
            if (item.type === 'PRODUCTO') {
              const product = item.originalItem as Product;
              // Solo actualizar si el precio es diferente
              if (product.salePrice !== newPrice) {
                await productService.update(item.originalItem.id, {
                  ...item.originalItem,
                  salePrice: newPrice
                });
                successCount++;
              }
            } else if (item.type === 'RECETA') {
              const recipe = item.originalItem as Recipe;
              // Solo actualizar si el precio es diferente
              if (recipe.salePrice !== newPrice) {
                await recipeService.update(item.originalItem.id, {
                  ...item.originalItem,
                  salePrice: newPrice
                });
                successCount++;
              }
            }
          } catch (error) {
            console.error('Error updating price:', error);
            errorCount++;
          }
          setImportProgress({ current: i + 1, total });
        }
      } else if (selectedType === 'inventory') {
        const total = previewData.length;
        setImportProgress({ current: 0, total });

        for (let i = 0; i < previewData.length; i++) {
          const item = previewData[i];
          try {
            if (item.type === 'PRODUCTO') {
              if (item.isNew) {
                await productService.create({
                  sku: item.code,
                  name: item.name,
                  nameSale: item.name,
                  isForSale: true,
                  status: EntityStatus.ACTIVO,
                  sector: Sector.GENERAL,
                  isMaterial: false,
                  desiredStock: 1,
                  salePrice: 0
                });
              } else if (item.originalItem?.id) {
                await productService.update(item.originalItem.id, {
                  ...item.originalItem,
                  nameSale: item.name
                });
              }
            } else {
              if (item.isNew) {
                await recipeService.create({
                  sku: item.code,
                  name: item.name,
                  nameSale: item.name,
                  recipeType: RecipeType.RECETA_VENTA,
                  yieldUnitId: '',
                  yield: 1,
                  unitCost: 0,
                  totalMaterial: 0,
                  totalItems: 0,
                  margin: 0,
                  materials: [],
                  primaryWorkerId: '',
                  state: EntityStatus.ACTIVO,
                  desiredProduction: 1,
                  salePrice: 0
                });
              } else if (item.originalItem?.id) {
                await recipeService.update(item.originalItem.id, {
                  ...item.originalItem,
                  nameSale: item.name
                });
              }
            }
            successCount++;
          } catch (error) {
            console.error('Error importing item:', error);
            errorCount++;
          }
          setImportProgress({ current: i + 1, total });
        }
      } else if (selectedType === 'contacts') {
        const total = previewData.length;
        setImportProgress({ current: 0, total });

        for (let i = 0; i < previewData.length; i++) {
          try {
            const item = previewData[i];
            if (!item.originalData || !isContactData(item.originalData)) {
              errorCount++;
              continue;
            }

            const contactData = {
              name: item.originalData['Nombre/Razón Social'],
              phone: item.originalData['Teléfono 1'],
              email: item.originalData['Email 1'],
              status: EntityStatus.ACTIVO
            };

            const workerData = {
              name: item.name,
              phone: item.originalData['Teléfono 1'] || '',
              status: EntityStatus.ACTIVO,
              hireDate: new Date(),
              monthlySalary: 0,
              primaryRoleId: '',
              leaveBalance: 0,
              leaveSalaryBalance: 0,
              vacationSalaryBalance: 0,
              bonusSalaryBalance: 0
            };

            switch (item.type) {
              case 'CLIENTE':
                if (item.isNew) {
                  await customerService.create(contactData);
                } else if (item.originalItem?.id) {
                  await customerService.update(item.originalItem.id, contactData);
                }
                break;

              case 'PROVEEDOR':
                if (item.isNew) {
                  await supplierService.create({
                    commercialName: contactData.name,
                    phone: contactData.phone,
                    email: contactData.email,
                    status: EntityStatus.ACTIVO,
                    rut: item.originalData['Identificador']
                  });
                } else if (item.originalItem?.id) {
                  await supplierService.update(item.originalItem.id, {
                    commercialName: contactData.name,
                    phone: contactData.phone,
                    email: contactData.email,
                    rut: item.originalData['Identificador']
                  });
                }
                break;

              case 'COLABORADOR':
                if (item.isNew) {
                  await workerService.create(workerData);
                } else if (item.originalItem?.id) {
                  await workerService.update(item.originalItem.id, workerData);
                }
                break;
            }
            successCount++;
          } catch (error) {
            console.error('Error importing contact:', error);
            errorCount++;
          }
          setImportProgress({ current: i + 1, total });
        }
      }
    } finally {
      setIsLoading(false);
      setImportProgress(null);
      setResults({ success: successCount, errors: errorCount });
      setCurrentStep('results');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement export logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResults({ success: 10, errors: 0 });
      setCurrentStep('results');
    } catch (error) {
      console.error('Error exporting:', error);
      setResults({ success: 0, errors: 1 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep('select-operation');
    setSelectedOperation(null);
    setSelectedType(null);
    setSelectedFile(null);
    setPreviewData([]);
    setResults({ success: 0, errors: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'preview':
        setCurrentStep('select-file');
        break;
      case 'select-file':
        setCurrentStep('select-operation');
        setSelectedOperation(null);
        setSelectedType(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        break;
      default:
        setCurrentStep('select-operation');
        setSelectedOperation(null);
        setSelectedType(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
    }
  };

  const renderStepContent = () => {
    const selectedOption = importOptions.find(opt => opt.type === selectedType);
    
    switch (currentStep) {
      case 'select-operation':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Importar Datos</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {importOptions.map((option) => (
                  <Card key={option.type} className="overflow-hidden border bg-card">
                    <div className="flex h-full">
                      <div className="flex items-center px-4 bg-muted/30">
                        <div className="p-2">
                          <option.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>

                      <div className="flex-1 p-4">
                        <div className="space-y-1.5">
                          <h3 className="font-semibold leading-none">{option.title}</h3>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>

                        <Button 
                          className="w-full mt-4"
                          variant="secondary"
                          onClick={() => handleOperationSelect('import', option.type)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Importar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Exportar Datos</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {exportOptions.map((option) => (
                  <Card key={option.type} className="overflow-hidden border bg-card">
                    <div className="flex h-full">
                      <div className="flex items-center px-4 bg-muted/30">
                        <div className="p-2">
                          <option.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>

                      <div className="flex-1 p-4">
                        <div className="space-y-1.5">
                          <h3 className="font-semibold leading-none">{option.title}</h3>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>

                        <Button 
                          className="w-full mt-4"
                          variant="secondary"
                          onClick={() => handleOperationSelect('export', option.type)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'select-file':
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {selectedOperation === 'import' 
                  ? 'Selecciona el archivo Excel (.xlsx) que contiene los datos a importar.'
                  : 'Confirma la exportación de datos.'}
              </AlertDescription>
            </Alert>

            {selectedOperation === 'import' && selectedOption && (
              <div className="rounded-lg border bg-card p-4 mb-6">
                <h3 className="font-semibold mb-2">Columnas Requeridas:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedOption.specifications.map((spec, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="mr-2">•</span>
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col items-center justify-center h-[300px] space-y-4">
              {selectedOperation === 'import' ? (
                <>
                  <Button
                    size="lg"
                    onClick={handleFileSelect}
                    className="w-64"
                    variant={selectedFile ? "ghost" : "secondary"}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedFile ? 'Cambiar Archivo' : 'Seleccionar Archivo'}
                  </Button>
                  
                  {selectedFile && (
                    <div className="text-center space-y-4">
                      <div>
                        <p className="font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  )}

                  {validationErrors.length > 0 && (
                    <div className="w-full max-w-md mt-4">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Se encontraron errores en el archivo:
                        </AlertDescription>
                      </Alert>
                      <ScrollArea className="h-[200px] w-full mt-2 rounded-md border p-4">
                        <div className="space-y-2">
                          {validationErrors.map((error, index) => (
                            <div key={index} className="text-sm text-destructive">
                              {error.message}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={handleExport}
                  className="w-64"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Comenzar Exportación
                </Button>
              )}
            </div>
          </div>
        );

      case 'preview':
        if (selectedType === 'inventory') {
          const filteredData = previewData.filter(item => 
            filterType === 'ALL' ? true : item.type === filterType
          );

          const totalNew = previewData.filter(p => p.isNew).length;
          const totalUpdate = previewData.filter(p => !p.isNew).length;
          const filteredNew = filteredData.filter(p => p.isNew).length;
          const filteredUpdate = filteredData.filter(p => !p.isNew).length;

          return (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Se encontraron {previewData.length} elementos en total. 
                  {totalNew} serán creados y {totalUpdate} serán actualizados.
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-2">
                <Button
                  variant={filterType === 'ALL' ? "primary" : "ghost"}
                  onClick={() => setFilterType('ALL')}
                  size="sm"
                >
                  Todos ({previewData.length})
                </Button>
                <Button
                  variant={filterType === 'PRODUCTO' ? "primary" : "ghost"}
                  onClick={() => setFilterType('PRODUCTO')}
                  size="sm"
                >
                  Productos ({previewData.filter(i => i.type === 'PRODUCTO').length})
                </Button>
                <Button
                  variant={filterType === 'RECETA' ? "primary" : "ghost"}
                  onClick={() => setFilterType('RECETA')}
                  size="sm"
                >
                  Recetas ({previewData.filter(i => i.type === 'RECETA').length})
                </Button>
              </div>

              {filterType !== 'ALL' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Mostrando {filteredData.length} elementos filtrados.
                    {filteredNew} serán creados y {filteredUpdate} serán actualizados.
                  </AlertDescription>
                </Alert>
              )}
              
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  {filteredData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-2 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.code} | Tipo: {item.type}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        item.isNew ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.isNew ? 'Nuevo' : 'Actualizar'}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        } else if (selectedType === 'contacts') {
          return (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Se encontraron {previewData.length} contactos para importar.
                </AlertDescription>
              </Alert>
              
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  {previewData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-2 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.originalData?.['Teléfono 1'] && `Tel: ${item.originalData['Teléfono 1']} | `}
                          {item.originalData?.['Email 1'] && `Email: ${item.originalData['Email 1']} | `}
                          Tipo: {item.type === 'CLIENTE' ? 'Cliente' : item.type === 'PROVEEDOR' ? 'Proveedor' : 'Colaborador'}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                        Nuevo
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        } else if (selectedType === 'sale-prices') {
          return (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Se encontraron {previewData.length} elementos para actualizar precios.
                </AlertDescription>
              </Alert>
              
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  {previewData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-2 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.code} | Tipo: {item.type} | 
                          Precio: ${item.originalData && 'Contado' in item.originalData ? 
                            parseFloat(item.originalData['Contado']).toLocaleString('es-CL') : '0'}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">
                        Actualizar Precio
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        }
        
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vista previa no disponible para este tipo de importación.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'results':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {selectedOperation === 'import' ? 'Importación Completada' : 'Exportación Completada'}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Se procesaron exitosamente {results.success} elementos.
                {results.errors > 0 && ` Hubo ${results.errors} errores durante el proceso.`}
              </p>
            </div>
          </div>
        );
    }
  };

  const canGoBack = currentStep !== 'select-operation';
  const canGoForward = currentStep === 'preview';
  const showActions = currentStep !== 'select-operation' && currentStep !== 'results';

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
      />
      
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[1100px] h-[90vh] p-0">
          <DialogHeader className="px-6 py-2 border-b">
            <DialogTitle className="text-lg flex items-center space-x-2">
              <span>{steps[currentStep].title}</span>
              {currentStep !== 'select-operation' && (
                <span className="text-sm font-normal text-muted-foreground">
                  — {steps[currentStep].description}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 h-full max-h-[calc(90vh-8rem)]">
            <div className="px-6 py-4">
              {renderStepContent()}
            </div>
          </ScrollArea>

          {showActions && (
            <div className="px-6 py-4 border-t flex justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={!canGoBack || isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>

              {canGoForward && (
                <div className="flex items-center gap-4">
                  {importProgress && (
                    <div className="text-sm text-muted-foreground">
                      Procesando {importProgress.current} de {importProgress.total} elementos...
                    </div>
                  )}
                  <Button
                    onClick={handleImport}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Procesando...' : 'Confirmar Importación'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'results' && (
            <div className="px-6 py-4 border-t flex justify-end">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep('select-operation')}
              >
                Realizar Otra Operación
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}; 

function isContactData(data: ImportData): data is ContactData {
  return (
    'Teléfono 1' in data &&
    'Email 1' in data &&
    'Nombre/Razón Social' in data &&
    'Categoría' in data
  );
}

function isSalePriceData(data: ImportData): data is SalePriceData {
  return (
    'Contado' in data &&
    'Código' in data &&
    'Artículo' in data &&
    'Tipo' in data
  );
} 