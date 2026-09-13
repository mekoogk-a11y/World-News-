import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db, verifyPassword, hashPassword } from '../db/database';
import { User } from '../types';

export interface AuthSession {
  token: string;
  userId: string;
  email: string;
  role: string;
  name: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory active sessions mapping token -> AuthSession
const activeSessions = new Map<string, AuthSession>();

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function createSession(user: User): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: AuthSession = {
    token,
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  activeSessions.set(token, session);
  db.users.updateLastLogin(user.email);
  return token;
}

export function getSession(token: string): AuthSession | null {
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session;
}

export function revokeSession(token: string): boolean {
  return activeSessions.delete(token);
}

// Express middleware for protected Super Admin routes
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-admin-token'] as string);

  if (!token) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'يتطلب الوصول إلى لوحة التحكم تسجيل دخول المدير الرئيسي ببيانات اعتماد صحيحة.',
    });
    return;
  }

  const session = getSession(token);
  if (!session || session.email.toLowerCase() !== 'mekoogk@gmail.com' || session.role !== 'super_admin') {
    res.status(403).json({
      error: 'FORBIDDEN',
      message: 'غير مصرح: هذه العملية محصورة للمدير الرئيسي (Super Admin) فقط.',
    });
    return;
  }

  // Attach authenticated user to request
  (req as any).user = session;
  next();
}

// Helper to authenticate user credentials
export function authenticateUser(email: string, password: string): { success: boolean; token?: string; user?: User; error?: string } {
  const user = db.users.findByEmail(email);
  if (!user) {
    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
  }

  const token = createSession(user);
  const { passwordHash, salt, ...safeUser } = user;
  return { success: true, token, user: safeUser };
}

// Helper to set or reset super admin password securely
export function setSuperAdminPassword(newPassword: string): boolean {
  if (!newPassword || newPassword.length < 8) {
    return false;
  }
  const { hash, salt } = hashPassword(newPassword);
  return db.users.updatePassword('mekoogk@gmail.com', hash, salt);
}
