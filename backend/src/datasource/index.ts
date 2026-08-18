// Selección del origen de datos.
//
//   DATA_SOURCE=postgres  (por defecto) → PostgreSQL vía Prisma
//   DATA_SOURCE=odoo                    → Odoo vía su External API
//
// Las rutas piden el origen con `getDataSource()` y no saben cuál está activo.
// Así la migración a Odoo es un cambio de configuración, no de código.
import { createOdooDataSource } from './odoo/odoo.datasource';
import { OdooRpcClient } from './odoo/rpc';
import { prismaDataSource } from './prisma.datasource';
import { DataSource } from './types';

let instance: DataSource | null = null;

export function getDataSource(): DataSource {
  if (instance) return instance;

  if (process.env.DATA_SOURCE === 'odoo') {
    const rpc = new OdooRpcClient({
      url: process.env.ODOO_URL ?? 'https://odoo.example.com',
      db: process.env.ODOO_DB ?? 'agencia',
      username: process.env.ODOO_USERNAME ?? 'portal@agencia.com',
      apiKey: process.env.ODOO_API_KEY ?? '',
    });
    instance = createOdooDataSource(rpc);
  } else {
    instance = prismaDataSource;
  }

  console.log(`Origen de datos activo: ${instance.name}`);
  return instance;
}

/** Solo para pruebas: descarta la instancia memorizada. */
export function resetDataSource(): void {
  instance = null;
}

export * from './types';
