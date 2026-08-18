// Navegación inferior fija, visible solo en móvil (replica el bottom-nav del Figma).
import { NavLink } from 'react-router-dom';
import { FileTextIcon, FolderIcon, HomeIcon, TicketIcon, UserIcon } from './icons';

const items = [
  { to: '/dashboard', label: 'Inicio', icon: HomeIcon },
  { to: '/proyectos', label: 'Proyectos', icon: FolderIcon },
  { to: '/facturas', label: 'Facturas', icon: FileTextIcon },
  { to: '/tickets', label: 'Tickets', icon: TicketIcon },
  { to: '/perfil', label: 'Perfil', icon: UserIcon },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-slate-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-8 w-10 items-center justify-center rounded-lg ${
                  isActive ? 'bg-primary/10' : ''
                }`}
              >
                <Icon />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
