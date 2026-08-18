// Proyectos: tabla en desktop, tarjetas en móvil (según el Figma).
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Badge from '../components/Badge';
import { AlertTriangleIcon, ChevronRightIcon, FolderIcon } from '../components/icons';
import PageHeader from '../components/PageHeader';
import Skeleton from '../components/Skeleton';
import StateMessage from '../components/StateMessage';
import { formatDate, formatShortDate } from '../lib/format';
import { Project, ProjectStatus } from '../types';

const dotColor: Record<ProjectStatus, string> = {
  'En progreso': 'bg-blue-500',
  'En revisión': 'bg-amber-500',
  'Planificación': 'bg-purple-500',
  Completado: 'bg-slate-400',
};

export default function Proyectos() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .getProjects()
      .then(setProjects)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Mis proyectos" subtitle="Estado y avance de todos tus proyectos" />

      {error && (
        <div className="rounded-xl bg-white shadow-card">
          <StateMessage
            icon={<AlertTriangleIcon size={22} />}
            title="No pudimos cargar tus proyectos"
            detail="Revisa tu conexión e intenta de nuevo."
          />
        </div>
      )}

      {!error && !loading && projects.length === 0 && (
        <div className="rounded-xl bg-white shadow-card">
          <StateMessage icon={<FolderIcon size={22} />} title="Aún no tienes proyectos" />
        </div>
      )}

      {/* ---------- Móvil: tarjetas ---------- */}
      {!error && (
        <div className="space-y-3 md:hidden">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white p-4 shadow-card">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-3 h-3 w-full" />
              </div>
            ))}

          {!loading &&
            projects.map((p) => (
              <div key={p.id} className="rounded-xl bg-white p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold text-slate-800">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColor[p.status]}`} />
                    {p.name}
                  </span>
                  <ChevronRightIcon size={18} className="text-slate-300" />
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Badge label={p.status} />
                  <span className="text-sm text-slate-400">
                    Vence {formatShortDate(p.dueDate)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                    <div
                      className={`h-1.5 rounded-full ${dotColor[p.status]}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-xs text-slate-400">{p.progress}%</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ---------- Desktop: tabla ---------- */}
      {!error && (
        <div className="hidden overflow-x-auto rounded-xl bg-white shadow-card md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-4 font-semibold">Proyecto</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Responsable</th>
                <th className="px-6 py-4 font-semibold">Fecha límite</th>
                <th className="px-6 py-4 font-semibold">Avance</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                  </tr>
                ))}

              {!loading &&
                projects.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 font-semibold text-slate-800">
                        <span className={`h-2.5 w-2.5 rounded-full ${dotColor[p.status]}`} />
                        {p.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge label={p.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">{p.owner}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(p.dueDate)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-28 rounded-full bg-slate-100">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${dotColor[p.status]}`}
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-xs text-slate-400">{p.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
