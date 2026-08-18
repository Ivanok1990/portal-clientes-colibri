// Carga los datos semilla en la base de datos (basados en el prototipo de Figma).
// La contraseña del cliente demo se guarda hasheada con bcrypt.
import 'dotenv/config'; // carga backend/.env (DATABASE_URL)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpiamos para poder re-ejecutar el seed sin duplicar.
  await prisma.notification.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const ana = await prisma.client.create({
    data: {
      name: 'Ana García',
      email: 'ana@empresa.com',
      password: passwordHash,
      company: 'Empresa Demo S.A.',
    },
  });

  await prisma.project.createMany({
    data: [
      { code: 'PRJ-001', name: 'Rediseño Portal Web', status: 'En progreso',   owner: 'Carlos López', dueDate: '2026-07-15', progress: 68,  clientId: ana.id },
      { code: 'PRJ-002', name: 'Integración CRM',      status: 'En revisión',   owner: 'Sara Méndez',  dueDate: '2026-06-30', progress: 90,  clientId: ana.id },
      { code: 'PRJ-003', name: 'App Móvil v2',         status: 'Planificación', owner: 'Luis Torres',  dueDate: '2026-09-01', progress: 20,  clientId: ana.id },
      { code: 'PRJ-004', name: 'Automatización Email', status: 'Completado',    owner: 'Ana García',   dueDate: '2026-06-01', progress: 100, clientId: ana.id },
    ],
  });

  await prisma.invoice.createMany({
    data: [
      { code: 'INV-0041', concept: 'Desarrollo Frontend Q2', amount: 3200, status: 'Pendiente', issueDate: '2026-06-10', clientId: ana.id },
      { code: 'INV-0038', concept: 'Consultoría UX',         amount: 1850, status: 'Vencida',   issueDate: '2026-05-20', clientId: ana.id },
      { code: 'INV-0035', concept: 'Soporte mensual Mayo',   amount: 900,  status: 'Pagada',    issueDate: '2026-05-01', clientId: ana.id },
    ],
  });

  // Ids explícitos para que los códigos TK-xxx coincidan; el autoincrement
  // continúa desde el máximo (105) para los tickets nuevos.
  await prisma.ticket.createMany({
    data: [
      { id: 94,  code: 'TK-094', title: 'Cambio de datos de facturación', description: 'Actualizar datos fiscales para próximas facturas.', projectName: 'Automatización Email', status: 'Resuelto',  priority: 'Media', createdAt: '2026-05-20', clientId: ana.id },
      { id: 97,  code: 'TK-097', title: 'Ajuste de permisos en módulo',   description: 'Revisar permisos de edición en el módulo CRM.',     projectName: 'Integración CRM',      status: 'Abierto',   priority: 'Alta',  createdAt: '2026-05-25', clientId: ana.id },
      { id: 99,  code: 'TK-099', title: 'Solicitud acceso nuevo usuario', description: 'Alta de un nuevo usuario del equipo.',              projectName: 'App Móvil v2',         status: 'Resuelto',  priority: 'Baja',  createdAt: '2026-05-28', clientId: ana.id },
      { id: 101, code: 'TK-101', title: 'Actualizar logo en portal',      description: 'Reemplazar el logo antiguo por la nueva marca.',    projectName: 'Rediseño Portal Web',  status: 'En proceso', priority: 'Media', createdAt: '2026-06-03', clientId: ana.id },
      { id: 104, code: 'TK-104', title: 'Error al cargar reportes',       description: 'Los reportes no cargan en el módulo de analítica.', projectName: 'Integración CRM',      status: 'Abierto',   priority: 'Alta',  createdAt: '2026-06-08', clientId: ana.id },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { message: 'El proyecto "Integración CRM" pasó a estado En revisión.', type: 'proyecto', createdAt: '2026-06-09', read: false, clientId: ana.id },
      { message: 'La factura INV-0038 está vencida.',                        type: 'factura',  createdAt: '2026-06-06', read: false, clientId: ana.id },
      { message: 'Tu ticket TK-099 fue marcado como Resuelto.',             type: 'ticket',   createdAt: '2026-05-28', read: true,  clientId: ana.id },
    ],
  });

  // Como insertamos tickets con ids explícitos (94..104), en PostgreSQL la
  // secuencia de autoincrement no se actualiza sola. La ajustamos al máximo id
  // para que el próximo ticket creado sea 105 (TK-105) y no colisione.
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Ticket"', 'id'), (SELECT MAX(id) FROM "Ticket"))`
  );

  console.log('✅ Seed completado. Cliente demo: ana@empresa.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
