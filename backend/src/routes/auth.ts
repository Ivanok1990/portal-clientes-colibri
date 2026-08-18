// Rutas de autenticación: login, logout y usuario actual.
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { getDataSource } from '../datasource';
import { signToken } from '../lib/jwt';
import { requireAuth } from '../middleware/requireAuth';
import { SessionUser } from '../types';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    const client = await getDataSource().findClientByEmail(String(email));

    // Comparamos la contraseña contra el hash almacenado.
    const passwordOk = client ? await bcrypt.compare(String(password), client.password) : false;
    if (!client || !passwordOk) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user: SessionUser = {
      id: client.id,
      name: client.name,
      email: client.email,
      company: client.company,
    };

    const token = signToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // en producción: true (HTTPS)
      maxAge: 2 * 60 * 60 * 1000, // 2h
    });

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Sesión cerrada' });
});

// GET /api/auth/me — devuelve el usuario de la sesión actual.
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

export default router;
