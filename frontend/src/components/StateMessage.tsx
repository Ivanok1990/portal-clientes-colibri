// Mensaje para estados vacíos o de error dentro de una tarjeta/tabla.
import { ReactNode } from 'react';

export default function StateMessage({
  icon,
  title,
  detail,
}: {
  icon: ReactNode;
  title: string;
  detail?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon}
      </span>
      <p className="font-medium text-slate-600">{title}</p>
      {detail && <p className="mt-1 text-sm text-slate-400">{detail}</p>}
    </div>
  );
}
