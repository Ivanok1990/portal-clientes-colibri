// Especificación OpenAPI 3.0 de la API del Portal de Clientes.
// Se sirve con Swagger UI en /api/docs para explorar y probar los endpoints.

export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Portal de Clientes — API',
    version: '1.0.0',
    description:
      'API REST del Portal de Clientes. La autenticación usa un JWT guardado en una cookie httpOnly ("token"): primero llama a POST /auth/login y luego podrás probar el resto de endpoints protegidos.',
  },
  servers: [{ url: '/api', description: 'Servidor de la API' }],
  tags: [
    { name: 'Auth', description: 'Autenticación y sesión' },
    { name: 'Proyectos' },
    { name: 'Facturas' },
    { name: 'Tickets' },
    { name: 'Notificaciones' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Ana García' },
          email: { type: 'string', example: 'ana@empresa.com' },
          company: { type: 'string', example: 'Empresa Demo S.A.' },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          code: { type: 'string', example: 'PRJ-001' },
          name: { type: 'string', example: 'Rediseño Portal Web' },
          status: {
            type: 'string',
            enum: ['En progreso', 'En revisión', 'Planificación', 'Completado'],
          },
          owner: { type: 'string', example: 'Carlos López' },
          dueDate: { type: 'string', example: '2026-07-15' },
          progress: { type: 'integer', example: 68 },
          clientId: { type: 'integer', example: 1 },
        },
      },
      Invoice: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          code: { type: 'string', example: 'INV-0041' },
          concept: { type: 'string', example: 'Desarrollo Frontend Q2' },
          amount: { type: 'number', example: 3200 },
          status: { type: 'string', enum: ['Pendiente', 'Vencida', 'Pagada'] },
          issueDate: { type: 'string', example: '2026-06-10' },
          clientId: { type: 'integer', example: 1 },
        },
      },
      Ticket: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 104 },
          code: { type: 'string', example: 'TK-104' },
          title: { type: 'string', example: 'Error al cargar reportes' },
          description: { type: 'string' },
          projectName: { type: 'string', example: 'Integración CRM' },
          status: { type: 'string', enum: ['Abierto', 'En proceso', 'Resuelto'] },
          priority: { type: 'string', enum: ['Alta', 'Media', 'Baja'] },
          createdAt: { type: 'string', example: '2026-06-08' },
          clientId: { type: 'integer', example: 1 },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          message: { type: 'string' },
          type: { type: 'string', enum: ['proyecto', 'factura', 'ticket'] },
          createdAt: { type: 'string' },
          read: { type: 'boolean' },
          clientId: { type: 'integer' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'ana@empresa.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      NewTicketRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'No puedo acceder al panel' },
          description: { type: 'string', example: 'Al iniciar sesión me sale un error 500.' },
          priority: { type: 'string', enum: ['Alta', 'Media', 'Baja'], example: 'Alta' },
          projectName: { type: 'string', example: 'Integración CRM' },
        },
      },
      Error: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Credenciales incorrectas' } },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Auth'],
        summary: 'Estado del servicio',
        description:
          'Healthcheck. Informa además qué origen de datos está activo: "postgresql" (Prisma) u "odoo" (conector de la External API).',
        responses: {
          200: {
            description: 'Servicio operativo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    dataSource: { type: 'string', enum: ['postgresql', 'odoo'] },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        description: 'Valida las credenciales y devuelve al usuario, dejando el JWT en una cookie httpOnly.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: {
            description: 'Sesión iniciada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          400: { description: 'Faltan datos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Credenciales incorrectas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Cerrar sesión',
        responses: { 200: { description: 'Sesión cerrada' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Usuario de la sesión actual',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Usuario autenticado',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } },
              },
            },
          },
          401: { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/projects': {
      get: {
        tags: ['Proyectos'],
        summary: 'Listar proyectos del cliente',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Lista de proyectos',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Project' } } } },
          },
          401: { description: 'No autenticado' },
        },
      },
    },
    '/invoices': {
      get: {
        tags: ['Facturas'],
        summary: 'Listar facturas del cliente',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Lista de facturas',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Invoice' } } } },
          },
          401: { description: 'No autenticado' },
        },
      },
    },
    '/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'Listar tickets del cliente',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Lista de tickets',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Ticket' } } } },
          },
          401: { description: 'No autenticado' },
        },
      },
      post: {
        tags: ['Tickets'],
        summary: 'Crear un ticket',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/NewTicketRequest' } } },
        },
        responses: {
          201: {
            description: 'Ticket creado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Ticket' } } },
          },
          400: { description: 'El título es obligatorio', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'No autenticado' },
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notificaciones'],
        summary: 'Listar notificaciones del cliente',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Lista de notificaciones',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } },
          },
          401: { description: 'No autenticado' },
        },
      },
    },
  },
} as const;
