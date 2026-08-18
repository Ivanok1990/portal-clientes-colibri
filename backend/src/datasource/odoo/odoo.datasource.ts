// Implementación del DataSource contra Odoo.
//
// Traduce entre el vocabulario de Odoo y el del portal. Toda la dependencia del
// ERP queda encerrada aquí: si Odoo cambia de versión o de campos, este es el
// único archivo que se toca; las rutas, la API y el frontend siguen igual.
import bcrypt from 'bcryptjs';
import {
  Client,
  DataSource,
  Invoice,
  InvoiceStatus,
  NewTicketInput,
  Notification,
  Project,
  ProjectStatus,
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../types';
import { OdooMany2one, OdooRpcClient } from './rpc';

/* ------------------------------ Traducciones ------------------------------ */

/** Etapa de proyecto en Odoo (`stage_id`) → estado del portal. */
const PROJECT_STATUS: Record<string, ProjectStatus> = {
  'Planificación': 'Planificación',
  'En progreso': 'En progreso',
  'En revisión': 'En revisión',
  'Completado': 'Completado',
};

/** Etapa de ticket en Odoo → estado del portal. */
const TICKET_STATUS: Record<string, TicketStatus> = {
  Nuevo: 'Abierto',
  Asignado: 'Abierto',
  'En progreso': 'En proceso',
  Resuelto: 'Resuelto',
  Cerrado: 'Resuelto',
};

/** Prioridad de Odoo (cadena '0'–'3') → prioridad del portal, y a la inversa. */
const PRIORITY_FROM_ODOO: Record<string, TicketPriority> = {
  '0': 'Baja',
  '1': 'Media',
  '2': 'Alta',
  '3': 'Alta',
};
const PRIORITY_TO_ODOO: Record<TicketPriority, string> = {
  Baja: '0',
  Media: '1',
  Alta: '2',
};

/** Modelo de Odoo que originó el aviso → categoría de notificación del portal. */
const NOTIFICATION_TYPE: Record<string, Notification['type']> = {
  'project.project': 'proyecto',
  'account.move': 'factura',
  'helpdesk.ticket': 'ticket',
};

/** Devuelve el id de un many2one ([id, "nombre"]). */
function relId(value: unknown): number {
  return Array.isArray(value) ? (value as OdooMany2one)[0] : 0;
}

/** Devuelve el nombre visible de un many2one. */
function relName(value: unknown, fallback = ''): string {
  return Array.isArray(value) ? (value as OdooMany2one)[1] : fallback;
}

/** 'INV/2026/0041' → 'INV-0041' (formato que muestra el portal). */
function invoiceCode(name: string): string {
  const parts = String(name).split('/');
  return parts.length >= 3 ? `INV-${parts[parts.length - 1]}` : String(name);
}

/**
 * `payment_state` de Odoo → estado de la factura en el portal.
 * Odoo no marca "vencida": se deduce comparando la fecha de vencimiento con hoy.
 */
function invoiceStatus(paymentState: string, dueDate: string): InvoiceStatus {
  if (paymentState === 'paid' || paymentState === 'in_payment') return 'Pagada';
  if (dueDate && dueDate < new Date().toISOString().slice(0, 10)) return 'Vencida';
  return 'Pendiente';
}

/** '2026-06-08 09:14:22' → '2026-06-08'. */
function toDate(datetime: string): string {
  return String(datetime).slice(0, 10);
}

/** Quita el HTML que Odoo incluye en el cuerpo de `mail.message`. */
function stripHtml(body: string): string {
  return String(body).replace(/<[^>]*>/g, '').trim();
}

/* ------------------------------- DataSource ------------------------------- */

export function createOdooDataSource(rpc: OdooRpcClient): DataSource {
  // Se autentica una vez y se reutiliza el uid (igual que un cliente real).
  let uidPromise: Promise<number> | null = null;
  const uid = () => (uidPromise ??= rpc.authenticate());

  return {
    name: 'odoo',

    async findClientByEmail(email: string): Promise<Client | null> {
      await uid();
      const partners = await rpc.executeKw<Record<string, unknown>[]>(
        'res.partner',
        'search_read',
        [[['email', '=', email.toLowerCase()]]],
        { fields: ['name', 'email', 'parent_id'], limit: 1 }
      );

      const partner = partners[0];
      if (!partner) return null;

      return {
        id: partner.id as number,
        name: partner.name as string,
        email: partner.email as string,
        company: relName(partner.parent_id, 'Sin empresa'),
        // Odoo no expone contraseñas. En una integración real la autenticación se
        // delegaría al propio Odoo (`common.authenticate` con las credenciales del
        // cliente) o a un IdP federado, y el portal no guardaría contraseñas.
        // Para que la demo funcione sin instancia real se usa la de ejemplo.
        password: await bcrypt.hash('password123', 10),
      };
    },

    async getProjects(clientId: number): Promise<Project[]> {
      await uid();
      const rows = await rpc.executeKw<Record<string, unknown>[]>(
        'project.project',
        'search_read',
        [[['partner_id', '=', clientId]]],
        { fields: ['name', 'stage_id', 'user_id', 'date', 'x_progress', 'partner_id'] }
      );

      return rows.map((r) => ({
        id: r.id as number,
        code: `PRJ-${String(r.id).padStart(3, '0')}`,
        name: r.name as string,
        status: PROJECT_STATUS[relName(r.stage_id)] ?? 'En progreso',
        owner: relName(r.user_id, 'Sin asignar'),
        dueDate: (r.date as string) ?? '',
        progress: (r.x_progress as number) ?? 0,
        clientId: relId(r.partner_id),
      }));
    },

    async getInvoices(clientId: number): Promise<Invoice[]> {
      await uid();
      const rows = await rpc.executeKw<Record<string, unknown>[]>(
        'account.move',
        'search_read',
        // Solo facturas de venta ya validadas del cliente.
        [
          [
            ['partner_id', '=', clientId],
            ['move_type', '=', 'out_invoice'],
            ['state', '=', 'posted'],
          ],
        ],
        {
          fields: [
            'name',
            'invoice_origin',
            'amount_total',
            'payment_state',
            'invoice_date',
            'invoice_date_due',
            'partner_id',
          ],
          order: 'invoice_date desc',
        }
      );

      return rows.map((r) => ({
        id: r.id as number,
        code: invoiceCode(r.name as string),
        concept: (r.invoice_origin as string) ?? 'Sin concepto',
        amount: r.amount_total as number,
        status: invoiceStatus(r.payment_state as string, r.invoice_date_due as string),
        issueDate: (r.invoice_date as string) ?? '',
        clientId: relId(r.partner_id),
      }));
    },

    async getTickets(clientId: number): Promise<Ticket[]> {
      await uid();
      const rows = await rpc.executeKw<Record<string, unknown>[]>(
        'helpdesk.ticket',
        'search_read',
        [[['partner_id', '=', clientId]]],
        {
          fields: [
            'name',
            'description',
            'project_id',
            'stage_id',
            'priority',
            'create_date',
            'partner_id',
          ],
          order: 'create_date desc',
        }
      );

      return rows.map(mapTicket).sort((a, b) => b.id - a.id);
    },

    async createTicket(input: NewTicketInput): Promise<Ticket> {
      await uid();

      // Odoo devuelve el id del registro creado.
      const id = await rpc.executeKw<number>('helpdesk.ticket', 'create', [
        {
          name: input.title,
          description: input.description,
          partner_id: input.clientId,
          priority: PRIORITY_TO_ODOO[input.priority],
        },
      ]);

      return {
        id,
        code: `TK-${String(id).padStart(3, '0')}`,
        title: input.title,
        description: input.description,
        projectName: input.projectName,
        status: 'Abierto',
        priority: input.priority,
        createdAt: new Date().toISOString().slice(0, 10),
        clientId: input.clientId,
      };
    },

    async getNotifications(clientId: number): Promise<Notification[]> {
      await uid();
      const rows = await rpc.executeKw<Record<string, unknown>[]>(
        'mail.message',
        'search_read',
        [[['partner_ids', 'in', [clientId]]]],
        { fields: ['body', 'model', 'date'], order: 'date desc' }
      );

      return rows.map((r) => ({
        id: r.id as number,
        message: stripHtml(r.body as string),
        type: NOTIFICATION_TYPE[r.model as string] ?? 'proyecto',
        createdAt: toDate(r.date as string),
        read: false,
        clientId,
      }));
    },
  };
}

/** `helpdesk.ticket` de Odoo → ticket del portal. */
function mapTicket(r: Record<string, unknown>): Ticket {
  return {
    id: r.id as number,
    code: `TK-${String(r.id).padStart(3, '0')}`,
    title: r.name as string,
    description: (r.description as string) ?? '',
    projectName: relName(r.project_id, 'Sin proyecto'),
    status: TICKET_STATUS[relName(r.stage_id)] ?? 'Abierto',
    priority: PRIORITY_FROM_ODOO[String(r.priority)] ?? 'Media',
    createdAt: toDate(r.create_date as string),
    clientId: relId(r.partner_id),
  };
}
