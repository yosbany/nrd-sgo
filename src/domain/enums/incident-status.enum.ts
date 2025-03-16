export enum IncidentStatus {
  PENDIENTE = 'PENDIENTE',
  RESUELTA = 'RESUELTA'
}

export const getOptions = () => [
  { value: IncidentStatus.PENDIENTE, label: 'PENDIENTE' },
  { value: IncidentStatus.RESUELTA, label: 'RESUELTA' },
];

export const getLabel = (type: IncidentStatus) => {
  switch (type) {
    case IncidentStatus.PENDIENTE:
      return 'PENDIENTE';
    case IncidentStatus.RESUELTA:
      return 'RESUELTA';
    default:
      return type;
  }
};

export const getStatusOptionsIncident = () => [
  { 
    value: IncidentStatus.PENDIENTE, 
    label: 'PENDIENTE', 
    color: 'warning' as const 
  },
  { 
    value: IncidentStatus.RESUELTA, 
    label: 'RESUELTA', 
    color: 'success' as const 
  }
];
