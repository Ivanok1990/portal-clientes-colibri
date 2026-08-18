// Middleware que protege las rutas privadas.
// Lee el JWT de la cookie httpOnly, lo verifica y adjunta el usuario a la request.
import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/jwt';
import { SessionUser } from '../types';

// Extendemos Request para tipar req.user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Sesión inválida o expirada' });
  }
}
