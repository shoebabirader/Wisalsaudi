import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'buyer' | 'seller' | 'admin';
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          messageAr: 'المصادقة مطلوبة',
        },
      });
      return;
    }

    const decoded = verifyToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as 'buyer' | 'seller' | 'admin',
    };
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
        messageAr: 'رمز غير صالح أو منتهي الصلاحية',
      },
    });
  }
}

export function requireRole(...roles: Array<'buyer' | 'seller' | 'admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          messageAr: 'المصادقة مطلوبة',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          messageAr: 'صلاحيات غير كافية',
        },
      });
      return;
    }

    next();
  };
}
