// Perfil del cliente. Accesible desde la pestaña "Perfil" del bottom-nav en móvil;
// también funciona en desktop.
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

export default function Perfil() {
  const { user, logout } = useAuth();

  return (
    <div>
      <PageHeader title="Perfil" subtitle="Datos de tu cuenta" />

      <div className="rounded-xl bg-white p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/80 text-xl font-semibold text-white">
            {user?.name?.charAt(0) ?? 'U'}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
          <div className="flex justify-between py-3 text-sm">
            <dt className="text-slate-500">Empresa</dt>
            <dd className="font-medium text-slate-700">{user?.company}</dd>
          </div>
          <div className="flex justify-between py-3 text-sm">
            <dt className="text-slate-500">Correo</dt>
            <dd className="font-medium text-slate-700">{user?.email}</dd>
          </div>
        </dl>

        <button
          onClick={logout}
          className="mt-6 w-full rounded-lg border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
