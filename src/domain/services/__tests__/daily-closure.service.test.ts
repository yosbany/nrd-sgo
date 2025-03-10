import { DailyClosure } from '../../models/daily-closure.model';
import { DailyClosureServiceImpl } from '../daily-closure.service.impl';
import { DailyClosureRepository } from '../../repositories/daily-closure.repository.impl';

jest.mock('../../repositories/daily-closure.repository.impl');

describe('DailyClosureService', () => {
  let service: DailyClosureServiceImpl;
  let mockRepository: jest.Mocked<DailyClosureRepository>;

  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Crear una instancia mock del repositorio
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByDate: jest.fn()
    } as any;

    // Asignar el mock al constructor del repositorio
    (DailyClosureRepository as jest.MockedClass<typeof DailyClosureRepository>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new DailyClosureServiceImpl();
  });

  describe('findByDate', () => {
    it('should return daily closures by date', async () => {
      const date = new Date();
      const mockClosures: DailyClosure[] = [
        {
          id: '1',
          date,
          totalExpenses: 1000,
          totalIncome: 2000,
          totalDifference: 1000,
          observations: 'Test closure',
          accounts: [
            {
              accountCode: 'ACC001',
              accountName: 'Cash',
              initialBalance: 5000,
              finalBalance: 6000,
              difference: 1000
            }
          ],
          transactions: [
            {
              transactionCode: 'TRX001',
              concept: 'Sale',
              accountCode: 'ACC001',
              amount: 2000,
              tagDescription: 'Daily sales',
              currentBalance: 6000
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByDate.mockResolvedValue(mockClosures);

      const result = await service.findByDate(date);

      expect(result).toEqual(mockClosures);
      expect(mockRepository.findByDate).toHaveBeenCalledWith(date);
    });
  });

  describe('inherited methods', () => {
    const mockClosure: DailyClosure = {
      id: '1',
      date: new Date(),
      totalExpenses: 1000,
      totalIncome: 2000,
      totalDifference: 1000,
      observations: 'Test closure',
      accounts: [
        {
          accountCode: 'ACC001',
          accountName: 'Cash',
          initialBalance: 5000,
          finalBalance: 6000,
          difference: 1000
        }
      ],
      transactions: [
        {
          transactionCode: 'TRX001',
          concept: 'Sale',
          accountCode: 'ACC001',
          amount: 2000,
          tagDescription: 'Daily sales',
          currentBalance: 6000
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should call findAll on repository', async () => {
      const mockClosures = [mockClosure];
      mockRepository.findAll.mockResolvedValue(mockClosures);

      const result = await service.findAll();

      expect(result).toEqual(mockClosures);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should call findById on repository', async () => {
      mockRepository.findById.mockResolvedValue(mockClosure);

      const result = await service.findById('1');

      expect(result).toEqual(mockClosure);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should call create on repository', async () => {
      mockRepository.create.mockResolvedValue(mockClosure);

      const result = await service.create(mockClosure);

      expect(result).toEqual(mockClosure);
      expect(mockRepository.create).toHaveBeenCalledWith(mockClosure);
    });

    it('should call update on repository', async () => {
      mockRepository.update.mockResolvedValue();
      mockRepository.findById.mockResolvedValue(mockClosure);

      const result = await service.update('1', mockClosure);

      expect(mockRepository.update).toHaveBeenCalledWith('1', mockClosure);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockClosure);
    });

    it('should call delete on repository', async () => {
      mockRepository.delete.mockResolvedValue();

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
}); 