import { Unit } from '../models/unit.model';
import { IUnitService } from './interfaces/unit.service.interface';
import { IUnitRepository } from '../repositories/interfaces/unit.repository.interface';
import { UnitRepositoryImpl } from '../repositories/unit.repository.impl';
import { BaseServiceImpl } from './base.service.impl';

export class UnitServiceImpl extends BaseServiceImpl<Unit, IUnitRepository> implements IUnitService {
  constructor() {
    super(UnitRepositoryImpl);
  }

  async findByName(name: string): Promise<Unit[]> {
    return this.repository.findByName(name);
  }

  async findBySymbol(symbol: string): Promise<Unit[]> {
    return this.repository.findBySymbol(symbol);
  }

  async create(data: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Unit> {
    const unit = await super.create(data);
    
    // Add self-conversion with factor 1
    const selfConversion = {
      toUnitId: unit.id,
      factor: 1,
      operation: 'multiply' as const,
      isDefault: true
    };

    // Preserve existing conversions and add the default one
    const existingConversions = data.conversions || [];
    const updatedConversions = [selfConversion, ...existingConversions];

    await this.update(unit.id, {
      ...unit,
      conversions: updatedConversions
    });

    return this.findById(unit.id) as Promise<Unit>;
  }
} 