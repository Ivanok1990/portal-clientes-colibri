// Facturas: estado de cobro del cliente. Tabla en desktop, tarjetas en móvil.
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Badge from '../components/Badge';
import { AlertTriangleIcon, FileTextIcon } from '../components/icons';
import PageHeader from '../components/PageHeader';
import Skeleton from '../components/Skeleton';
import StateMessage from '../components/StateMessage';
import { formatDate, formatShortDate } from '../lib/format';
import { Invoice } from '../types';

// Formatea un monto como moneda ($3,200).
function formatAmount(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

export default function Facturas() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .getInvoices()
      .then(setInvoices)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Total por cobrar: suma de las facturas que aún no están pagadas.
  const pending = invoices.filter((i) => i.status !== 'Pagada');
  const pendingTotal = pending.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div>
      <PageHeader title="Mis facturas" subtitle="Estado de cobro de tus facturas" />

      {/* Resumen de saldo pendiente */}
      {!loading && !error && invoices.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-5 shadow-card">
          <div>
            <p className="text-sm text-slate-500">Total pendiente de pago</p>
            <p className="tabular mt-1 text-2xl font-bold text-slate-800">
              {formatAmount(pendingTotal)}
            </p>
          </div>
          <p className="text-sm text-slate-500">
            {pending.length} de {invoices.length} facturas sin pagar
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-white shadow-card">
          <StateMessage
            icon={<AlertTriangleIcon size={22} />}
            title="No pudimos cargar tus facturas"
            detail="Revisa tu conexión e intenta de nuevo."
          />
        </div>
      )}

      {!error && !loading && invoices.length === 0 && (
        <div className="rounded-xl bg-white shadow-card">
          <StateMessage icon={<FileTextIcon size={22} />} title="Aún no tienes facturas" />
        </div>
      )}

      {/* ---------- Móvil: tarjetas ---------- */}
      {!error && (
        <div className="space-y-3 md:hidden">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white p-4 shadow-card">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-4 w-44" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
            ))}

          {!loading &&
            invoices.map((inv) => (
              <div key={inv.id} className="rounded-xl bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">{inv.code}</p>
                    <p className="mt-0.5 font-semibold text-slate-800">{inv.concept}</p>
                  </div>
                  <p className="tabular font-bold text-slate-800">{formatAmount(inv.amount)}</p>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Badge label={inv.status} />
                  <span className="text-sm text-slate-400">
                    Emitida {formatShortDate(inv.issueDate)}
                  </span>
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
                <th className="px-6 py-4 font-semibold">Factura</th>
                <th className="px-6 py-4 font-semibold">Concepto</th>
                <th className="px-6 py-4 font-semibold">Fecha de emisión</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 text-right font-semibold">Monto</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-44" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="ml-auto h-4 w-16" /></td>
                  </tr>
                ))}

              {!loading &&
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-slate-400">{inv.code}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{inv.concept}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(inv.issueDate)}</td>
                    <td className="px-6 py-4"><Badge label={inv.status} /></td>
                    <td className="tabular px-6 py-4 text-right font-bold text-slate-800">
                      {formatAmount(inv.amount)}
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
