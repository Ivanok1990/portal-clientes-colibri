// Ruta de facturas del cliente autenticado.
import { Router } from 'express';
import { getDataSource } from '../datasource';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// GET /api/invoices — facturas del cliente en sesión.
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const invoices = await getDataSource().getInvoices(req.user!.id);
    return res.json(invoices);
  } catch (err) {
    return next(err);
  }
});

export default router;
