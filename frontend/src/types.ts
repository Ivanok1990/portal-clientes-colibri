// Tipos compartidos en el frontend (espejo de los del backend).

export type ProjectStatus = 'En progreso' | 'En revisión' | 'Planificación' | 'Completado';
export type InvoiceStatus = 'Pendiente' | 'Vencida' | 'Pagada';
export type TicketStatus = 'Abierto' | 'En proceso' | 'Resuelto';
export type TicketPriority = 'Alta' | 'Media' | 'Baja';

export interface User {
  id: number;
  name: string;
  email: string;
  company: string;
}

export interface Project {
  id: number;
  code: string;
  name: string;
  status: ProjectStatus;
  owner: string;
  dueDate: string;
  progress: number;
  clientId: number;
}

export interface Invoice {
  id: number;
  code: string;
  concept: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  clientId: number;
}

export interface Ticket {
  id: number;
  code: string;
  title: string;
  description: string;
  projectName: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  clientId: number;
}

export interface Notification {
  id: number;
  message: string;
  type: 'proyecto' | 'factura' | 'ticket';
  createdAt: string;
  read: boolean;
  clientId: number;
}

export interface NewTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  projectName: string;
}
