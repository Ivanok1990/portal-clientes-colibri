// Pruebas de la API. Prisma está mockeado, así que las pruebas corren sin
// base de datos ni red: basta con `npm test`.
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/prisma', () => ({
  prisma: {
    client: { findUnique: vi.fn() },
    project: { findMany: vi.fn() },
    invoice: { findMany: vi.fn() },
    ticket: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    notification: { findMany: vi.fn() },
  },
}));

import { createApp } from '../app';
import { prisma } from '../lib/prisma';

const app = createApp();

type Mock = ReturnType<typeof vi.fn>;
const db = prisma as unknown as {
  client: { findUnique: Mock };
  project: { findMany: Mock };
  invoice: { findMany: Mock };
  ticket: { findMany: Mock; create: Mock; update: Mock };
  notification: { findMany: Mock };
};

const CREDENTIALS = { email: 'ana@empresa.com', password: 'password123' };
let clientRecord: Record<string, unknown>;

beforeAll(async () => {
  clientRecord = {
    id: 1,
    name: 'Ana García',
    email: CREDENTIALS.email,
    password: await bcrypt.hash(CREDENTIALS.password, 10),
    company: 'Empresa Demo S.A.',
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  db.client.findUnique.mockResolvedValue(clientRecord);
});

/** Inicia sesión y devuelve la cookie para reutilizarla en rutas protegidas. */
async function login(): Promise<string[]> {
  const res = await request(app).post('/api/auth/login').send(CREDENTIALS);
  expect(res.status).toBe(200);
  return res.headers['set-cookie'] as unknown as string[];
}

describe('Healthcheck', () => {
  it('responde ok e informa el origen de datos activo', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.dataSource).toBe('postgresql');
  });

  it('devuelve 404 en JSON para rutas inexistentes', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });
});

describe('Autenticación', () => {
  it('rechaza la petición si faltan credenciales', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('rechaza una contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: CREDENTIALS.email, password: 'incorrecta' });
    expect(res.status).toBe(401);
  });

  it('rechaza un correo que no existe', async () => {
    db.client.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@empresa.com', password: 'x' });
    expect(res.status).toBe(401);
  });

  it('inicia sesión y entrega el token en una cookie httpOnly', async () => {
    const res = await request(app).post('/api/auth/login').send(CREDENTIALS);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(CREDENTIALS.email);
    // La contraseña nunca debe salir en la respuesta.
    expect(res.body.user.password).toBeUndefined();

    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toContain('token=');
    expect(cookie).toContain('HttpOnly');
  });

  it('devuelve el usuario de la sesión en /auth/me', async () => {
    const cookie = await login();
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Ana García');
  });

  it('cierra la sesión borrando la cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(String(res.headers['set-cookie'])).toContain('token=;');
  });
});

describe('Protección de rutas', () => {
  it.each(['/api/projects', '/api/invoices', '/api/tickets', '/api/notifications'])(
    'responde 401 en %s sin sesión',
    async (ruta) => {
      const res = await request(app).get(ruta);
      expect(res.status).toBe(401);
    }
  );

  it('rechaza un token inválido', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Cookie', ['token=token-falso']);
    expect(res.status).toBe(401);
  });
});

describe('Recursos del cliente', () => {
  it('devuelve solo los proyectos del cliente de la sesión', async () => {
    db.project.findMany.mockResolvedValue([
      { id: 1, code: 'PRJ-001', name: 'Rediseño Portal Web', clientId: 1 },
    ]);

    const cookie = await login();
    const res = await request(app).get('/api/projects').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    // Clave: la consulta se filtra por el cliente del token, no por un parámetro.
    expect(db.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clientId: 1 } })
    );
  });

  it('devuelve las facturas del cliente', async () => {
    db.invoice.findMany.mockResolvedValue([
      { id: 1, code: 'INV-0041', amount: 3200, status: 'Pendiente', clientId: 1 },
    ]);

    const cookie = await login();
    const res = await request(app).get('/api/invoices').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body[0].code).toBe('INV-0041');
    expect(db.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clientId: 1 } })
    );
  });
});

describe('Creación de tickets', () => {
  it('rechaza un ticket sin título', async () => {
    const cookie = await login();
    const res = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ description: 'sin título' });

    expect(res.status).toBe(400);
    expect(db.ticket.create).not.toHaveBeenCalled();
  });

  it('rechaza un título que solo tiene espacios', async () => {
    const cookie = await login();
    const res = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: '   ' });

    expect(res.status).toBe(400);
  });

  it('crea el ticket y le asigna código, estado y cliente', async () => {
    db.ticket.create.mockResolvedValue({ id: 105, code: 'TK-TMP' });
    db.ticket.update.mockResolvedValue({
      id: 105,
      code: 'TK-105',
      title: 'No puedo entrar al panel',
      status: 'Abierto',
      priority: 'Alta',
      clientId: 1,
    });

    const cookie = await login();
    const res = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'No puedo entrar al panel', priority: 'Alta' });

    expect(res.status).toBe(201);
    expect(res.body.code).toBe('TK-105');

    // El ticket nace Abierto y asociado al cliente de la sesión.
    expect(db.ticket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'Abierto', clientId: 1, priority: 'Alta' }),
      })
    );
  });

  it('usa prioridad Media cuando la recibida no es válida', async () => {
    db.ticket.create.mockResolvedValue({ id: 106, code: 'TK-TMP' });
    db.ticket.update.mockResolvedValue({ id: 106, code: 'TK-106' });

    const cookie = await login();
    await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title: 'Prioridad inventada', priority: 'Urgentísima' });

    expect(db.ticket.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ priority: 'Media' }) })
    );
  });
});
