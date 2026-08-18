// Helpers para firmar y verificar el JWT de sesión.
import jwt from 'jsonwebtoken';
import { SessionUser } from '../types';

// En producción esto vendría de una variable de entorno segura.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-portal-colibri';
const EXPIRES_IN = '2h';

export function signToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): SessionUser {
  return jwt.verify(token, JWT_SECRET) as SessionUser;
}
