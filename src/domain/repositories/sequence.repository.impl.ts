import { Database } from 'firebase/database';
import { Sequence } from '../models/sequence.model';
import { ISequenceRepository } from './interfaces/sequence.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';

export class SequenceRepositoryImpl extends BaseRepositoryImpl<Sequence> implements ISequenceRepository {
  protected modelProperties: (keyof Sequence)[] = [
    'modelName',
    'lastNumber',
    'nro',
    'createdAt',
    'updatedAt'
  ];

  constructor(db: Database) {
    super(db, 'sequences');
  }

  async findByModelName(modelName: string): Promise<Sequence | null> {
    const sequences = await this.findAll();
    return sequences.find(sequence => sequence.modelName === modelName) || null;
  }
} 