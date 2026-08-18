// Definición de rutas de la aplicación.
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Facturas from './pages/Facturas';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Proyectos from './pages/Proyectos';
import Tickets from './pages/Tickets';

export default function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<Login />} />

      {/* Privadas: comparten el Layout con sidebar */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/facturas" element={<Facturas />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>

      {/* Por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
