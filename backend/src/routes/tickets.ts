// Rutas de tickets: listar y crear.
import { Router } from 'express';
import { getDataSource, TicketPriority } from '../datasource';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

const PRIORITIES: TicketPriority[] = ['Alta', 'Media', 'Baja'];

// GET /api/tickets — tickets del cliente en sesión (más recientes primero).
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const tickets = await getDataSource().getTickets(req.user!.id);
    return res.json(tickets);
  } catch (err) {
    return next(err);
  }
});

// POST /api/tickets — crea un ticket nuevo.
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, description, priority, projectName } = req.body ?? {};

    if (!title || String(title).trim() === '') {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    const safePriority: TicketPriority = PRIORITIES.includes(priority) ? priority : 'Media';

    const ticket = await getDataSource().createTicket({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      priority: safePriority,
      projectName: projectName ? String(projectName) : 'Sin proyecto',
      clientId: req.user!.id,
    });

    return res.status(201).json(ticket);
  } catch (err) {
    return next(err);
  }
});

export default router;
