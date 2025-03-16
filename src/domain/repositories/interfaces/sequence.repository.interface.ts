import { IBaseRepository } from './base.repository.interface';
import { Sequence } from '../../models/sequence.model';

export interface ISequenceRepository extends IBaseRepository<Sequence> {
  findByModelName(modelName: string): Promise<Sequence | null>;
} 