// Instancia única del cliente Prisma, reutilizada en toda la app.
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
