export enum TaskFrequency {
  DIARIO = 'DIARIO',
  SEMANAL = 'SEMANAL',
  QUINCENAL = 'QUINCENAL',
  MENSUAL = 'MENSUAL',
  TRIMESTRAL = 'TRIMESTRAL',
  SEMESTRAL = 'SEMESTRAL',
  ANUAL = 'ANUAL'
}

export const getTaskFrequencyOptions = () => [
  { value: TaskFrequency.DIARIO, label: 'DIARIO' },
  { value: TaskFrequency.SEMANAL, label: 'SEMANAL' },
  { value: TaskFrequency.QUINCENAL, label: 'QUINCENAL' },
  { value: TaskFrequency.MENSUAL, label: 'MENSUAL' },
  { value: TaskFrequency.TRIMESTRAL, label: 'TRIMESTRAL' },
  { value: TaskFrequency.SEMESTRAL, label: 'SEMESTRAL' },
  { value: TaskFrequency.ANUAL, label: 'ANUAL' }
]; 