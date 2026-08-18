// Implementación del DataSource sobre PostgreSQL con Prisma.
// Es la que usa el prototipo por defecto.
import { prisma } from '../lib/prisma';
import {
  Client,
  DataSource,
  Invoice,
  NewTicketInput,
  Notification,
  Project,
  Ticket,
} from './types';

export const prismaDataSource: DataSource = {
  name: 'postgresql',

  async findClientByEmail(email: string): Promise<Client | null> {
    return prisma.client.findUnique({ where: { email: email.toLowerCase() } });
  },

  async getProjects(clientId: number): Promise<Project[]> {
    return prisma.project.findMany({
      where: { clientId },
      orderBy: { id: 'asc' },
    }) as Promise<Project[]>;
  },

  async getInvoices(clientId: number): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      where: { clientId },
      orderBy: { issueDate: 'desc' },
    }) as Promise<Invoice[]>;
  },

  async getTickets(clientId: number): Promise<Ticket[]> {
    return prisma.ticket.findMany({
      where: { clientId },
      orderBy: { id: 'desc' },
    }) as Promise<Ticket[]>;
  },

  async createTicket(input: NewTicketInput): Promise<Ticket> {
    // El id lo asigna la base (autoincrement) y de él derivamos el código TK-xxx.
    const created = await prisma.ticket.create({
      data: {
        code: 'TK-TMP', // temporal; se reemplaza con el id real
        title: input.title,
        description: input.description,
        projectName: input.projectName,
        status: 'Abierto',
        priority: input.priority,
        createdAt: new Date().toISOString().slice(0, 10),
        clientId: input.clientId,
      },
    });

    return prisma.ticket.update({
      where: { id: created.id },
      data: { code: `TK-${String(created.id).padStart(3, '0')}` },
    }) as Promise<Ticket>;
  },

  async getNotifications(clientId: number): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    }) as Promise<Notification[]>;
  },
};
