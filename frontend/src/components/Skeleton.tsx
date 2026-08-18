// Bloque de carga (skeleton). Se muestra mientras llegan los datos del backend,
// para que la espera se sienta ágil en lugar de una pantalla vacía.
export default function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}
