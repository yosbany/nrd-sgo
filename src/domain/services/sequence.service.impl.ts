import { Sequence } from '../models/sequence.model';
import { SequenceService } from './sequence.service';
import { database } from '@/config/firebase';

export class SequenceServiceImpl implements SequenceService {
  private sequences: { [key: string]: Sequence } = {};

  async getNextNumber(modelName: string): Promise<string> {
    // Buscar la secuencia actual para el modelo
    let sequence = this.sequences[modelName];

    // Si no existe, crear una nueva secuencia
    if (!sequence) {
      sequence = {
        id: crypto.randomUUID(),
        nro: '00001',
        modelName,
        lastNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.sequences[modelName] = sequence;
    } else {
      // Incrementar el número
      sequence.lastNumber += 1;
      sequence.updatedAt = new Date();
    }

    // Formatear el número con ceros a la izquierda
    return sequence.lastNumber.toString().padStart(5, '0');
  }
} 