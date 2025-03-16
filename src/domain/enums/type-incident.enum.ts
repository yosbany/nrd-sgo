export enum IncidentType {
    PRODUCCIONES = 'PRODUCCIONES',
    TAREAS = 'TAREAS',
    INVENTARIOS = 'INVENTARIOS' 
}

export const getOptions = () => [
    { value: IncidentType.PRODUCCIONES, label: 'PRODUCCIONES' },
    { value: IncidentType.TAREAS, label: 'TAREAS' },
    { value: IncidentType.INVENTARIOS, label: 'INVENTARIOS' }
];

export const getLabel = (type: IncidentType) => {
    switch (type) {
      case IncidentType.PRODUCCIONES:
        return 'PRODUCCIONES';
      case IncidentType.TAREAS:
        return 'TAREAS';
      case IncidentType.INVENTARIOS:
        return 'INVENTARIOS';
      default:
        return type;
    }
};

export const getStatusOptions = () => [
    { 
      value: IncidentType.PRODUCCIONES, 
      label: 'PRODUCCIONES', 
      color: 'info' as const 
    },
    { 
      value: IncidentType.TAREAS, 
      label: 'TAREAS', 
      color: 'warning' as const 
    },
    { 
      value: IncidentType.INVENTARIOS, 
      label: 'INVENTARIOS', 
      color: 'success' as const 
    }
];
