// Ruta de notificaciones del cliente autenticado.
import { Router } from 'express';
import { getDataSource } from '../datasource';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// GET /api/notifications — notificaciones del cliente en sesión.
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const notifications = await getDataSource().getNotifications(req.user!.id);
    return res.json(notifications);
  } catch (err) {
    return next(err);
  }
});

export default router;
