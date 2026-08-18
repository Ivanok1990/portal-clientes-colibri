# Portal de Clientes — Prototipo

Prototipo funcional de un **Portal de Clientes** desarrollado como prueba técnica para el puesto de _Jr Full Stack Developer_. Permite a un cliente iniciar sesión, ver sus proyectos y facturas, crear tickets de soporte y recibir notificaciones.

> Los **datos son de ejemplo** (inventados: Ana García, proyectos ficticios) pero viven en una **base de datos real (PostgreSQL)** que persiste los cambios. La solución está pensada para integrarse con **Odoo** en el futuro; por eso se eligió PostgreSQL (el mismo motor que usa Odoo) y los modelos usan una nomenclatura alineada con Odoo (`res.partner`, `project.project`, `account.move`, `helpdesk.ticket`).

## 🧱 Stack

| Capa          | Tecnología                                            |
| ------------- | ----------------------------------------------------- |
| Frontend      | React 18 + Vite + TypeScript + Tailwind CSS           |
| Backend       | Node + Express + TypeScript (API REST)                |
| Base de datos | PostgreSQL (Supabase) vía Prisma ORM                  |
| Autenticación | JWT en cookie `httpOnly`; contraseñas con bcrypt      |

La arquitectura separa **frontend** y **backend** en carpetas independientes para reflejar el modelo cliente ↔ API REST ↔ servidor. La capa de acceso a datos usa **Prisma**, por lo que migrar de un proveedor de PostgreSQL a otro (o a la BD de Odoo) es solo cambiar la cadena de conexión.

## 📁 Estructura

```
portal-clientes-colibri/
├── backend/            # API REST (Express + TypeScript)
│   ├── prisma/         # schema.prisma, migraciones y seed
│   └── src/
│       ├── app.ts      # construcción de la app (separada del arranque)
│       ├── index.ts    # arranque del servidor
│       ├── routes/     # auth, projects, invoices, tickets, notifications
│       ├── middleware/ # requireAuth (verifica el JWT)
│       ├── docs/       # especificación OpenAPI
│       ├── lib/        # helpers de JWT y cliente Prisma
│       └── __tests__/  # pruebas de la API (Vitest + Supertest)
├── frontend/           # SPA (React + Vite)
│   └── src/
│       ├── pages/      # Login, Dashboard, Proyectos, Facturas, Tickets, Perfil
│       ├── components/ # Layout, BottomNav, PageHeader, Badge, iconos, estados
│       ├── context/    # AuthContext
│       ├── lib/        # utilidades de formato
│       └── api/        # cliente fetch centralizado
└── package.json        # scripts para levantar todo junto
```

## 🚀 Cómo ejecutarlo

