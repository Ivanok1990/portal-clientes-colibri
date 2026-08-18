// Layout principal de las pantallas privadas.
// Desktop: sidebar lateral (marca + usuario + menú). Móvil: navegación inferior.
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';
import { FileTextIcon, FolderIcon, GridIcon, LogOutIcon, TicketIcon } from './icons';

const menu = [
  { to: '/dashboard', label: 'Dashboard', icon: GridIcon },
  { to: '/proyectos', label: 'Proyectos', icon: FolderIcon },
  { to: '/facturas', label: 'Facturas', icon: FileTextIcon },
  { to: '/tickets', label: 'Tickets', icon: TicketIcon },
];

const iconSize = 18;

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar — solo desktop (fijo a la altura de la pantalla para que el
          botón de cerrar sesión siempre quede visible aunque la página sea larga) */}
      <aside className="hidden bg-navy text-slate-200 md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-light font-bold text-white">
            CP
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-white">ClientPortal</p>
            <p className="text-xs text-slate-400">v1.0 · Demo</p>
          </div>
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/70 text-sm font-semibold text-white">
            {user?.name?.charAt(0) ?? 'U'}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        {/* Menú */}
        <nav className="flex-1 px-3 py-4">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Menú principal
          </p>
          <ul className="flex flex-col gap-1">
            {menu.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-white/5'
                    }`
                  }
                >
                  <Icon size={iconSize} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
          >
            <LogOutIcon size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 bg-slate-100 px-4 py-5 pb-24 md:px-8 md:py-6 md:pb-6">
        <Outlet />
      </main>

      {/* Navegación inferior — solo móvil */}
      <BottomNav />
    </div>
  );
}
