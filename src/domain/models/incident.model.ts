export interface Incident {
  id: string;
  type: string;
  description: string;
  classification: number;
  status: 'pending' | 'in_progress' | 'resolved';
  reportDate: string;
  reporterId: string;
  reporterName: string;
  location: string;
  affectedArea: string;
  immediateActions?: string;
  resolutionDate?: string;
  resolutionNotes?: string;
  assignedTo?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
} 