Requisitos: **Node.js 18+** y una base de datos **PostgreSQL** (p. ej. un proyecto gratuito en [Supabase](https://supabase.com)).

1. Instalar dependencias (raíz + backend + frontend):

   ```bash
   npm run install:all
   ```

2. Configurar la base de datos. Copia el ejemplo de variables de entorno y coloca tu cadena de conexión:

   ```bash
   cp backend/.env.example backend/.env
   ```

   En `backend/.env` define:
   - `DATABASE_URL`: conexión a Postgres. En Supabase usa el **pooler de sesión** (puerto
     5432): para un servidor persistente como este da bastante menos latencia que el
     pooler de transacciones (6543), pensado para entornos serverless.
   - `DIRECT_URL`: conexión que Prisma usa para las migraciones (puede ser la misma).

3. Crear las tablas y cargar los datos de ejemplo:

   ```bash
   npm run db:migrate --prefix backend   # crea las tablas
   npm run db:seed --prefix backend      # carga los datos demo
   ```

4. Levantar backend y frontend a la vez:

   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend (API): http://localhost:4000

   > En desarrollo, Vite hace proxy de `/api` hacia el backend, así que ambos comparten origen y la cookie de sesión funciona sin configuración extra.

5. Abrir http://localhost:5173 e iniciar sesión con las credenciales demo:

   ```
   Correo:      ana@empresa.com
   Contraseña:  password123
   ```

## 🖥️ Pantallas

| Pantalla    | Ruta          | Contenido                                                          |
| ----------- | ------------- | ------------------------------------------------------------------ |
| Login       | `/login`      | Formulario de acceso                                                |
| Dashboard   | `/dashboard`  | Proyectos activos, facturas pendientes y tickets abiertos           |
| Proyectos   | `/proyectos`  | Listado con estado, responsable, fecha límite y avance              |
| Facturas    | `/facturas`   | Estado de cobro y total pendiente                                   |
| Tickets     | `/tickets`    | Listado + formulario para crear uno nuevo                           |
| Perfil      | `/perfil`     | Datos de la cuenta y cierre de sesión                               |

La interfaz es **responsive**: en escritorio usa barra lateral y tablas; en móvil, navegación
inferior y tarjetas. Las notificaciones se consultan desde la campana del encabezado.

## 🧪 Pruebas

```bash
npm test
```

19 pruebas de la API con **Vitest + Supertest** que cubren autenticación (credenciales
inválidas, cookie `httpOnly`, sesión activa), protección de rutas (401 sin sesión o con
token inválido), aislamiento de datos por cliente y validaciones al crear tickets.
Prisma está mockeado, así que **las pruebas corren sin base de datos ni conexión a
internet**: basta con clonar el repositorio e instalar dependencias.
28 pruebas automatizadas: 19 de la API y 9 del conector de Odoo.

## 📖 Documentación de la API (Swagger)

La API está documentada con **OpenAPI 3 / Swagger UI**. Con el backend corriendo, abre:

```
http://localhost:4000/api/docs
```

Desde ahí puedes explorar y **probar** cada endpoint. Para los protegidos, ejecuta primero `POST /auth/login` (con `ana@empresa.com` / `password123`); la cookie de sesión queda guardada y los demás endpoints funcionarán con "Try it out".

## 🔌 Endpoints de la API

| Método | Ruta                  | Descripción                          |
| ------ | --------------------- | ------------------------------------ |
| POST   | `/api/auth/login`     | Inicia sesión y setea la cookie JWT  |
| POST   | `/api/auth/logout`    | Cierra sesión                        |
| GET    | `/api/auth/me`        | Usuario de la sesión actual          |
| GET    | `/api/projects`       | Proyectos del cliente                |
| GET    | `/api/invoices`       | Facturas del cliente                 |
| GET    | `/api/tickets`        | Tickets del cliente                  |
| POST   | `/api/tickets`        | Crea un ticket nuevo                 |
| GET    | `/api/notifications`  | Notificaciones del cliente           |

## 🔮 Integración con Odoo

La integración no es solo un plan: **está contemplada en el código**. Las rutas de la API
no hablan con ninguna base de datos en concreto, sino con una interfaz `DataSource`
(`backend/src/datasource/types.ts`) que tiene dos implementaciones intercambiables:

| Origen | Implementación | Descripción |
| ------ | -------------- | ----------- |
| `postgres` (por defecto) | `prisma.datasource.ts` | PostgreSQL vía Prisma, la BD del prototipo |
| `odoo` | `odoo/odoo.datasource.ts` | Habla el protocolo de la **External API de Odoo** |

El conector de Odoo reproduce el contrato real del ERP: autenticación
(`common.authenticate`) y llamadas `object.execute_kw` con `search_read`/`create` sobre
los modelos reales (`res.partner`, `project.project`, `account.move`,
`helpdesk.ticket`, `mail.message`), y traduce su vocabulario al del portal
(etapas → estados, `payment_state` + vencimiento → estado de factura, prioridad
`'0'–'2'` → Baja/Media/Alta, many2one `[id, nombre]` → campos planos).

Como la prueba indica que no es necesario conectarse a una instancia real, el cliente
RPC (`odoo/rpc.ts`) responde con datos simulados, pero **el resto del flujo es el de
producción**. Para probarlo:

```bash
# en backend/.env
DATA_SOURCE=odoo
```

Al reiniciar el backend, `GET /api/health` responde `{"dataSource":"odoo"}` y todo el
portal (login, proyectos, facturas, tickets, notificaciones) se sirve desde el
conector de Odoo sin cambiar una línea de las rutas ni del frontend. Conectar la
instancia real consiste en sustituir el cuerpo simulado de `rpc.ts` por las llamadas
XML-RPC reales (están documentadas en el propio archivo).

## 📦 Subir a GitHub

```bash
git init
git add .
git commit -m "feat: prototipo Portal de Clientes"
git branch -M main
git remote add origin https://github.com/<usuario>/portal-clientes-colibri.git
git push -u origin main
```
