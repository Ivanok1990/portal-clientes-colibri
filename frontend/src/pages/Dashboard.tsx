// Dashboard: KPIs + proyectos activos, facturas recientes y tickets recientes.
// Responsive: en móvil usa un header azul con saludo y tarjetas; en desktop,
// el layout con tarjetas KPI y paneles.
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Badge from '../components/Badge';
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  FileTextIcon,
  FolderIcon,
  TicketIcon,
} from '../components/icons';
import NotificationsBell from '../components/NotificationsBell';
import PageHeader from '../components/PageHeader';
import Skeleton from '../components/Skeleton';
import StateMessage from '../components/StateMessage';
import { useAuth } from '../context/AuthContext';
import { formatShortDate } from '../lib/format';
import { Invoice, Project, ProjectStatus, Ticket } from '../types';

const progressColor: Record<ProjectStatus, string> = {
  'En progreso': 'bg-blue-500',
  'En revisión': 'bg-amber-500',
  'Planificación': 'bg-purple-500',
  Completado: 'bg-green-500',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Cargamos las tres fuentes en paralelo para minimizar la espera.
    Promise.all([api.getProjects(), api.getInvoices(), api.getTickets()])
      .then(([p, i, t]) => {
        setProjects(p);
        setInvoices(i);
        setTickets(t);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const activeProjects = projects.filter((p) => p.status !== 'Completado');
  const completedProjects = projects.filter((p) => p.status === 'Completado');
  const pendingInvoices = invoices.filter((i) => i.status !== 'Pagada');
  const openTickets = tickets.filter((t) => t.status !== 'Resuelto');

  const stats = [
    { label: 'Proyectos activos', value: activeProjects.length, Icon: FolderIcon, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Facturas pendientes', value: pendingInvoices.length, Icon: FileTextIcon, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Tickets abiertos', value: openTickets.length, Icon: TicketIcon, tone: 'bg-red-50 text-red-600' },
    { label: 'Proyectos completados', value: completedProjects.length, Icon: CheckCircleIcon, tone: 'bg-green-50 text-green-600' },
  ];

  const mobileStats = [
    { label: 'Proyectos', value: activeProjects.length },
    { label: 'Facturas', value: pendingInvoices.length },
    { label: 'Tickets', value: openTickets.length },
  ];

  return (
    <div>
      {/* Header azul con saludo + KPIs — solo móvil */}
      <div className="-mx-4 -mt-5 mb-6 rounded-b-3xl bg-navy px-4 pb-6 pt-6 text-white md:hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-300">Bienvenido de nuevo</p>
            <h1 className="text-xl font-bold">{user?.name}</h1>
          </div>
          <NotificationsBell variant="dark" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {mobileStats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white/10 px-2 py-3 text-center">
              <p className="tabular text-2xl font-bold">{loading ? '—' : s.value}</p>
              <p className="text-xs text-slate-300">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cabecera desktop */}
      <div className="hidden md:block">
        <PageHeader title="Dashboard" subtitle="Resumen general de tu cuenta" />
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="rounded-xl bg-white shadow-card">
          <StateMessage
            icon={<AlertTriangleIcon size={22} />}
            title="No pudimos cargar tu información"
            detail="Revisa tu conexión e intenta de nuevo."
          />
        </div>
      ) : (
        <>
          {/* KPIs — solo desktop */}
          <section className="mb-6 hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-100 bg-white p-5 shadow-card transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm text-slate-500">{s.label}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}>
                    <s.Icon size={18} />
                  </span>
                </div>
                <p className="tabular mt-3 text-3xl font-bold text-slate-800">{s.value}</p>
              </div>
            ))}
          </section>

          {/* ---------- Vista móvil: secciones con tarjetas ---------- */}
          <div className="space-y-6 md:hidden">
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Proyectos activos
              </h2>
              <div className="space-y-3">
                {activeProjects.map((p) => (
                  <div key={p.id} className="rounded-xl bg-white p-4 shadow-card">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-semibold text-slate-800">
                        <span className={`h-2.5 w-2.5 rounded-full ${progressColor[p.status]}`} />
                        {p.name}
                      </span>
                      <Badge label={p.status} />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                        <div
                          className={`h-1.5 rounded-full ${progressColor[p.status]}`}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="whitespace-nowrap text-xs text-slate-400">
                        {p.progress}% · {formatShortDate(p.dueDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Facturas recientes
              </h2>
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow-card"
                  >
                    <div>
                      <p className="text-xs text-slate-400">{inv.code}</p>
                      <p className="font-medium text-slate-700">{inv.concept}</p>
                    </div>
                    <div className="text-right">
                      <p className="tabular font-bold text-slate-800">${inv.amount.toLocaleString()}</p>
                      <Badge label={inv.status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ---------- Vista desktop: paneles ---------- */}
          <section className="hidden grid-cols-1 gap-6 md:grid lg:grid-cols-2">
            {/* Proyectos activos */}
            <div className="rounded-xl bg-white p-6 shadow-card">
              <h2 className="mb-4 font-semibold text-slate-800">Proyectos activos</h2>
              <ul className="space-y-5">
                {activeProjects.map((p) => (
                  <li key={p.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        <span className={`h-2.5 w-2.5 rounded-full ${progressColor[p.status]}`} />
                        {p.name}
                      </span>
                      <Badge label={p.status} />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${progressColor[p.status]}`}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="w-9 text-right text-xs text-slate-400">{p.progress}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Facturas recientes */}
            <div className="rounded-xl bg-white p-6 shadow-card">
              <h2 className="mb-4 font-semibold text-slate-800">Facturas recientes</h2>
              <ul className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs text-slate-400">{inv.code}</p>
                      <p className="font-medium text-slate-700">{inv.concept}</p>
                    </div>
                    <div className="text-right">
                      <p className="tabular font-bold text-slate-800">${inv.amount.toLocaleString()}</p>
                      <Badge label={inv.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tickets recientes */}
            <div className="rounded-xl bg-white p-6 shadow-card lg:col-span-2">
              <h2 className="mb-4 font-semibold text-slate-800">Tickets recientes</h2>
              <ul className="divide-y divide-slate-100">
                {tickets.slice(0, 3).map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400">{t.code}</span>
                      <span className="font-medium text-slate-700">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge label={t.priority} />
                      <Badge label={t.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// Esqueleto mientras cargan los datos.
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white p-5 shadow-card">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-8 w-10" />
          </div>
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-white p-4 shadow-card">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-3 w-full" />
        </div>
      ))}
    </div>
  );
}
