import { Unit } from '../interfaces/entities.interface';
import { BaseEntity } from '../interfaces/base.interface';
import { UnitRepository } from '../repositories/unit.repository';

export class UnitService {
  private repository: UnitRepository;

  constructor() {
    this.repository = new UnitRepository();
  }

  async createUnit(unitData: Omit<Unit, keyof BaseEntity>): Promise<Unit> {
    // Validate symbol uniqueness
    const existingUnit = await this.repository.getBySymbol(unitData.symbol);
    if (existingUnit) {
      throw new Error(`Unit with symbol "${unitData.symbol}" already exists`);
    }

    // Initialize empty conversions if not provided
    const unit = {
      ...unitData,
      conversions: unitData.conversions || {}
    };

    return await this.repository.create(unit);
  }

  async updateUnit(
    unitId: string,
    updates: Partial<Omit<Unit, keyof BaseEntity>>
  ): Promise<void> {
    const unit = await this.repository.getById(unitId);
    if (!unit) throw new Error('Unit not found');

    // If updating symbol, validate uniqueness
    if (updates.symbol && updates.symbol !== unit.symbol) {
      const existingUnit = await this.repository.getBySymbol(updates.symbol);
      if (existingUnit) {
        throw new Error(`Unit with symbol "${updates.symbol}" already exists`);
      }
    }

    await this.repository.update(unitId, updates);
  }

  async addConversion(
    unitId: string,
    targetUnitId: string,
    conversionFactor: number
  ): Promise<void> {
    // Validate both units exist
    const [sourceUnit, targetUnit] = await Promise.all([
      this.repository.getById(unitId),
      this.repository.getById(targetUnitId)
    ]);

    if (!sourceUnit) throw new Error('Source unit not found');
    if (!targetUnit) throw new Error('Target unit not found');

    // Validate conversion factor
    if (conversionFactor <= 0) {
      throw new Error('Conversion factor must be positive');
    }

    // Add bidirectional conversions
    await Promise.all([
      this.repository.addConversion(unitId, targetUnitId, conversionFactor),
      this.repository.addConversion(targetUnitId, unitId, 1 / conversionFactor)
    ]);
  }

  async removeConversion(
    unitId: string,
    targetUnitId: string
  ): Promise<void> {
    // Validate both units exist
    const [sourceUnit, targetUnit] = await Promise.all([
      this.repository.getById(unitId),
      this.repository.getById(targetUnitId)
    ]);

    if (!sourceUnit) throw new Error('Source unit not found');
    if (!targetUnit) throw new Error('Target unit not found');

    // Remove bidirectional conversions
    await Promise.all([
      this.repository.removeConversion(unitId, targetUnitId),
      this.repository.removeConversion(targetUnitId, unitId)
    ]);
  }

  async searchUnits(searchTerm: string): Promise<Unit[]> {
    return await this.repository.searchByName(searchTerm);
  }

  async getBySymbol(symbol: string): Promise<Unit | null> {
    return await this.repository.getBySymbol(symbol);
  }

  async deleteUnit(unitId: string): Promise<void> {
    const unit = await this.repository.getById(unitId);
    if (!unit) throw new Error('Unit not found');

    // If the unit has conversions, we need to remove all bidirectional relationships
    const conversionPromises = Object.keys(unit.conversions).map(targetUnitId =>
      this.removeConversion(unitId, targetUnitId)
    );

    await Promise.all(conversionPromises);
    await this.repository.delete(unitId);
  }

  async convert(
    value: number,
    fromUnitId: string,
    toUnitId: string
  ): Promise<number> {
    const fromUnit = await this.repository.getById(fromUnitId);
    if (!fromUnit) throw new Error('Source unit not found');

    if (fromUnitId === toUnitId) return value;

    const conversionFactor = fromUnit.conversions[toUnitId];
    if (!conversionFactor) {
      throw new Error(`No conversion factor found from ${fromUnit.symbol} to target unit`);
    }

    return value * conversionFactor;
  }
} 