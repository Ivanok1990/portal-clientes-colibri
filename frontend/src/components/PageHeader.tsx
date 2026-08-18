// Cabecera de pantalla: título + subtítulo y campana de notificaciones.
import NotificationsBell from './NotificationsBell';

export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <NotificationsBell variant="light" />
    </header>
  );
}
