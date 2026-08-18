// Ruta de proyectos del cliente autenticado.
import { Router } from 'express';
import { getDataSource } from '../datasource';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// GET /api/projects — proyectos del cliente en sesión.
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const projects = await getDataSource().getProjects(req.user!.id);
    return res.json(projects);
  } catch (err) {
    return next(err);
  }
});

export default router;
