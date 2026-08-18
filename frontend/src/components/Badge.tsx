// Badge de estado reutilizable. El color se deriva del texto del estado/prioridad,
// replicando los colores del prototipo de Figma.

type Tone = 'blue' | 'orange' | 'purple' | 'green' | 'red' | 'gray';

const toneClasses: Record<Tone, string> = {
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-amber-100 text-amber-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-slate-200 text-slate-600',
};

// Mapea cada valor de estado/prioridad a un color.
const labelTone: Record<string, Tone> = {
  // Proyectos
  'En progreso': 'blue',
  'En revisión': 'orange',
  'Planificación': 'purple',
  Completado: 'green',
  // Facturas
  Pendiente: 'orange',
  Vencida: 'red',
  Pagada: 'green',
  // Tickets
  Abierto: 'red',
  'En proceso': 'blue',
  Resuelto: 'green',
  // Prioridad
  Alta: 'red',
  Media: 'orange',
  Baja: 'gray',
};

export default function Badge({ label }: { label: string }) {
  const tone = labelTone[label] ?? 'gray';
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
