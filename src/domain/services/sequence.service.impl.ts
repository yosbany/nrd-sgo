import { SequenceService } from './sequence.service';
import { database } from '@/config/firebase';
import { ref, get, set } from 'firebase/database';

export class SequenceServiceImpl implements SequenceService {
  private readonly SEQUENCES_PATH = 'sequences';

  async getNextNumber(modelName: string): Promise<string> {
    if (!modelName) {
      throw new Error('El nombre del modelo es requerido para generar la secuencia');
    }

    try {
      // Usar directamente Firebase para las secuencias
      const sequenceRef = ref(database, `${this.SEQUENCES_PATH}/${modelName}`);
      const snapshot = await get(sequenceRef);

      if (!snapshot.exists()) {
        // Si no existe, crear una nueva secuencia
        await set(sequenceRef, {
          lastNumber: 1,
          updatedAt: new Date().toISOString()
        });
        return '00001';
      }

      // Si existe, incrementar el número
      const sequence = snapshot.val();
      const nextNumber = (sequence.lastNumber || 0) + 1;

      // Actualizar la secuencia
      await set(sequenceRef, {
        lastNumber: nextNumber,
        updatedAt: new Date().toISOString()
      });

      // Formatear el número con ceros a la izquierda
      return nextNumber.toString().padStart(5, '0');
    } catch (error) {
      console.error('Error getting next sequence number:', error);
      throw new Error(`Error al generar el siguiente número de secuencia para ${modelName}`);
    }
  }
} 