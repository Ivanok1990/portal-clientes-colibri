// Pruebas del adaptador de Odoo.
//
// Verifican que la traducción entre el vocabulario de Odoo (stage_id, payment_state,
// priority '0'-'2', many2one como [id, nombre]) y los modelos del portal es correcta.
// Usan el cliente RPC simulado, así que corren sin instancia de Odoo.
import { describe, expect, it } from 'vitest';
import { createOdooDataSource } from '../datasource/odoo/odoo.datasource';
import { OdooRpcClient } from '../datasource/odoo/rpc';

const rpc = new OdooRpcClient({
  url: 'https://odoo.example.com',
  db: 'agencia',
  username: 'portal@agencia.com',
  apiKey: 'clave-de-prueba',
});

const odoo = createOdooDataSource(rpc);
const CLIENT_ID = 1; // partner_id de Ana García en los datos simulados

describe('OdooDataSource — clientes (res.partner)', () => {
  it('encuentra al cliente por su correo y trae su empresa del many2one', async () => {
    const client = await odoo.findClientByEmail('ana@empresa.com');
    expect(client).not.toBeNull();
    expect(client!.name).toBe('Ana García');
    expect(client!.company).toBe('Empresa Demo S.A.'); // parent_id → [10, 'Empresa Demo S.A.']
  });

  it('devuelve null si el correo no existe en Odoo', async () => {
    const client = await odoo.findClientByEmail('nadie@empresa.com');
    expect(client).toBeNull();
  });
});

describe('OdooDataSource — proyectos (project.project)', () => {
  it('traduce la etapa (stage_id) al estado del portal', async () => {
    const projects = await odoo.getProjects(CLIENT_ID);
    expect(projects).toHaveLength(4);

    const byName = Object.fromEntries(projects.map((p) => [p.name, p]));
    expect(byName['Rediseño Portal Web'].status).toBe('En progreso');
    expect(byName['App Móvil v2'].status).toBe('Planificación');
    expect(byName['Automatización Email'].status).toBe('Completado');
  });

  it('extrae el responsable del many2one user_id', async () => {
    const projects = await odoo.getProjects(CLIENT_ID);
    const crm = projects.find((p) => p.name === 'Integración CRM')!;
    expect(crm.owner).toBe('Sara Méndez');
    expect(crm.progress).toBe(90);
  });
});

describe('OdooDataSource — facturas (account.move)', () => {
  it('convierte el número de Odoo (INV/2026/0041) al formato del portal (INV-0041)', async () => {
    const invoices = await odoo.getInvoices(CLIENT_ID);
    const codes = invoices.map((i) => i.code);
    expect(codes).toContain('INV-0041');
    expect(codes).toContain('INV-0038');
  });

  it('deriva el estado desde payment_state y la fecha de vencimiento', async () => {
    const invoices = await odoo.getInvoices(CLIENT_ID);
    const byCode = Object.fromEntries(invoices.map((i) => [i.code, i]));

    // paid → Pagada
    expect(byCode['INV-0035'].status).toBe('Pagada');
    // not_paid con vencimiento pasado → Vencida (las fechas simuladas ya vencieron)
    expect(byCode['INV-0038'].status).toBe('Vencida');
    expect(byCode['INV-0041'].status).toBe('Vencida');
  });
});

describe('OdooDataSource — tickets (helpdesk.ticket)', () => {
  it('traduce etapa y prioridad de Odoo al vocabulario del portal', async () => {
    const tickets = await odoo.getTickets(CLIENT_ID);
    const byCode = Object.fromEntries(tickets.map((t) => [t.code, t]));

    // stage 'Nuevo' → Abierto; priority '2' → Alta
    expect(byCode['TK-104'].status).toBe('Abierto');
    expect(byCode['TK-104'].priority).toBe('Alta');
    // stage 'Resuelto' → Resuelto; priority '0' → Baja
    expect(byCode['TK-099'].status).toBe('Resuelto');
    expect(byCode['TK-099'].priority).toBe('Baja');
  });

  it('crea el ticket vía create y devuelve el modelo del portal', async () => {
    const ticket = await odoo.createTicket({
      title: 'Prueba de integración',
      description: 'Creado desde las pruebas del adaptador',
      priority: 'Alta',
      projectName: 'Integración CRM',
      clientId: CLIENT_ID,
    });

    expect(ticket.id).toBeGreaterThan(104); // continúa la secuencia de Odoo
    expect(ticket.code).toBe(`TK-${ticket.id}`);
    expect(ticket.status).toBe('Abierto');

    // El ticket recién creado aparece al volver a listar.
    const tickets = await odoo.getTickets(CLIENT_ID);
    expect(tickets.some((t) => t.id === ticket.id)).toBe(true);
  });
});

describe('OdooDataSource — notificaciones (mail.message)', () => {
  it('clasifica cada aviso según el modelo de Odoo que lo originó', async () => {
    const notifications = await odoo.getNotifications(CLIENT_ID);
    expect(notifications.length).toBeGreaterThanOrEqual(3);

    const types = notifications.map((n) => n.type);
    expect(types).toContain('proyecto'); // project.project
    expect(types).toContain('factura'); // account.move
    expect(types).toContain('ticket'); // helpdesk.ticket
  });
});
