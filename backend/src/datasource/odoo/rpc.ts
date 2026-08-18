// Cliente RPC de Odoo — versión SIMULADA.
//
// Reproduce la forma real de la External API de Odoo (XML-RPC / JSON-RPC):
//   1. `common.authenticate(db, usuario, apiKey, {})` devuelve un `uid`.
//   2. `object.execute_kw(db, uid, apiKey, modelo, método, args, kwargs)` ejecuta
//      `search_read`, `create`, `write`… sobre cualquier modelo.
//
// La prueba indica que no es necesario conectarse a una instancia real, así que
// aquí las respuestas están simuladas. Lo que NO está simulado es el contrato:
// los modelos, los dominios de búsqueda, los nombres de campo y el formato de las
// respuestas son los de Odoo. Para apuntar a una instancia real solo hay que
// sustituir el cuerpo de estos dos métodos por las llamadas comentadas más abajo,
// sin tocar el resto de la aplicación.

/** Un many2one de Odoo llega siempre como [id, "nombre visible"]. */
export type OdooMany2one = [number, string];

export interface OdooConfig {
  url: string;
  db: string;
  username: string;
  apiKey: string;
}

/** Registros simulados, con los nombres de campo reales de cada modelo de Odoo. */
const FIXTURES: Record<string, Record<string, unknown>[]> = {
  'res.partner': [
    {
      id: 1,
      name: 'Ana García',
      email: 'ana@empresa.com',
      parent_id: [10, 'Empresa Demo S.A.'] as OdooMany2one,
      is_company: false,
    },
  ],

  'project.project': [
    {
      id: 1,
      name: 'Rediseño Portal Web',
      partner_id: [1, 'Ana García'] as OdooMany2one,
      stage_id: [2, 'En progreso'] as OdooMany2one,
      user_id: [7, 'Carlos López'] as OdooMany2one,
      date: '2026-07-15',
      // En Odoo el avance se calcula desde las tareas; aquí llega ya resuelto.
      x_progress: 68,
    },
    {
      id: 2,
      name: 'Integración CRM',
      partner_id: [1, 'Ana García'] as OdooMany2one,
      stage_id: [3, 'En revisión'] as OdooMany2one,
      user_id: [8, 'Sara Méndez'] as OdooMany2one,
      date: '2026-06-30',
      x_progress: 90,
    },
    {
      id: 3,
      name: 'App Móvil v2',
      partner_id: [1, 'Ana García'] as OdooMany2one,
      stage_id: [1, 'Planificación'] as OdooMany2one,
      user_id: [9, 'Luis Torres'] as OdooMany2one,
      date: '2026-09-01',
      x_progress: 20,
    },
    {
      id: 4,
      name: 'Automatización Email',
      partner_id: [1, 'Ana García'] as OdooMany2one,
      stage_id: [4, 'Completado'] as OdooMany2one,
      user_id: [6, 'Ana García'] as OdooMany2one,
      date: '2026-06-01',
      x_progress: 100,
    },
  ],

  'account.move': [
    {
      id: 41,
      name: 'INV/2026/0041',
      partner_id: [1, 'Ana García'] as OdooMany2one,
      invoice_date: '2026-06-10',
      invoice_date_due: '2026-07-10',
      amount_total: 3200.0,
      payment_state: 'not_paid',
      move_type: 'out_invoice',
      state: 'posted',
      invoice_origin: 'Desarrollo Frontend Q2',
    },
    {
      id: 38,
      name: 'INV/2026/0038',
      partner_id: [1, 'Ana García'] as OdooMany2one,
      invoice_date: '2026-05-20',
      invoice_date_due: '2026-06-19',
      amount_total: 1850.0,
      payment_state: 'not_paid',
      move_type: 'out_invoice',
      state: 'posted',
      invoice_origin: 'Consultoría UX',
    },
    {
      id: 35,
      name: 'INV/2026/0035',
      partner_id: [1, 'Ana García'] as OdooMany2one,
      invoice_date: '2026-05-01',
      invoice_date_due: '2026-05-31',
      amount_total: 900.0,
      payment_state: 'paid',
      move_type: 'out_invoice',
      state: 'posted',
      invoice_origin: 'Soporte mensual Mayo',
    },
  ],

  'helpdesk.ticket': [
    {
      id: 104,
      name: 'Error al cargar reportes',
      description: 'Los reportes no cargan en el módulo de analítica.',
      partner_id: [1, 'Ana García'] as OdooMany2one,
      project_id: [2, 'Integración CRM'] as OdooMany2one,
      stage_id: [1, 'Nuevo'] as OdooMany2one,
      priority: '2',
      create_date: '2026-06-08 09:14:22',
    },
    {
      id: 101,
      name: 'Actualizar logo en portal',
      description: 'Reemplazar el logo antiguo por la nueva marca.',
      partner_id: [1, 'Ana García'] as OdooMany2one,
      project_id: [1, 'Rediseño Portal Web'] as OdooMany2one,
      stage_id: [2, 'En progreso'] as OdooMany2one,
      priority: '1',
      create_date: '2026-06-03 16:40:05',
    },
    {
      id: 99,
      name: 'Solicitud acceso nuevo usuario',
      description: 'Alta de un nuevo usuario del equipo.',
      partner_id: [1, 'Ana García'] as OdooMany2one,
      project_id: [3, 'App Móvil v2'] as OdooMany2one,
      stage_id: [3, 'Resuelto'] as OdooMany2one,
      priority: '0',
      create_date: '2026-05-28 11:02:47',
    },
  ],

  'mail.message': [
    {
      id: 501,
      body: 'El proyecto "Integración CRM" pasó a estado En revisión.',
      model: 'project.project',
      date: '2026-06-09 08:00:00',
      partner_ids: [1],
    },
    {
      id: 498,
      body: 'La factura INV/2026/0038 está vencida.',
      model: 'account.move',
      date: '2026-06-06 08:00:00',
      partner_ids: [1],
    },
    {
      id: 470,
      body: 'Tu ticket #99 fue marcado como Resuelto.',
      model: 'helpdesk.ticket',
      date: '2026-05-28 17:30:00',
      partner_ids: [1],
    },
  ],
};

