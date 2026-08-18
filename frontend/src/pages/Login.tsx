// Pantalla de login. Replica el diseño del prototipo: card centrada sobre fondo navy.
import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('ana@empresa.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Si ya hay sesión, no mostramos el login.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-lg font-bold text-white">
            CP
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Bienvenido</h1>
          <p className="text-sm text-slate-500">Accede a tu portal de cliente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition-colors hover:text-slate-600"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? 'Ingresando…' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm text-primary">
            <a href="#" onClick={(e) => e.preventDefault()}>
              ¿Olvidaste tu contraseña?
            </a>
          </p>
        </form>

        <p className="mt-6 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-400">
          Demo: ana@empresa.com / password123
        </p>
      </div>
    </div>
  );
}
