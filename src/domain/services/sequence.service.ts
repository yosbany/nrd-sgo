export interface SequenceService {
  getNextNumber(modelName: string): Promise<string>;
} 