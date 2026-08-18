// Tickets: tabla en desktop, tarjetas en móvil, y modal "Nuevo ticket"
// (centrado en desktop, a pantalla completa en móvil), según el Figma.
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';
import Badge from '../components/Badge';
import { AlertTriangleIcon, TicketIcon, XIcon } from '../components/icons';
import PageHeader from '../components/PageHeader';
import Skeleton from '../components/Skeleton';
import StateMessage from '../components/StateMessage';
import { formatDate, formatShortDate } from '../lib/format';
import { Project, Ticket, TicketPriority } from '../types';

const priorities: TicketPriority[] = ['Alta', 'Media', 'Baja'];

// Color del control segmentado de prioridad cuando está seleccionado.
const prioritySelected: Record<TicketPriority, string> = {
  Alta: 'border-red-400 bg-red-50 text-red-600',
  Media: 'border-amber-400 bg-amber-50 text-amber-600',
  Baja: 'border-slate-400 bg-slate-100 text-slate-600',
};
const priorityDot: Record<TicketPriority, string> = {
  Alta: 'bg-red-500',
  Media: 'bg-amber-500',
  Baja: 'bg-slate-400',
};
const priorityText: Record<TicketPriority, string> = {
  Alta: 'text-red-600',
  Media: 'text-amber-600',
  Baja: 'text-slate-500',
};

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Estado del formulario.
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Media');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.getTickets(), api.getProjects()])
      .then(([t, p]) => {
        setTickets(t);
        setProjects(p);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setTitle('');
    setPriority('Media');
    setProjectName('');
    setDescription('');
    setFormError('');
  }

  function closeModal() {
    setShowModal(false);
    resetForm();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    if (title.trim() === '') {
      setFormError('El título es obligatorio');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        projectName: projectName || 'Sin proyecto',
      });
      setTickets((prev) => [created, ...prev]);
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo crear el ticket');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Tickets de soporte" subtitle="Gestiona tus solicitudes de soporte" />

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark sm:w-auto"
        >
          + Nuevo ticket
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-white shadow-card">
          <StateMessage
            icon={<AlertTriangleIcon size={22} />}
            title="No pudimos cargar tus tickets"
            detail="Revisa tu conexión e intenta de nuevo."
          />
        </div>
      )}

      {!error && !loading && tickets.length === 0 && (
        <div className="rounded-xl bg-white shadow-card">
          <StateMessage
            icon={<TicketIcon size={22} />}
            title="No tienes tickets todavía"
            detail="Crea uno con el botón “+ Nuevo ticket”."
          />
        </div>
      )}

      {/* ---------- Móvil: tarjetas ---------- */}
      {!error && (
        <div className="space-y-3 md:hidden">
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white p-4 shadow-card">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="mt-2 h-4 w-48" />
                <Skeleton className="mt-2 h-3 w-40" />
              </div>
            ))}

          {!loading &&
            tickets.map((t) => (
              <div key={t.id} className="rounded-xl bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">{t.code}</p>
                    <p className="mt-0.5 font-semibold text-slate-800">{t.title}</p>
                  </div>
                  <Badge label={t.status} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
                  <span className={`flex items-center gap-1 font-semibold ${priorityText[t.priority]}`}>
                    <span className={`h-2 w-2 rounded-full ${priorityDot[t.priority]}`} />
                    {t.priority}
                  </span>
                  <span>·</span>
                  <span>{t.projectName}</span>
                  <span>·</span>
                  <span>{formatShortDate(t.createdAt)}</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ---------- Desktop: tabla ---------- */}
      {!error && (
        <div className="hidden overflow-x-auto rounded-xl bg-white shadow-card md:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Título</th>
                <th className="px-6 py-4 font-semibold">Proyecto</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Prioridad</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-14" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))}

              {!loading &&
                tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-slate-400">{t.code}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{t.title}</td>
                    <td className="px-6 py-4 text-slate-600">{t.projectName}</td>
                    <td className="px-6 py-4"><Badge label={t.status} /></td>
                    <td className="px-6 py-4"><Badge label={t.priority} /></td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- Modal: crear ticket ---------- */}
      {showModal && (
        <div
          className="fixed inset-0 z-40 flex flex-col bg-white md:items-center md:justify-center md:bg-black/40 md:p-4"
          onClick={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full flex-col bg-white md:h-auto md:max-h-[90vh] md:w-full md:max-w-2xl md:rounded-xl md:shadow-xl"
          >
            {/* Header móvil (navy) */}
            <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white md:hidden">
              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Cerrar"
              >
                <XIcon size={18} />
              </button>
              <h2 className="text-lg font-bold">Nuevo ticket</h2>
            </div>

            {/* Header desktop */}
            <div className="hidden items-center justify-between p-6 pb-0 md:flex">
              <h2 className="text-lg font-bold text-slate-800">Crear nuevo ticket</h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 transition-colors hover:text-slate-600"
                aria-label="Cerrar"
              >
                <XIcon size={20} />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Título *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Describe brevemente el problema…"
                  autoFocus
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Prioridad</label>
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                        priority === p
                          ? prioritySelected[p]
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Proyecto</label>
                <select
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Selecciona un proyecto…</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Detalla el problema o solicitud con el mayor contexto posible…"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {formError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
              )}
            </div>

            {/* Pie con acciones */}
            <div className="border-t border-slate-100 p-4 md:p-6 md:pt-4">
              <div className="flex gap-3 md:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="hidden rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 md:block"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60 md:w-auto"
                >
                  {submitting ? 'Enviando…' : 'Enviar ticket'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
