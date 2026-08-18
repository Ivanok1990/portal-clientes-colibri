// Tipos auxiliares del backend.
// Los modelos de datos (Client, Project, Invoice, Ticket, Notification) son
// generados por Prisma a partir de prisma/schema.prisma, con nombres alineados
// a Odoo (res.partner, project.project, account.move, helpdesk.ticket).

export type TicketPriority = 'Alta' | 'Media' | 'Baja';

// Payload que guardamos dentro del JWT de sesión.
export interface SessionUser {
  id: number;
  name: string;
  email: string;
  company: string;
}
