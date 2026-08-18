// Campana de notificaciones con contador de no leídas y dropdown.
// `variant` adapta el botón para fondo claro (desktop) u oscuro (header móvil navy).
import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { Notification } from '../types';
import { BellIcon } from './icons';

export default function NotificationsBell({
  variant = 'light',
}: {
  variant?: 'light' | 'dark';
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(() => setNotifications([]));
  }, []);

  // Cierra el dropdown al hacer clic fuera.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const buttonClass =
    variant === 'dark'
      ? 'bg-white/10 text-white hover:bg-white/20'
      : 'border border-slate-200 bg-white text-slate-500 shadow-card hover:text-slate-700';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative rounded-lg p-2.5 transition-colors ${buttonClass}`}
        aria-label="Notificaciones"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white text-left shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
            Notificaciones
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-400">
                No tienes notificaciones
              </li>
            )}
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex gap-3 border-b border-slate-50 px-4 py-3 text-sm ${
                  n.read ? 'text-slate-500' : 'text-slate-700'
                }`}
              >
                {!n.read && (
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                )}
                <div className={n.read ? 'pl-5' : ''}>
                  <p>{n.message}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{n.createdAt}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
