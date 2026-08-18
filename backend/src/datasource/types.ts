// Contrato de acceso a datos del portal.
//
// Las rutas de la API dependen SOLO de esta interfaz, nunca de una base de datos
// concreta. Hoy existe una implementación sobre PostgreSQL (Prisma) y otra que
// habla el protocolo de Odoo; cambiar de una a otra es cambiar una variable de
// entorno, sin tocar rutas ni frontend.

export type ProjectStatus = 'En progreso' | 'En revisión' | 'Planificación' | 'Completado';
export type InvoiceStatus = 'Pendiente' | 'Vencida' | 'Pagada';
export type TicketStatus = 'Abierto' | 'En proceso' | 'Resuelto';
export type TicketPriority = 'Alta' | 'Media' | 'Baja';

/** Cliente del portal — equivale a `res.partner` en Odoo. */
export interface Client {
  id: number;
  name: string;
  email: string;
  /** Hash bcrypt. Nunca se expone en las respuestas de la API. */
  password: string;
  company: string;
}

/** Proyecto — equivale a `project.project` en Odoo. */
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

/** Factura — equivale a `account.move` (tipo factura) en Odoo. */
export interface Invoice {
  id: number;
  code: string;
  concept: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  clientId: number;
}

/** Ticket de soporte — equivale a `helpdesk.ticket` en Odoo. */
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

/** Notificación al cliente — se apoya en `mail.message` / automatizaciones de Odoo. */
export interface Notification {
  id: number;
  message: string;
  type: 'proyecto' | 'factura' | 'ticket';
  createdAt: string;
  read: boolean;
  clientId: number;
}

/** Datos que el portal envía al crear un ticket. */
export interface NewTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  projectName: string;
  clientId: number;
}

/**
 * Operaciones que el portal necesita, independientemente de dónde vivan los datos.
 * Añadir un origen nuevo (por ejemplo, un módulo REST propio de Odoo) es implementar
 * esta interfaz.
 */
export interface DataSource {
  /** Nombre del origen activo; se registra al arrancar y se expone en /api/health. */
  readonly name: string;

  findClientByEmail(email: string): Promise<Client | null>;
  getProjects(clientId: number): Promise<Project[]>;
  getInvoices(clientId: number): Promise<Invoice[]>;
  getTickets(clientId: number): Promise<Ticket[]>;
  createTicket(input: NewTicketInput): Promise<Ticket>;
  getNotifications(clientId: number): Promise<Notification[]>;
}
