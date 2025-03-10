import { IBaseRepository } from '../../repositories/interfaces/base.repository.interface';
import { BaseEntity } from '../../models/base.entity';

export function setupMockRepositoryForUpdate<T extends BaseEntity>(
  mockRepository: jest.Mocked<IBaseRepository<T>>,
  mockEntity: T
) {
  mockRepository.update.mockResolvedValue(undefined);
  mockRepository.findById.mockResolvedValue(mockEntity);
} 