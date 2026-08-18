// Cliente de API centralizado. Todas las llamadas al backend pasan por aquí.
// `credentials: 'include'` asegura que la cookie httpOnly de sesión viaje en cada request.
import {
  Invoice,
  NewTicketInput,
  Notification,
  Project,
  Ticket,
  User,
} from '../types';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = 'Ocurrió un error';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new Error(message);
  }

  // Algunas respuestas (logout) pueden no traer cuerpo relevante.
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  me: () => request<{ user: User }>('/auth/me'),

  // Recursos
  getProjects: () => request<Project[]>('/projects'),
  getInvoices: () => request<Invoice[]>('/invoices'),
  getTickets: () => request<Ticket[]>('/tickets'),
  getNotifications: () => request<Notification[]>('/notifications'),
  createTicket: (input: NewTicketInput) =>
    request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
