import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../config/jwt';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    // Accept mock tokens for testing only in non-production environments
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (nodeEnv !== 'production' && token.startsWith('mock-jwt-token-')) {
      const userId = token.replace('mock-jwt-token-', '');
      req.user = { userId, email: 'mock@example.com', role: 'player' };
      return next();
    }

    // Real JWT verification
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error: any) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    return next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requirePlayer = requireRole(['player', 'admin']);
