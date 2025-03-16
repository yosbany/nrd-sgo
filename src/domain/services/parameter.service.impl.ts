import { Parameter } from '../models/parameter.model';
import { IParameterService } from './interfaces/parameter.service.interface';
import { IParameterRepository } from '../repositories/interfaces/parameter.repository.interface';
import { ParameterRepositoryImpl } from '../repositories/parameter.repository.impl';
import { BaseServiceImpl } from './base.service.impl';

export class ParameterServiceImpl extends BaseServiceImpl<Parameter, IParameterRepository> implements IParameterService {
  constructor() {
    super(ParameterRepositoryImpl, 'parameters');
  }

  async findByName(name: string): Promise<Parameter[]> {
    return this.repository.findByName(name);
  }

  async findByCode(code: string): Promise<Parameter[]> {
    return this.repository.findByCode(code);
  }

  async update(id: string, data: Partial<Parameter>): Promise<Parameter> {
    // Si se está actualizando el código
    if (data.code) {
      // Obtener el parámetro actual
      const currentParameter = await this.findById(id);
      if (!currentParameter) {
        throw new Error('Parámetro no encontrado');
      }

      // Si el código nuevo es diferente al actual
      if (currentParameter.code !== data.code) {
        // Verificar que no exista otro parámetro con el mismo código
        const existingParameters = await this.findByCode(data.code);
        if (existingParameters.length > 0) {
          throw new Error('Ya existe un parámetro con ese código');
        }
      }
    }

    return super.update(id, data) as Promise<Parameter>;
  }
} 