/** Ids ya usados por los tickets simulados, para que `create` siga la secuencia. */
let nextTicketId = 105;

export class OdooRpcClient {
  constructor(private readonly config: OdooConfig) {}

  /**
   * Autenticación contra Odoo. En una instancia real:
   *
   *   const common = xmlrpc.createClient({ url: `${url}/xmlrpc/2/common` });
   *   const uid = await common.methodCall('authenticate', [db, username, apiKey, {}]);
   *
   * Devuelve el `uid` del usuario de integración (permisos mínimos, solo los
   * modelos que el portal necesita).
   */
  async authenticate(): Promise<number> {
    this.log('common.authenticate', [this.config.db, this.config.username, '***']);
    return 2; // uid simulado del usuario de integración
  }

  /**
   * Ejecuta un método sobre un modelo. En una instancia real:
   *
   *   const models = xmlrpc.createClient({ url: `${url}/xmlrpc/2/object` });
   *   return models.methodCall('execute_kw', [db, uid, apiKey, model, method, args, kwargs]);
   */
  async executeKw<T = unknown>(
    model: string,
    method: string,
    args: unknown[],
    kwargs: Record<string, unknown> = {}
  ): Promise<T> {
    this.log(`object.execute_kw → ${model}.${method}`, args, kwargs);

    const records = FIXTURES[model] ?? [];

    if (method === 'search_read') {
      const domain = (args[0] ?? []) as unknown[];
      const fields = (kwargs.fields ?? []) as string[];
      const filtered = records.filter((r) => matchesDomain(r, domain));
      const projected = fields.length
        ? filtered.map((r) => pick(r, ['id', ...fields]))
        : filtered;
      return projected as T;
    }

    if (method === 'create') {
      // Odoo devuelve el id del registro creado.
      const values = (args[0] ?? {}) as Record<string, unknown>;
      const id = nextTicketId++;
      records.push({ id, ...values });
      return id as T;
    }

    if (method === 'write') {
      return true as T;
    }

    throw new Error(`Método no soportado por el cliente simulado: ${method}`);
  }

  /** Deja traza de la llamada que se haría contra Odoo (útil para depurar la integración). */
  private log(call: string, ...payload: unknown[]) {
    if (process.env.ODOO_DEBUG === 'true') {
      console.log(`[odoo] ${call}`, JSON.stringify(payload));
    }
  }
}

/**
 * Evalúa un dominio de Odoo del tipo [['partner_id', '=', 1]].
 * Soporta los operadores que usa el portal; suficiente para la simulación.
 */
function matchesDomain(record: Record<string, unknown>, domain: unknown[]): boolean {
  return domain.every((condition) => {
    if (!Array.isArray(condition)) return true; // operadores lógicos ('&', '|')
    const [field, operator, expected] = condition as [string, string, unknown];

    let actual = record[field];
    // Un many2one se compara contra su id.
    if (Array.isArray(actual)) actual = actual[0];

    switch (operator) {
      case '=':
        return actual === expected;
      case '!=':
        return actual !== expected;
      case 'in':
        return Array.isArray(expected) && expected.includes(actual as never);
      default:
        return true;
    }
  });
}

/** Devuelve solo los campos solicitados, como hace `search_read` con `fields`. */
function pick(record: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (f in record) out[f] = record[f];
  }
  return out;
}
