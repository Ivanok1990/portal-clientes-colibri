// Construcción de la aplicación Express.
// Se separa del arranque del servidor (index.ts) para poder montarla en las
// pruebas sin abrir un puerto.
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

import { getDataSource } from './datasource';
import { openapiSpec } from './docs/openapi';
import authRoutes from './routes/auth';
import invoiceRoutes from './routes/invoices';
import notificationRoutes from './routes/notifications';
import projectRoutes from './routes/projects';
import ticketRoutes from './routes/tickets';

export function createApp() {
  const app = express();

  // Middlewares base.
  app.use(express.json());
  app.use(cookieParser());

  // CORS: permite el frontend de Vite y envía cookies (credentials).
  app.use(
    cors({
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    })
  );

  // Healthcheck: incluye el origen de datos activo (postgresql u odoo).
  app.get('/api/health', (_req, res) =>
    res.json({ status: 'ok', dataSource: getDataSource().name })
  );

  // Documentación interactiva de la API (Swagger UI) en /api/docs.
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

  // Rutas de la API.
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Ruta no encontrada: respuesta JSON coherente con el resto de la API.
  app.use('/api', (_req, res) => {
    res.status(404).json({ message: 'Recurso no encontrado' });
  });

  // Manejador de errores centralizado: evita que un fallo inesperado
  // devuelva HTML o tumbe el proceso.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error no controlado:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  });

  return app;
}
